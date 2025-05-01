import React, { useState } from 'react';
import {defer, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import CouponBanners from "../components/CouponBanners";
import Accordion from "../components/accordion";
import ProductFilter from "../components/ProductFilter";
import { useLocation, useSearchParams } from '@remix-run/react';
import { CiGrid41 } from "react-icons/ci";
import { FaListUl } from "react-icons/fa";
import { CiPlay1 } from "react-icons/ci";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoHeart } from "react-icons/io5";
import { GoHeart } from "react-icons/go";
import { IoMdHeart } from "react-icons/io";
import { BiGridAlt } from "react-icons/bi";
import Popup from "../components/Popup";
import { TfiLayoutGrid2Alt } from "react-icons/tfi";
import { FaList } from "react-icons/fa";
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const filters = [];

  // Handle availability filter
  if (searchParams.get('availability') === 'true') {
    filters.push({ available: true });
  }

  searchParams.forEach((fValue, key) => {
    if (key.startsWith('filter.')) {
      const [_, filterType, filterName] = key.split('.');
      const parsedData = JSON.parse(fValue);
      //console.log('value', parsedData.productMetafield);
      if(parsedData.productVendor){
        if (filterType === 'v') {
          filters.push({
            productVendor: parsedData.productVendor
          });
        }
      }else if(parsedData.tag){
        if (filterType === 'v') {
          filters.push({
            tag: parsedData.tag
          });
        }
      }else if(parsedData.variantOption){
        const { name, value } = parsedData.variantOption;
        if (filterType === 'v') {
          // Variant filters
          filters.push({
            variantOption: {
              name: name,
              value: value
            }
          });
        } else if (filterType === 'p') {
          // Product filters
          filters.push({
            [filterName]: value
          });
        }
      }else if(parsedData.productMetafield){
        const { namespace, key, value } = parsedData.productMetafield;
        if (filterType === 'v') {
          // Variant filters
          filters.push({
            productMetafield: {
              namespace: namespace,
              key: key,
              value: value
            }
          });
        }
      }
    }
  });

  const { collection } = await storefront.query(COLLECTION_QUERY, {
    variables: { 
      handle, 
      filters,
      ...paginationVariables 
    },
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return { collection };
}

function loadDeferredData({context}) {
  return {};
}

function useFilters() {
  const [searchParams] = useSearchParams();
  const activeFilters = [];

  searchParams.forEach((value, key) => {
    if (key.startsWith('filter.')) {
      const [_, filterType, filterName] = key.split('.');
      
      activeFilters.push({
        key,
        type: filterType,
        name: filterName,
        value,
      });
    }
  });

  return activeFilters;
}

export default function Collection() {
  const {collection} = useLoaderData();
  const filters = useFilters();
  const [searchParams] = useSearchParams();
  const location = useLocation();
 
  const createFilterUrl = (filterType, filterName, value) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Clear existing filters of the same type and name
    newSearchParams.forEach((val, key) => {
      if (key.startsWith(`filter.${filterType}.${filterName}`)) {
        newSearchParams.delete(key);
      }
    });
  
    // Set the new filter if value is not null
    if (value !== null) {
      newSearchParams.set(`filter.${filterType}.${filterName}`, value);
    }
    
    // Reset pagination when filters change
    newSearchParams.delete('cursor');
    
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  const removeFilter = (filterKey) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete(filterKey);
    newSearchParams.delete('cursor');
    return `${location.pathname}?${newSearchParams.toString()}`;
  };
  

  const [openIndex, setOpenIndex] = useState([]); 
  const handleToggle = (index) => {
    setOpenIndex((prevIndexes) => {
      if (prevIndexes.includes(index)) {
        // If index is already open, remove it (close)
        return prevIndexes.filter(i => i !== index);
      } else {
        // Otherwise, add it to openIndexes (open)
        return [...prevIndexes, index];
      }
    });
  };
  
  const [toggleView, setToggleView] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggleDescription = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleClearFilters = () => {
    
    const newSearchParams = new URLSearchParams(location.search);

    const filterKeys = Array.from(newSearchParams.keys()).filter(key => key.startsWith('filter.'));

    filterKeys.forEach(key => newSearchParams.delete(key));

    newSearchParams.delete('cursor');

    const newUrl = newSearchParams.toString() ? `${location.pathname}?${newSearchParams.toString()}` : location.pathname;

    window.location.assign(newUrl);
  };
    

  //popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [content, setContent] = useState(" is a popup!");

  const iframeContent = (
    <iframe
      id="fancybox-frame1743061232863"
      name="fancybox-frame1743061232863"
      className="fancybox-iframe"
      allowFullScreen
      allow="autoplay; fullscreen"
      src="https://www.youtube-nocookie.com/embed/ZY2rhHxC3Y4?autoplay=1&autohide=1&fs=1&rel=0&hd=1&wmode=transparent&enablejsapi=1&html5=1"
      scrolling="no"
    />
  );

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  // Function to close the popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <CouponBanners bannerCoupons={collection.banner_coupons} />

      <header className="container 2xl:container ">
        <div className='h-44 pt-4 pb-3 border-t border-grey-200 border-b border-grey-200'>
          <div className='text-center pl-4 pr-4 max-w-[1170px] mx-auto text-base text-white'>
            <h1 className='text-40 pt-5 pb-5 block text-blue font-semibold'><span className=''>{collection.title}</span></h1>
            {collection.bannerContent?.value && <p className='pt-2 text-base !text-blue'>{collection.bannerContent.value}</p>}
            <a href="#faq" className='text-blue hover:underline'>...Read More+</a>
          </div>
        </div>
      </header>


      <div className='bg-themegray pl-0 pr-0 mb-5 h-11 flex items-center'>
        <div className="breadcrumb container 2xl:container">
          <ul className=" flex">
            <li className="!text-grey-500  text-sm underline hover:no-underline hover:!text-brand"><Link to="/">Home&nbsp; </Link></li>
            <li className="text-10 top-1 relative !text-grey-500 ">/ </li>
            <li className="!text-grey-500 text-sm underline hover:no-underline hover:!text-brand">&nbsp;<Link href="/">Collection&nbsp; </Link></li>
            <li className="text-10 top-1 relative !text-grey-500 ">/ </li>
            <li className="active text-sm !text-brand ">&nbsp; {collection.title}</li>
          </ul>
        </div>
      </div>
        
      {collection.relatedCategories?.references?.edges?.length > 0 && (
          <div className="flex flex-wrap container 2xl:container">
            {collection.relatedCategories.references.edges.map(({node }) => (
              <div key={node.id} className="w-1/5 p-5 pb-1 text-center">
                <Link to={`/collections/${node.handle}`} className='text-center'>
                  <div className="flex justify-center flex-wrap p-5">
                    <figure className=' mb-5 flex items-center'>
                      {node.image?.url ? (
                        <img src={node.image.url} alt={node.title} className="w-32" />
                      ) : (
                        <img src="/default-image.jpg" alt="Default" className="w-32" />
                      )}
                    </figure>
                    <h6 className="text-blue font-semibold text-sm  hover:text-brand ">{node.title}</h6>
                  </div>
                </Link>
              </div>
            ))}
          </div>
      
      )}
      <div className='container 2xl:container '>
        <div className='flex border-t border-grey-200 '>
        <div className='w-1/5 border-r border-grey-200 pt-7 pr-7 '>
            <div className='relative sticky top-0'>
            {collection.products.filters.map((filter, index) => {
            // Determine if this is a variant filter or product property filter
            const isVariantFilter = filter.id !== 'product_type' && filter.id !== 'vendor';
            const filterType = isVariantFilter ? 'v' : 'p';
            const filterKey = filter.id;
              return (
                <>
                {filters.length > 0 && index === 0 && (
                  <div className="mainbox">
                    <h3 className='font-semibold bg-gray-100 py-2 pl-5 mb-5'>Now Shopping by</h3>
                    <div className="applied-filters">
                      {filters.map((filter) => {
                        let filterValue;
                        if (filter.key === 'filter.v.filter.p.tag') {
                          const tagFilter = JSON.parse(filter.value);
                          filterValue = (
                            <span>
                              <span className="font-semibold">Category: </span>
                              {tagFilter.tag}
                            </span>
                          );
                        } else if (filter.key === 'filter.v.filter.p.vendor') {
                          const brandFilter = JSON.parse(filter.value);
                          filterValue = (
                            <span>
                              <span className="font-semibold">Brand: </span>
                              {brandFilter.productVendor}
                            </span>
                          );
                        } else if (filter.key === 'filter.v.filter.v.option.color') {
                          const colorFilter = JSON.parse(filter.value);
                          filterValue = (
                            <span>
                              <span className="font-semibold">Color: </span>
                              {colorFilter.variantOption.value}
                            </span>
                          );
                        } else if (filter.key === 'filter.v.filter.v.option.size') {
                          const sizeFilter = JSON.parse(filter.value);
                          filterValue = (
                            <span>
                              <span className="font-semibold">Size: </span>
                              {sizeFilter.variantOption.value}
                            </span>
                          );
                        } else if (filter.key === 'filter.v.filter.p.m.custom.more_ways_to_shop') {
                          const wayShopFilter = JSON.parse(filter.value);
                          filterValue = (
                            <span>
                              <span className="font-semibold">{wayShopFilter.productMetafield.value}:</span> Yes
                            </span>
                          );
                        }

                        return (
                          <div key={filter.key} className="filter-tag hover:text-gray-600 mt-2">
                            <button
                              onClick={() => {
                                const newUrl = removeFilter(filter.key);
                                window.location.assign(newUrl);
                              }}
                              className="remove-filter-btn text-gray-400 hover:text-gray-600 mr-1"
                            >X </button>
                            {filterValue}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filters.length > 0 && index === 0 && (
                  <button className='mt-4 mb-5 text-sky-700' onClick={handleClearFilters}>Clear All</button>
                )}

                {index === 1 && <div className='flter-link border-b last:border-0 border-grey-200 py-4 text-xl font-semibold'>SHOP BY:</div>} 
            
                <div key={filter.id} className="flter-link border-b last:border-0 border-grey-200 py-4" 
                onClick={() => handleToggle(index)}>
                  
                  <div className="flex justify-between text-base font-semibold uppercase cursor-pointer">
                    {filter.label}
                    <button
                      className={`relative after:content-[''] after:w-2.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:border-b-gray-500 after:absolute after:right-3 after:top-1/2 after:transform after:-translate-y-1/2 transition-transform duration-300 ${openIndex === index ? 'after:rotate-[-135deg] after:mt-1' : 'after:rotate-45'}`}
                    ></button>
                  </div>
                  {openIndex.includes(index) && (
                    <ul className="mt-5 fdffdf [&>li]:leading-7 [&>li>a]:text-black hover:[&>li>a]:text-brand hover:[&>li>a]:underline">
                      {filter.values.map((value) => (
                          <li key={value.id}>
                            <Link
                              to={createFilterUrl(
                                isVariantFilter ? 'v' : 'p',
                                filterKey,
                                value.input
                              )}
                              className={filters.some(f => 
                                f.key === `filter.${isVariantFilter ? 'v' : 'p'}.${filterKey}` && 
                                f.value === value.input
                              ) ? 'font-bold text-brand' : `text-${value.label.toLowerCase().replace(/\s+/g, '')}`}
                            >
                              {value.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
                </>
              );
})}
            </div>
          </div>
          <div className="w-4/5">
          <div className="md:p-j30 md:pr-0">
              <div className='flex flex-wrap justify-between'>
              <div className='leading-10 font-semibold text-blue text-base'>Showing All {collection.title}</div>
              <div className='flex flex-wrap justify-end gap-x-2 items-center'>
                <span className='uppercase font-semibold text-base !text-blue'>Sort</span>  
                 <div className='flex gap-x-2'>
                    <button onClick={() => setToggleView(true)} className={`text-sm text-grey w-11 h-11 flex justify-center items-center border border-grey-200  hover:bg-brand-100 hover:text-white font-semibold hover:border-brand-200 ${toggleView ? 'bg-brand-100 bg-brand-100  text-white' : 'bg-gray-100'}`}> <TfiLayoutGrid2Alt />  </button>
                    <button onClick={() => setToggleView(false)}  className={`text-base text-grey  w-11 h-11 font-semibold flex justify-center items-center border border-grey-200  hover:bg-brand-100 hover:text-white font-semibold hover:border-brand-200 ${toggleView ? 'bg-gray-100' : 'bg-brand-100 bg-brand-100 text-white'}`}>  <FaList />
</button>
                  </div>
              </div>
              </div>
              

              <PaginatedResourceSection
                connection={collection.products}
                resourcesClassName="flex flex-wrap"
              >
                {({node: product, index}) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    isExpanded={isExpanded}
                    openPopup={openPopup}
                    content={content}
                    iframeContent={iframeContent}
                    closePopup={closePopup}
                    isPopupOpen={isPopupOpen}
                    handleToggleDescription={handleToggleDescription}
                    toggleView={toggleView} 
                    loading={index < 8 ? 'eager' : undefined}
                  />
                )}
              </PaginatedResourceSection>
              <Analytics.CollectionView
                data={{
                  collection: {
                    id: collection.id,
                    handle: collection.handle,
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Accordion page={collection} faqs={collection.faqs.references.edges} type='collection ' />
    </>
  );
}
/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading, toggleView, iframeContent, isExpanded, handleToggleDescription, openPopup, isPopupOpen, closePopup, content  }) {
  const variantUrl = useVariantUrl(product.handle);
  //console.log('product data:- ', product);
  //const metafields = data.data.productByHandle.metafields.edges;
  //const moreWaysToShop = metafields.find(m => m.node.key === "more_ways_to_shop");
  
  return (

    <>
        {toggleView ? (
      <>
        <div className='sm:w-2/6 md:w-2/4  lg:w-2/6 xl:w-3/12 pb-11 relative my-j30 px-5'>
      <Link
        className="product-item"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        {product.featuredImage && (
          <div className='p-5 text-center'>
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              data={product.featuredImage}
              loading={loading}
              className='inline-block'
              sizes="(min-width: 45em) 400px, 100vw"
              style={{ width: '75%' }}
            />
            <button type="button" className='flex  group text-[28px] absolute right-7 top-0  text-gray-600 h-12 w-12 items-center justify-center '>
            <IoMdHeartEmpty className='group-hover:hidden' />
            <IoMdHeart className='fill-red-500 hidden group-hover:block '/>
              
              </button>
          </div>
        )}
        <div className='text-center pt-5'>
          <h4 className='text-15 min-h-11 font-semibold hover:underline'>{product.title}</h4>
          <small className='text-15 mb-3 mt-2  text-brand flex justify-center gap-2 items-center'>
             Starting At: <span className='font-semibold text-22 text-blue'> <Money data={product.priceRange.minVariantPrice} /></span>
          </small>
          <div className='flex justify-center w-full'>
           <Link to={variantUrl} className='btn-secondary mt-4 absolute bottom-0'>
              Shop Now
          </Link>
          </div> 
        </div>
        <div className='absolute top-0 left-0 w-11 gap-y-j5 flex flex-wrap'>
          {product?.metafield?.value === "On Super Sale" && (
            <img src="/image/super-sale_1.jpg" alt="Super Sale" />
          )}
          {product?.metafield?.value === "New Arrivals" && (
            <img src="/image/only-at-jerrys_1.jpg" alt="On Sale" />
          )}
          {product?.metafield?.value === "On Sale" && (
            <img src="/image/sale_1.jpg" alt="On Arrivals" />
          )}
        </div>
      </Link>
    </div>
      </>
    ) : (
      <>
        <div className='w-full pb-11 relative border-b last:border-0 py-j30  border-grey-200'>
      <div
        className="flex relative py-5"
        key={product.id}
        prefetch="intent">
        {product.featuredImage && (
          <div className='w-j25'>
             <Link to={variantUrl}>
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              data={product.featuredImage}
              loading={loading}
              className='inline-block'
              sizes="(min-width: 45em) 400px, 100vw"
              style={{ width: '75%' }}
            />
          
          <div className='absolute top-0 left-0 w-11 gap-y-j5 flex flex-wrap'>
            {product?.metafield?.value === "On Super Sale" && (
              <img src="/image/super-sale_1.jpg" alt="Super Sale" />
            )}
            {product?.metafield?.value === "New Arrivals" && (
              <img src="/image/only-at-jerrys_1.jpg" alt="On Sale" />
            )}
            {product?.metafield?.value === "On Sale" && (
              <img src="/image/sale_1.jpg" alt="On Arrivals" />
            )}
          </div>
        </Link>
          </div>
        )}
        <div className='w-j75'>
          <h4 className='text-22 font-semibold hover:underline'>{product.title}</h4>
          <small className='text-15 mb-2  text-brand flex justify-start gap-2 items-center'>
             Starting At: <span className='font-semibold text-22 text-blue'> <Money data={product.priceRange.minVariantPrice} /></span>
          </small>

        <p class="text-base">
        {isExpanded || product.description.length <= 50
          ? product.description
          : `${product.description.substring(0, 370)}...`}
         <span
          className="text-brand pb-0 leading-0 inline-block relative before:content-[''] before:bg-brand-100 before:w-0 before:h-[1px] before:absolute before:left-0 before:bottom-0 hover:before:w-full hover:before:transition-all hover:before:duration-300 hover:before:ease-in-out cursor-pointer"
          onClick={handleToggleDescription}
        >
          {isExpanded ? 'See Less' : 'See More'}
        </span>
         </p>
          <div className='flex justify-start w-full items-center gap-x-4 mt-4'>
           <Link to={variantUrl} className='btn-secondary-small  '>
              Shop Now
          </Link>
          <button type="button" className='flex group text-3xl border text-grey-300 border-grey-200 h-12 w-12 items-center justify-center
          '>
          <IoMdHeartEmpty className='group-hover:hidden' />
          <IoMdHeart className='fill-red-500 hidden group-hover:block '/>
          </button>
          <button onClick={openPopup} type="button" className='flex text-2xl border text-grey-300 hover:bg-grey-100 border-grey-200 h-12 w-12 items-center justify-center'><CiPlay1 /></button>
          <Popup isOpen={isPopupOpen}  closePopup={closePopup} content={content} iframeContent={iframeContent} />
          </div> 
        </div>
       
      </div>
  
    </div>
      </>
    )}
  
    </> 
    
  );
}


const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  
  fragment ProductItem on Product {
    id
    handle
    title
    description
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    metafield(namespace: "custom", key: "more_ways_to_shop") {
      key
      value
    }
  }
`;


const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
      }
      bannerContent: metafield(namespace: "custom", key: "banner_content") { value }
      bannerImage: metafield(namespace: "custom", key: "banner_image") {
        reference {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
      }
      faqs: metafield(namespace: "custom", key: "faqs") {
        references(first: 10) {
          edges {
            node {
              ... on Metaobject {
                id
                handle
                fields {
                  key
                  value
                }
              }
            }
          }
        }
      }
      relatedCategories: metafield(namespace: "custom", key: "sub_categories") {
        references(first: 20) {
          edges {
            node {
              ... on Collection {
                id
                title
                handle
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
      banner_coupons: metafield(namespace: "custom", key: "banner_coupons") {
        references(first: 3) {
          edges {
            node {
              ... on Metaobject {
                id
                handle
                fields {
                  key
                  value
                  reference {
                    ... on MediaImage {
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */