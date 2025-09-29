import React from 'react';
import ProductsTabs from '~/components/ProductsTabs';

export default function HomeProductsTabs({ products }) {
  if (!products) return null;
  return <ProductsTabs products={products} />;
}




