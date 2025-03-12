import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Image, Money } from '@shopify/hydrogen';
//import 'swiper/css/navigation';


function ArtistCollection({artistCollection}) {
   
    return (
        <div className="tab-container">
            <div className="tab_slider flex gap-10 pl-10 pr-10 relative">
                     <Swiper
                            modules={[Navigation, Pagination, Scrollbar, A11y]}
                            spaceBetween={50}
                            navigation={{ nextEl: ".a_arrow-right", prevEl: ".a_arrow-left" }}
                            pagination={{ clickable: true }}
                            scrollbar={{ draggable: true }}
                            slidesPerView={5} 
                            breakpoints={{
                             1440: {
                                slidesPerView: 5,
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

                    return (
                    {artistCollection?.products?.edges?.map((product, index) => (
                        <SwiperSlide key={index}>
                            <div className="slider-item">
                                <figure>
                                    <img
                                        src={product.node.featuredImage.url}
                                        alt={product.node.title}
                                        className="w-full h-full object-cover"
                                    />
                                </figure>
                                <div className="info text-center">
                                    <div className="savinBox">
                                    <div className="saveTxt text-brand text-center font-bold text-15 pt-4">Now Only</div>
                                        <div className="amount-text text-brand text-center text-22 font-bold leading-[1]">
                                            <Money data={product.node.priceRange.minVariantPrice} />
                                        </div>
                                    </div>
                                    <div className="text-center block py-3  text-xs font-normal min-h-16 max-h-16">
                                        <a className="product-item-link hover:underline" href={`/products/${product.node.handle}`}>
                                            {product.node.title}
                                        </a>
                                    </div>
                                    <a href={`/products/${product.node.handle}`} className="btn-primary">
                                        Shop Now
                                    </a>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}

                    );

                </Swiper>
                <button className="a_arrow-left arrow swiper-button-prev"></button>
                <button className="a_arrow-right arrow swiper-button-next "></button>
            </div>
        </div>
    )
}
export default ArtistCollection;
