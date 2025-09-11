import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Image, Money } from '@shopify/hydrogen';

function RelatedSet({products}) {
    const items = Array.isArray(products) ? products.filter(Boolean) : [];
    if (items.length === 0) return null;
    return (
        <div className="w-1/3 relative pr-2">
            <h2 className='text-blue text-34 font-normal mb-j15 '>Shop Related Sets</h2>
            <div className='pl-5'>
            <Swiper
            className="mySwiper mt-5"
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={0}
            navigation={{ nextEl: '.ps_arrow-right', prevEl: '.ps_arrow-left' }}
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            slidesPerView={2}
            breakpoints={{
                1440: {
                slidesPerView: 2,
                },
                1200: {
                slidesPerView: 2,
                },
                992: {
                slidesPerView: 2,
                },
                767: {
                slidesPerView: 1,
                },

            }}
            >
            {items.slice(0, 2).map((product, index) => (
                <SwiperSlide key={index}>
                <div className="flex flex-wrap justify-center border p-5 mr-3">
                    <img className="w-auto max-w-full h-60 object-fil" src={product.featuredImage?.url} alt={product.title} />
                    <div className='block'>
                    <span className='text-sm no-underline hover:underline'>
                        <a className="product-item-link hover:underline" href={`/products/${product.handle}`}>
                            {product.title}
                        </a>
                    </span>
                    <p className="minimal-price">
                        <span className="text-brand text-sm mt-2 block">Starting At:</span>
                        <span className="text-brand pl-4 font-bold">
                          <Money data={product.priceRange?.minVariantPrice} />
                        </span>
                    </p>
                    </div>
                </div>
                </SwiperSlide>
            ))}
            </Swiper>
            {/*<button className="ps_arrow-left mt-0  arrow swiper-button-prev"></button>
            <button className="ps_arrow-right mt-0  arrow swiper-button-next "></button>*/}
            </div>
        </div>
    )
}
export default RelatedSet