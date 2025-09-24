import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Image, Money } from '@shopify/hydrogen';
import { useIsClient } from "~/hooks/useIsClient";


function ArtistsViewedPDSlider({products}) {
    const items = Array.isArray(products) ? products.filter((p) => p && p.handle) : [];
    const isClient = useIsClient();
    if (!isClient || items.length === 0) return null;
    return (
        <div className='w-full relative'>
            <h2 className='text-blue text-34 font-normal mb-j15'>Artists Also Viewed These Supplies</h2>
            <div className='pr-10 pl-8'>
                <Swiper
                    className="mySwiper mt-5"
                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                    spaceBetween={10}
                    navigation={{ nextEl: '.av_pf_arrow-right', prevEl: '.av_pf_arrow-left' }}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                    slidesPerView={5}
                    breakpoints={{
                    1440: {
                        slidesPerView: 5,
                    },
                    1200: {
                        slidesPerView: 5,
                    },
                    992: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    }}
                >
                {items.map((product, index) => (
                    <SwiperSlide key={index}>
                        <div className="flex flex-wrap justify-center border p-5">
                        {product?.featuredImage?.url ? (
                          <img className="w-auto max-w-full h-60 object-fill" src={product.featuredImage.url} alt={product.title} />
                        ) : (
                          <div className="text-xs text-gray-500 p-4 text-center w-full h-60 flex items-center justify-center">No Image</div>
                        )}
                        <div className='block'>
                        <span className='text-sm no-underline hover:underline'>
                            {product.handle ? (
                              <a className="product-item-link hover:underline" href={`/products/${product.handle}`}>
                                  {product.title}
                              </a>
                            ) : (
                              <span>{product.title}</span>
                            )}
                        </span>
                        <p className="minimal-price">
                        <span className="text-brand text-sm mt-2 block">Starting At:</span>
                        <span className="text-brand pl-4  font-bold">
                          {product?.groupPriceRange ? (
                            <>
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.groupPriceRange.currencyCode || 'USD' }).format(product.groupPriceRange.min)}
                              {product.groupPriceRange.max !== product.groupPriceRange.min && (
                                <> - {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.groupPriceRange.currencyCode || 'USD' }).format(product.groupPriceRange.max)}</>
                              )}
                            </>
                          ) : (
                            <Money data={product.priceRange?.minVariantPrice} />
                          )}
                        </span>
                        </p>
                        </div>
                        </div>
                    </SwiperSlide>
                    
                ))}
                </Swiper>
                <button className="av_pf_arrow-left arrow swiper-button-prev"></button>
                <button className="av_pf_arrow-right arrow swiper-button-next mr-0 right-2"></button>
            </div>
        </div>
    )
}
export default ArtistsViewedPDSlider