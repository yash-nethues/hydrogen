import React, {useRef} from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Image, Money } from '@shopify/hydrogen';
import { useIsClient } from "~/hooks/useIsClient";


function BoughtTogetherSilder({products}) {
    const items = (Array.isArray(products) ? products : []).filter(p => p && p.handle);
    const isSlider = items.length >= 5;
    const isClient = useIsClient();
    const showSlider = isClient && isSlider;
    if (items.length === 0) return null;
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const renderPrice = (p) => {
        // Prefer precomputed group range if provided from loader
        if (p?.groupPriceRange && typeof p.groupPriceRange.min === 'number' && typeof p.groupPriceRange.max === 'number') {
            const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: p.groupPriceRange.currencyCode || 'USD' });
            const min = fmt.format(p.groupPriceRange.min);
            const max = fmt.format(p.groupPriceRange.max);
            return (
                <>
                    <span className="text-brand pl-4 font-bold">{min}</span>
                    {p.groupPriceRange.max !== p.groupPriceRange.min && (
                        <span className="text-brand font-bold"> - {max}</span>
                    )}
                </>
            );
        }
        // Fallback to product price range
        const min = p?.priceRange?.minVariantPrice;
        const max = p?.priceRange?.maxVariantPrice;
        if (!min || !min.amount || !min.currencyCode) return null;
        const showRange = max && max.amount && (String(max.amount) !== String(min.amount));
        return (
            <>
                <span className="text-brand pl-4 font-bold"><Money data={min} /></span>
                {showRange && (
                    <span className="text-brand font-bold"> - <Money data={max} /></span>
                )}
            </>
        );
    };

    return (
        <div className="w-4/6 relative">
            <h2 className='text-blue text-34 font-normal mb-j15'>Frequently Bought Together:</h2>
            <div className='pr-10 pl-8'>
                {!showSlider && (
                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {items.map((product, index) => (
                            <div key={index} className="flex flex-col min-h-full bg-white border border-grey-200 rounded-sm text-center">
                                <a href={`/products/${product.handle}`}>
                                    <div className="w-full aspect-square">
                                        {product?.featuredImage?.url ? (
                                            <img className="w-full h-full object-cover" src={product.featuredImage.url} alt={product.title} />
                                        ) : (
                                            <div className="text-xs text-gray-500 p-4 text-center">No Image</div>
                                        )}
                                    </div>
                                </a>
                                <div className='block'>
                                    <span className='text-sm no-underline hover:underline'>
                                        <a className="product-item-link hover:underline" href={`/products/${product.handle}`}>
                                            {product.title}
                                        </a>
                                    </span>
                                    <p className="minimal-price">
                                        <span className="text-brand text-sm mt-2 block">Starting At:</span>
                                        {renderPrice(product)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showSlider && (
                    <>
                        <Swiper
                            className="mySwiper mt-5"
                            modules={[Navigation, Pagination, Scrollbar, A11y]}
                            spaceBetween={10}
                            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                            pagination={{ clickable: true }}
                            scrollbar={{ draggable: true }}
                            slidesPerView={4}
                            breakpoints={{
                                1440: { slidesPerView: 4 },
                                1200: { slidesPerView: 4 },
                                992:  { slidesPerView: 3 },
                                767:  { slidesPerView: 2 },
                            }}
                            onBeforeInit={(swiper) => {
                                // eslint-disable-next-line no-param-reassign
                                swiper.params.navigation.prevEl = prevRef.current;
                                // eslint-disable-next-line no-param-reassign
                                swiper.params.navigation.nextEl = nextRef.current;
                            }}
                            onSwiper={(swiper) => {
                                setTimeout(() => {
                                    swiper.navigation.init();
                                    swiper.navigation.update();
                                });
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
                                                <a className="product-item-link hover:underline" href={`/products/${product.handle}`}>
                                                    {product.title}
                                                </a>
                                            </span>
                                            <p className="minimal-price">
                                                <span className="text-brand text-sm mt-2 block">Starting At:</span>
                                                {renderPrice(product)}
                                            </p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <button ref={prevRef} className="pf_arrow-left arrow swiper-button-prev"></button>
                        <button ref={nextRef} className="pf_arrow-right arrow swiper-button-next mr-0 right-2"></button>
                    </>
                )}
            </div>
        </div>
    )
}
export default BoughtTogetherSilder