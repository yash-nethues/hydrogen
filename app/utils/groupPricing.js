export function isGroupProduct(product) {
  const productTypeMetafield = product?.metafields?.find((metafield) => metafield && metafield.key === 'select_product_type');
  return productTypeMetafield?.value === 'Grouped Product';
}

export function formatGroupProductPrice(product) {
  if (!isGroupProduct(product)) {
    return product.priceRange?.minVariantPrice;
  }
  const minAmount = Number.parseFloat(product?.priceRange?.minVariantPrice?.amount ?? 'NaN');
  const maxAmount = Number.parseFloat(product?.priceRange?.maxVariantPrice?.amount ?? 'NaN');
  const currencyCode = product?.priceRange?.minVariantPrice?.currencyCode || product?.priceRange?.maxVariantPrice?.currencyCode || 'USD';
  if (!Number.isFinite(minAmount) || !Number.isFinite(maxAmount)) {
    // Fallback to non-grouped min to avoid showing 0
    return product.priceRange?.minVariantPrice || { amount: '0', currencyCode };
  }
  if (minAmount === maxAmount) {
    return { amount: String(minAmount), currencyCode };
  }
  return { amount: `${minAmount} - ${maxAmount}`, currencyCode };
}



