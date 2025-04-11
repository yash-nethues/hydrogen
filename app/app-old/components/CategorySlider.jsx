import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';   

function CategorySlider() {
    return (
     <>
     <div className='2xl:container py-2'>
           <div className='relative'>
                  <Swiper
                                 modules={[Navigation, Pagination, Scrollbar, A11y]}
                                 spaceBetween={30}

                                 pagination={{ clickable: true }}
                                 scrollbar={{ draggable: false }}
                                 slidesPerView={5} 
                                 breakpoints={{
                                                 1440: {
                                                    slidesPerView: 6,
                                                    navigation:false,
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
                                {Array(8).fill().map((_, index) => {
                            return (
                                 <SwiperSlide key={index}>
                                  <div className="slider-item hover:[&>a> h6]:text-brand  h-48">
                                    <a href="#" className='hover:[&>h6]:text-brand'>
                                        <figure>
                                        <img src="image/canvas-stretched-cotton-200x200.jpg" alt="" className="w-full h-full object-cover" />
                                        </figure>
                                            <h6 className="text-center text-sm !text-blue font-semibold hover:text-brand ">
                                                    Stretched Cotton Canvas
                                             </h6>                                        
                                             </a>
                                        </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>    
                {/*<button className="n_arrow-left arrow swiper-button-prev"></button>
                <button className="n_arrow-right arrow swiper-button-next "></button>*/}
     </div>
     </div>
     </>   
    )
}

export default CategorySlider
