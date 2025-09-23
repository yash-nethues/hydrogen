export function isGroupProduct(product) {
  const productTypeMetafield = product?.metafields?.find((metafield) => metafield && metafield.key === 'select_product_type');
  return productTypeMetafield?.value === 'Grouped Product';
}

export function parseChildProductIds(product) {
  const childProductsMetafield = product?.metafields?.find((metafield) => metafield && metafield.key === 'child_products');
  if (!childProductsMetafield) return [];
  try {
    return JSON.parse(childProductsMetafield.value);
  } catch {
    return [];
  }
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
      if (childProduct?.priceRange) {
        const childMinPrice = parseFloat(childProduct.priceRange.minVariantPrice?.amount || '0');
        const childMaxPrice = parseFloat(childProduct.priceRange.maxVariantPrice?.amount || '0');
        if (childMinPrice < minPrice) {
          minPrice = childMinPrice;
          currencyCode = childProduct.priceRange.minVariantPrice?.currencyCode || 'USD';
        }
        if (childMaxPrice > maxPrice) {
          maxPrice = childMaxPrice;
        }
      }
    });
    if (minPrice === Infinity || maxPrice === -Infinity) {
      return product.priceRange;
    }
    return {
      minVariantPrice: { amount: minPrice.toString(), currencyCode },
      maxVariantPrice: { amount: maxPrice.toString(), currencyCode },
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

