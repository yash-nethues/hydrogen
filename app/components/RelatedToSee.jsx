import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Image, Money } from '@shopify/hydrogen';


function RelatedToSee({relatedProducts}) {
    const items = Array.isArray(relatedProducts) ? relatedProducts : [];
    const isSlider = items.length >= 6;

    return (
        <>
            <h5 className='text-base font-medium'>Related To- See Also</h5>
            <div className='relative'>
                {!isSlider && (
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {items.map((p) => (
                      <a key={p.id} href={`/products/${p.handle}`} className="block">
                        <img className="w-full aspect-square h-auto object-cover" src={p.featuredImage?.url} alt={p.title} />
                      </a>
                    ))}
                  </div>
                )}
                {isSlider && (
                <Swiper
                    className="mySwiper mt-5"
                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                    spaceBetween={10}
                    navigation={{ nextEl: '.p_arrow-right', prevEl: '.p_arrow-left' }}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                    slidesPerView={5}
                    breakpoints={{
                        1200: {
                        slidesPerView: 5,                        
                        spaceBetween: 40
                        },
                        640: {
                        slidesPerView: 4,                        
                        spaceBetween: 40
                        },
                        480: {
                        slidesPerView: 3,
                        spaceBetween: 20
                        },
                        0: {
                        slidesPerView: 2,
                        },
                    }}
                    >
                    {items && items.length > 0
                      ? items.map((p, index) => (
                          <>
                            <SwiperSlide key={`${p.id}-${index}-1`}>
                              <div className="flex justify-center">
                                <a href={`/products/${p.handle}`}>
                                  <img className="w-full aspect-square h-auto object-cover" src={p.featuredImage?.url} alt={p.title} />
                                </a>
                              </div>
                            </SwiperSlide>
                          </>
                        ))
                      : null}
                </Swiper>
                )}
                {isSlider && (
                  <>
                    <button className="p_arrow-left arrow swiper-button-prev mt-0 -translate-y-1/2 bg-white/80 w-8 h-12 rounded-md before:w-3 before:h-3 before:left-1/3 ms-2 before:-translate-y-1/4 before:rotate-45" ></button>
                    <button className="p_arrow-right arrow swiper-button-next mt-0 -translate-y-1/2 bg-white/80 w-8 h-12 rounded-md before:w-3 before:h-3 before:right-1/2 me-2 before:-translate-y-1/4 before:rotate-45" ></button>
                  </>
                )}
            </div>
        </>
    )
}
export default RelatedToSee