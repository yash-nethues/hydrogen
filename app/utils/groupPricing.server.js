export function isGroupProduct(product) {
  const productTypeMetafield = product?.metafields?.find((metafield) => metafield && metafield.key === 'select_product_type');
  return productTypeMetafield?.value === 'Grouped Product';
}

export function parseChildProductIds(product) {
  const childProductsMetafield = product?.metafields?.find((metafield) => metafield && metafield.key === 'child_products');
  if (!childProductsMetafield) return [];
  const raw = childProductsMetafield.value;
  const isGid = (v) => typeof v === 'string' && /^gid:\/\/shopify\//.test(v.trim());

  // If already an array
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === 'object' && v && v.id ? v.id : v))
      .filter((v) => isGid(v));
  }

  if (typeof raw === 'string') {
    let trimmed = raw.trim().replace(/&quot;/g, '"').replace(/&#34;/g, '"');
    // Unwrap quotes if present
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      trimmed = trimmed.slice(1, -1);
    }

    // Try JSON.parse directly
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((v) => (typeof v === 'object' && v && v.id ? v.id : v))
          .filter((v) => isGid(v));
      }
      if (parsed && parsed.id && isGid(parsed.id)) return [parsed.id];
    } catch {}

    // Try parsing single-quote arrays
    try {
      const sq = trimmed.replace(/'/g, '"');
      const parsedSq = JSON.parse(sq);
      if (Array.isArray(parsedSq)) {
        return parsedSq
          .map((v) => (typeof v === 'object' && v && v.id ? v.id : v))
          .filter((v) => isGid(v));
      }
      if (parsedSq && parsedSq.id && isGid(parsedSq.id)) return [parsedSq.id];
    } catch {}

    // Single gid string
    if (isGid(trimmed)) return [trimmed];

    // Bracketed list without quotes: [gid://..., gid://...]
    const bracket = trimmed.replace(/^\[|\]$/g, '');
    const splitCandidates = bracket.split(/\s*,\s*|\s+/).filter(Boolean);
    const fromSplit = splitCandidates.filter((v) => isGid(v));
    if (fromSplit.length) return fromSplit;

    // Fallback: extract all gid substrings
    const regexMatches = trimmed.match(/gid:\/\/shopify\/[A-Za-z]+\/[0-9]+/g);
    if (regexMatches && regexMatches.length) return regexMatches;

    return [];
  }

  if (typeof raw === 'object' && raw.id && isGid(raw.id)) return [raw.id];
  return [];
}

export const CHILD_PRODUCTS_PRICE_QUERY = `#graphql
  query ChildProductsPrice($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
      }
    }
  }
`;

export async function fetchGroupProductPriceRange(context, product) {
  if (!isGroupProduct(product)) {
    return product.priceRange;
  }
  const childProductIds = parseChildProductIds(product);
  if (childProductIds.length === 0) {
    return product.priceRange;
  }
  try {
    const childProductsResponse = await context.storefront.query(CHILD_PRODUCTS_PRICE_QUERY, { variables: { ids: childProductIds } });
    const childProducts = childProductsResponse?.nodes || [];
    if (childProducts.length === 0) {
      return product.priceRange;
    }
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let currencyCode = 'USD';
    childProducts.forEach((childProduct) => {
      if (!childProduct?.priceRange) return;
      const childMinPrice = parseFloat(childProduct.priceRange.minVariantPrice?.amount ?? 'NaN');
      const childMaxPrice = parseFloat(childProduct.priceRange.maxVariantPrice?.amount ?? 'NaN');
      // Ignore zero/invalid prices. We only want meaningful prices.
      const validMin = Number.isFinite(childMinPrice) && childMinPrice > 0;
      const validMax = Number.isFinite(childMaxPrice) && childMaxPrice > 0;
      if (validMin && childMinPrice < minPrice) {
        minPrice = childMinPrice;
        currencyCode = childProduct.priceRange.minVariantPrice?.currencyCode || currencyCode || 'USD';
      }
      if (validMax && childMaxPrice > maxPrice) {
        maxPrice = childMaxPrice;
      }
    });
    if (minPrice === Infinity || maxPrice === -Infinity) {
      return product.priceRange;
    }
    // Normalize to the same shape Remix/Hydrogen expects throughout the app
    return {
      minVariantPrice: { amount: String(minPrice), currencyCode },
      maxVariantPrice: { amount: String(maxPrice), currencyCode },
    };
  } catch (error) {
    console.error('Error fetching child product prices:', error);
    return product.priceRange;
  }
}

export function formatGroupProductPrice(product) {
  if (!isGroupProduct(product)) {
    return product.priceRange?.minVariantPrice;
  }
  const minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
  const maxPrice = parseFloat(product.priceRange.maxVariantPrice.amount);
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;
  if (minPrice === maxPrice) {
    return { amount: minPrice.toString(), currencyCode };
  }
  return { amount: `${minPrice} - ${maxPrice}`, currencyCode };
}

