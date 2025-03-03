import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';    
import { Image, Money } from '@shopify/hydrogen';

function ProductSlider({professionalCollection}) {
    return (
        <div className="tab-container">
              <div className="tab_slider flex gap-10">
                   

                    <Swiper
                    className="mySwiper"
                     modules={[Navigation, Pagination, Scrollbar, A11y]}
                     spaceBetween={50}
                     navigation
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
                    {professionalCollection?.products?.edges?.map((product, index) => (
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
                                        <div className="saveTxt text-brand text-center font-bold pt-4">Now Only</div>
                                        <div className="amount-text text-brand text-center font-bold">
                                            <Money data={product.node.priceRange.minVariantPrice} />
                                        </div>
                                    </div>
                                    <strong className="text-center block py-2 font-normal">
                                        <a className="product-item-link" href={`/products/${product.node.handle}`}>
                                            {product.node.title}
                                        </a>
                                    </strong>
                                    <a href={`/products/${product.node.handle}`} className="btn-primary">
                                        Shop Now
                                    </a>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}

                    );
                </Swiper>     
                </div> 
    </div>
    )
}
export default ProductSlider