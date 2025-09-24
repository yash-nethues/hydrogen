export function isGroupProduct(product) {
  const productTypeMetafield = product?.metafields?.find((metafield) => metafield && metafield.key === 'select_product_type');
  return productTypeMetafield?.value === 'Grouped Product';
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



