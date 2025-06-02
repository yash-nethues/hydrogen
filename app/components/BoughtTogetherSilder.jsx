import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Image, Money } from '@shopify/hydrogen';


function BoughtTogetherSilder({arrivalsCollection}) {
   
    return (
        <div className="w-4/6 relative">
            <h2 className='text-blue text-34 font-normal mb-j15'>Frequently Bought Together:</h2>
            <div className='pr-10 pl-8'>
                <Swiper
                    className="mySwiper mt-5"
                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                    spaceBetween={10}
                    navigation={{ nextEl: '.pf_arrow-right', prevEl: '.pf_arrow-left' }}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                    slidesPerView={4}
                    breakpoints={{
                    1440: {
                        slidesPerView: 4,
                    },
                    1200: {
                        slidesPerView: 4,
                    },
                    992: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    }}
                >
                {arrivalsCollection?.products?.edges?.map((product, index) => (
                    <SwiperSlide key={index}>
                        <div className="flex flex-wrap justify-center border p-5">
                        <img className="w-auto max-w-full h-60 object-fill" src={product.node.featuredImage.url} alt={product.node.title} />
                        <div className='block'>
                        <span className='text-sm no-underline hover:underline'>
                            <a className="product-item-link hover:underline" href={`/products/${product.node.handle}`}>
                                {product.node.title}
                            </a>
                        </span>
                        <p className="minimal-price">
                        <span className="text-brand text-sm mt-2 block">Starting At:</span>
                        <span className="text-brand pl-4  font-bold">$11.53</span>
                        </p>
                        </div>
                        </div>
                    </SwiperSlide>
                ))}
                </Swiper>
                <button className="pf_arrow-left arrow swiper-button-prev"></button>
                <button className="pf_arrow-right arrow swiper-button-next mr-0 right-2"></button>
            </div>
        </div>
    )
}
export default BoughtTogetherSilder