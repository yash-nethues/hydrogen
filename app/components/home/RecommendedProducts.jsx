import React, { Suspense } from 'react';
import { Await, Link } from '@remix-run/react';
import { Image, Money } from '@shopify/hydrogen';

export default function RecommendedProducts({ products, title, formatGroupProductPrice }) {
  return (
    <div className="container mt-[50px] md:px-10 2xl:px-[60px]  -order-1 md:order-none">
      <div className="recommended-products [&_.recommended-item:not(:nth-child(-n+3))]:max-[767px]:hidden max-[767px]:-mx-5 bg-themegray p-2.5 tb:p-10">
        <div className='text-center'>
          <h2 className="flex justify-center text-center font-semibold text-blue text-25 md:text-34 mb-j30 center">{title}</h2>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={products}>
            {(response) => {
              const filteredProducts = response?.products?.nodes?.filter((product) => {
                if (!product.metafields || !Array.isArray(product.metafields)) return false;
                const jtabMetafield = product.metafields.find(metafield => metafield && metafield.key === 'jtab');
                if (!jtabMetafield) return false;
                let jtabValues = [];
                try { jtabValues = JSON.parse(jtabMetafield.value); } catch { jtabValues = [jtabMetafield.value]; }
                return jtabValues.includes(title);
              }) || [];

              const maxProducts = title === "The Finest Supplies Created For Artists" ? 5 : 12;
              const limitedProducts = filteredProducts.slice(0, maxProducts);

              return (
                <div className="flex w-full border-dashed  border-gray border border-r-0 rounded">
                  {limitedProducts.length > 0 ? (
                    limitedProducts.map((product) => (
                      <div className='recommended-item recommended_box relative bg-white p-2.5 pb-[45px] md:pb-[35px] lg:p-5 lg:pb-10 border-dashed  border-gray border-r w-1/3 md:w-1/4'  key={product.id}>
                        <span className='absolute top-2.5 left-2.5 max-[479px]:top-j5 max-[479px]:left-j5 bg-themeteal text-white font-semibold tb:font-bold py-[3px] px-2 text-xs  max-[479px]:text-10 leading-normal tb:text-sm rounded-sm uppercase'> TOP CHOICE </span>
                        <Link key={product.id} className="recommended-product" to={`/products/${product.handle}`}>
                          <figure className="mb-2.5 pb-0">
                            <Image data={product.images.nodes[0]} aspectRatio="1/1" sizes="(min-width: 45em) 20vw, 50vw" />
                          </figure>
                          <div className='text-center'>
                            <h4 className='font-semibold text-base max-[479px]:text-10 mb-0 !leading-normal text-base-500'>{product.title}</h4>
                            <small className='text-xs max-[479px]:text-13 mt-j5 tb:text-15 font-semibold text-brand-300 flex justify-center gap-2'>
                              Only: <Money data={formatGroupProductPrice(product)} />
                            </small>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-8">
                      <p className="text-gray-500">No products found for this category.</p>
                    </div>
                  )}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}



