import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Image, Money } from '@shopify/hydrogen';
//import 'swiper/css/navigation';

// Utility function to check if a product is a group product
function isGroupProduct(product) {
  const productTypeMetafield = product.metafields?.find(metafield => 
    metafield && metafield.key === 'select_product_type'
  );
  return productTypeMetafield?.value === 'Grouped Product';
}

// Utility function to format price range for group products
function formatGroupProductPrice(product) {
  if (!isGroupProduct(product)) {
    return product.priceRange.minVariantPrice;
  }
  
  const minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
  const maxPrice = parseFloat(product.priceRange.maxVariantPrice.amount);
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;
  
  if (minPrice === maxPrice) {
    return {
      amount: minPrice.toString(),
      currencyCode
    };
  }
  
  return {
    amount: `${minPrice} - ${maxPrice}`,
    currencyCode
  };
}

// Custom price display component for group products
function GroupProductPrice({ product }) {
  if (!isGroupProduct(product)) {
    return <Money data={product.priceRange.minVariantPrice} />;
  }
  
  const minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
  const maxPrice = parseFloat(product.priceRange.maxVariantPrice.amount);
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;
  
  if (minPrice === maxPrice) {
    return <Money data={product.priceRange.minVariantPrice} />;
  }
  
  // Format price range manually
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  return (
    <span>
      {formatCurrency(minPrice, currencyCode)} - {formatCurrency(maxPrice, currencyCode)}
    </span>
  );
}


function ArtistCollection({filteredProducts}) {
   
    return (
        <div className="tab_slider relative px-[25px] my-j30">
                    <Swiper
                        modules={[Navigation, Pagination, Scrollbar, A11y]}
                        spaceBetween={10}
                        navigation={{ nextEl: ".a_arrow-right", prevEl: ".a_arrow-left" }}
                        pagination={{ clickable: true }}
                        scrollbar={{ draggable: true }}
                        slidesPerView={2}
                        slidesPerGroup={2} 
                        breakpoints={{
                            460: {
                                spaceBetween: 20,                      
                            },
                            768: {
                                slidesPerView: 3, 
                                slidesPerGroup: 3,
                                spaceBetween: 10,
                            },
                            1024: {
                                slidesPerView: 5,
                                slidesPerGroup: 5,
                                spaceBetween: 30,  
                            },
                        }}
                        >
                {filteredProducts?.map((product, index) => (
                    <SwiperSlide key={product.id} className='h-auto'>
                        <div className="flex flex-col min-h-full pb-[50px] bg-white relative rounded-sm text-center">
                            <a href={`/products/${product.handle}`}>
                                <div className="w-full aspect-square">
                                    <img
                                        src={product.images?.nodes?.[0]?.url}
                                        alt={product.images?.nodes?.[0]?.altText || product.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </a>
                            <div className="info flex-grow flex flex-col text-xs">
                                <div className="savinBox text-brand py-2.5 text-sm jlg:text-15 max-[479px]:text-xs">
                                    <span className="saveTxt font-medium block !leading-none">Now Only</span>
                                    <div className="amount-text block font-bold text-[150%] !leading-none">
                                        <GroupProductPrice product={product} />
                                    </div>
                                </div>
                                <div className="mb-j5 line-clamp-2 min-h-10">
                                    <a className="text-base-500 leading-normal hover:underline" href={`/products/${product.handle}`}>
                                        {product.title}
                                    </a>
                                </div>
                                <div className='absolute inset-0 flex justify-center top-auto'>
                                    <a href={`/products/${product.handle}`} className="btn-primary block w-full max-w-[150px]">
                                        Shop Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}

            </Swiper>
            <button className="a_arrow-left arrow swiper-button-prev max-[767px]:-left-2.5"></button>
            <button className="a_arrow-right arrow swiper-button-next max-[767px]:-right-2.5 before:-mr-j5"></button>
        </div>
    )
}
export default ArtistCollection;
