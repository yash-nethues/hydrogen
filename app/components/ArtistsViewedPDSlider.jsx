import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Image, Money } from '@shopify/hydrogen';


function ArtistsViewedPDSlider({products}) {
    const items = Array.isArray(products) ? products.filter(Boolean) : [];
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
                        <img className="w-auto max-w-full h-60 object-fill" src={product.featuredImage?.url} alt={product.title} />
                        <div className='block'>
                        <span className='text-sm no-underline hover:underline'>
                            <a className="product-item-link hover:underline" href={`/products/${product.handle}`}>
                                {product.title}
                            </a>
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