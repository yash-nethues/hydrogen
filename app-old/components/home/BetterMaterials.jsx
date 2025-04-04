import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
//import 'swiper/css/navigation';
//import 'swiper/css/pagination';
//import 'swiper/css/scrollbar';
import { Link } from '@remix-run/react';
import { Image, Money } from '@shopify/hydrogen';
function BetterMaterials({ collectionData, title }) {
    if (!collectionData) {
      return <div>Loading...</div>;
    }
    const products = collectionData.products?.edges || [];
    return (
      <div className="container 2xl:container text-center pt-16">
        <div className="text-center pb-10">
          <h2 className="text-blue text-4xl font-semibold custom-h2 relative pb-8">{title}</h2>
        </div>
        <div className="flex gap-x-10">
          <div className="hidden md:block md:w-1/4">
            <Link href="/"><img
                src="/image/mezzo-artist-organizer-storage-racks.jpg"
                alt="Mezzo Artist Organizer Storage Racks"
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
          <div className="w-full md:w-3/4 pl-5">
            <div className='relative pl-10 pr-10'>
              <Swiper
                      modules={[Navigation, Pagination, Scrollbar, A11y]}
                      spaceBetween={30}                      
                      navigation={{ nextEl: ".arrow-right", prevEl: ".arrow-left" }}
                      pagination={{ clickable: true, dynamicBullets: true }}
                      scrollbar={{ draggable: true }}
                      slidesPerView={5} 
                      breakpoints={{
                        1440: {
                          slidesPerView: 4,
                        },
                        1200: {
                          slidesPerView: 3, 
                        },
                        992: {
                          slidesPerView: 3, 
                        },
                        767: {
                          slidesPerView: 2, 
                        },
                      }}
                    >
                 {products.map(({ node: product }) => (
                 
                  <SwiperSlide key={product.id}>
                    <div className="swiper-slide h-auto" >
                      <div className="flex flex-col min-h-full">
                        <Link to={`/products/${product.handle}`} className="grow-0">
                          <div className="w-full aspect-square">
                            <img
                              src={product.featuredImage?.url}
                              alt={product.featuredImage?.altText || product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-grow flex flex-col mt-4">
                          <div className="text-brand pb-2.5 pt-4">
                            <span className="text-xs md:text-sm lg:text-15 !leading-none">
                              Now Only From
                            </span>
                            <p className="block font-bold text-lg md:text-xl lg:text-2xl !leading-none">
                              {product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
                            </p>
                          </div>
                          <Link
                            to={`/products/${product.handle}`}
                            className="text-xs text-base-200 min-h-10 hover:underline"
                          >
                            {product.title}
                          </Link>
                          <div className="mt-auto">
                            <Link
                              to={`/products/${product.handle}`}
                              className="btn-primary inline-block mt-4">Shop Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                 
                ))}
              </Swiper>
              <button className="arrow-left arrow swiper-button-prev"></button>
              <button className="arrow-right arrow swiper-button-next "></button>
              </div>
          </div>
        </div>
      </div>
    );
  }
  

export default BetterMaterials;