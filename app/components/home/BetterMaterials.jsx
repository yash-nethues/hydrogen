import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
//import 'swiper/css/navigation';
//import 'swiper/css/pagination';
//import 'swiper/css/scrollbar';
import { Link, Await } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import { useIsClient } from "~/hooks/useIsClient";

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

function BetterMaterials({ products, title, featuredList }) {
    const featured = Array.isArray(featuredList)
      ? featuredList.find((f) => (f?.featuring_section || '').trim() === (title || '').trim())
      : null;
    const isClient = useIsClient();
    return (
      <div className="container mt-j30 md:mt-[50px] jlg:mt-[65px] md:px-10 2xl:px-[60px]">
        <div className='-mx-5 md:mx-0'>
          <div className="text-center mb-j30 md:mb-[51px] px-2.5">
            <h2 className="text-blue text-xl md:text-26 jlg:text-3xl jxl:text-4xl font-semibold custom-h2 relative pb-6 mb-0">{title}</h2>
          </div>
          <div className="flex items-start">
            <div className="hidden flex-auto md:block md:w-1/4 pr-5 j2xl:pr-[50px]">
              {featured ? (
              <Link to={featured?.promo_url || "/"} title={featured?.promo_image_title || ""}>
                <img
                  src={featured?.promo_image || "/image/mezzo-artist-organizer-storage-racks.jpg"}
                  alt={featured?.promo_image_title || "Featured"}
                  className="w-full h-full object-cover"
                />
              </Link>
              ) : null}
            </div>
            <div className="w-full flex-none md:w-3/4 px-5 pb-2.5 md:p-0 md:pl-10">
              <div className='relative px-[25px] my-j30'>
                <Suspense fallback={<div>Loading...</div>}>
                  <Await resolve={products}>
                    {(response) => {
                      // Filter products based on jtab metafield value
                      const filteredProducts = response?.products?.nodes?.filter((product) => {
                        if (!product.metafields || !Array.isArray(product.metafields)) {
                          return false;
                        }
                        
                        const jtabMetafield = product.metafields.find(metafield => 
                          metafield && metafield.key === 'jtab'
                        );
                        
                        if (!jtabMetafield) {
                          return false;
                        }
                        
                        // Handle JSON array format
                        let jtabValues = [];
                        try {
                          // Try to parse as JSON array
                          jtabValues = JSON.parse(jtabMetafield.value);
                        } catch (e) {
                          // If not JSON, treat as single string
                          jtabValues = [jtabMetafield.value];
                        }
                        
                        const matches = jtabValues.includes(title);
                        return matches;
                      }) || [];
                      
                      // Limit products to 12 for BetterMaterials
                      const limitedProducts = filteredProducts.slice(0, 12);
                      
                      return (
                        <>
                          {isClient && limitedProducts.length > 0 ? (
                            <>
                              <Swiper
                                      modules={[Navigation, Pagination, Scrollbar, A11y]}
                                      spaceBetween={10}                      
                                      navigation={{ nextEl: ".arrow-right", prevEl: ".arrow-left" }}
                                      pagination={{ clickable: true, dynamicBullets: true }}
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
                                          slidesPerView: 4,
                                          slidesPerGroup: 4,
                                          spaceBetween: 30,  
                                        },
                                      }}
                                    >
                                {limitedProducts.map((product) => (
                                <SwiperSlide key={product.id} className='h-auto'>
                                  <div className="flex flex-col min-h-full pb-[50px] bg-white relative rounded-sm text-center">
                                    <div className='jerry-badge'>
                                      <span className='special-offer hidden'></span>
                                      <span className='free-offer hidden'></span>
                                      <span className='bulk hidden'></span>
                                      <span className='top-sellers hidden'></span>
                                      <span className='new'></span>
                                      <span className='sale'></span>
                                      <span className='beft-value hidden'></span>
                                      <span className='super-sale hidden'></span>
                                      <span className='has-new-items hidden'></span>
                                      <span className='out-of-stock hidden'></span>
                                      <span className='only-at-jerrys hidden'></span>
                                    </div>
                                    <Link to={`/products/${product.handle}`} className="grow-0">
                                      <div className="w-full aspect-square">
                                        <img
                                          src={product.images?.nodes?.[0]?.url}
                                          alt={product.images?.nodes?.[0]?.altText || product.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </Link>
                                    <div className="flex-grow flex flex-col text-xs">
                                      <div className="text-brand py-2.5 text-sm jlg:text-15 max-[479px]:text-xs">
                                        <span className=" font-medium block !leading-none">
                                          Now Only 
                                        </span>
                                        <p className="block font-bold text-[150%] !leading-none">
                                          <GroupProductPrice product={product} />
                                        </p>
                                      </div>
                                      <div className='mb-j5 line-clamp-2 min-h-10'>
                                        <Link to={`/products/${product.handle}`} className="text-base-500 leading-normal hover:underline">{product.title}</Link>
                                      </div>
                                      <div className="absolute inset-0 flex justify-center top-auto">
                                        <Link
                                          to={`/products/${product.handle}`}
                                          className="btn-primary block w-full max-w-[150px]">Shop Now
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </SwiperSlide>
                                  
                                  ))}
                                </Swiper>
                                <button className="arrow-left arrow swiper-button-prev max-[767px]:-left-2.5"></button>
                                <button className="arrow-right arrow swiper-button-next max-[767px]:-right-2.5 before:-mr-j5"></button>
                            </>
                          ) : (
                            <div className="w-full text-center py-8">
                              <p className="text-gray-500">No products found for this category.</p>
                            </div>
                          )}
                        </>
                      );
                    }}
                  </Await>
                </Suspense>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  

export default BetterMaterials;