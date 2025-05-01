import {defer} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';    
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductVariations} from '~/components/ProductVariations';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  const images = [
    { id: '1', url: selectedVariant?.image.url, altText: 'Image 1' },
    { id: '2', url: '../image/mezzo-artist-organizer-storage-racks.jpg', altText: 'Image 2' },
    { id: '3', url: '../image/mezzo-artist-organizer-storage-racks.jpg', altText: 'Image 3' },
    { id: '4', url: '../image/mezzo-artist-organizer-storage-racks.jpg', altText: 'Image 4' },
    { id: '5', url: 'https://cdn.shopify.com/s/files/1/0908/2657/2073/files/handbags.jpg', altText: 'Image 5' },
    { id: '6', url: 'https://cdn.shopify.com/s/files/1/0908/2657/2073/files/handbags.jpg', altText: 'Image 6' },
    { id: '7', url: 'https://cdn.shopify.com/s/files/1/0908/2657/2073/files/handbags.jpg', altText: 'Image 7' },
    { id: '8', url: 'https://cdn.shopify.com/s/files/1/0908/2657/2073/files/handbags.jpg', altText: 'Image 8' },
    { id: '9', url: 'https://cdn.shopify.com/s/files/1/0908/2657/2073/files/handbags.jpg', altText: 'Image 9' },
  ];

  return (
    <>
      <div className="container 2xl:container mt-5 mb-5">
        <ul className="flex border border-grey-200 justify-between">
              <li className="w-1/3">
                <a href="#">
                  <img
                    className="w-full"
                    src={"../image/top-0310-canvas-super-sale-soon_02-min.jpg"} 
                  
                  />
                </a>
                
                </li>
                <li className="w-1/3">
                <a href="#">
                  <img
                    className="w-full"
                    src={"../image/top-0310-canvas-super-sale-soon_02-min.jpg"} 
                  
                  />
                </a>
                
                </li>
                <li className="w-1/3">
                <a href="#">
                  <img
                    className="w-full"
                    src={"../image/top-0310-canvas-super-sale-soon_02-min.jpg"} 
                  
                  />
                </a>
                
                </li>
        
        </ul>
      </div>
      <div className='bg-themegray pl-0 pr-0 mb-10 h-11 flex items-center'>
          <div className="breadcrumb container 2xl:container">
            <ul className=" flex">
              <li className="!text-grey-500  text-sm underline hover:no-underline hover:!text-brand"><a href="/">Home&nbsp; </a></li>
              <li className="text-10 top-1 relative !text-grey-500 ">/ </li>
              <li className="!text-grey-500 text-sm underline hover:no-underline hover:!text-brand">&nbsp;<a href="/">Collection&nbsp; </a></li>
              <li className="text-10 top-1 relative !text-grey-500 ">/ </li>
              <li className="active text-sm !text-brand ">&nbsp; </li>
            </ul>
          </div>
        </div>
      <div className='container 2xl:container'>
      <div className="product">
          { /* <ProductImage image={selectedVariant?.image} /> */ }
          <ProductImage images={images} />
        <div className="product-main">
          <h1 className='text-blue text-4xl font-semibold mb-j15 mb-j15'>{title}</h1>
          <div className="flex gap-10 mt-1 items-center">
          <div className="uppercase text-10 text-center leading-none bg-blue text-white w-16 p-1">Only AT <br/> Jerry's</div>
          <div className="">Ratting section</div>
          </div>
          <div className="flex flex-wrap gap-4 w-full mt-4">
            <div className="text-26 text-blue text-26 font-semibold mt-5 ">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
            </div>
          <div className="text-sm bg-gray-100 py-1.5 px-3 text-blue text-sm">
            <span className='font-medium'>Save</span>
            <div className="text-26 text-blue text-26 font-semibold flex mt-1  ">
            <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />&nbsp; <span className='text-17'>off </span>&nbsp;  <small className="text-sm relative font-normal">  Reg. Price*  </small>
          </div>
          </div>
          </div>

          
          {/*<div className="text-26 text-blue text-2xl">
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
          </div*/  }
          <div className=''>
            <span className='text-xl font-semibold pt-4 pb-4 block text-base-100'>Description</span>
            <div className='text-15 text-base-100 font-medium [&>ul>li]:relative [&>ul>li]:pb-1 [&>ul>li]:before:content-[""]
            [&>ul>li]:relative [&>ul>li]:pl-5 [&>ul>li]:before:left-0 [&>ul>li]:before:top-[8px] [&>ul>li]:before:absolute [&>ul>li]:before:rounded-[2vw] [&>ul>li]:before:w-1.5 [&>ul>li]:before:h-1.5  [&>ul>li]:before [&>ul>li]:before:content-[""] [&>ul>li]:before:bg-blue 
            ' dangerouslySetInnerHTML={{__html: descriptionHtml}} />
            <div className='flex gap-7 justify-between  max-h-48 overflow-hidden mb-5 pb-5 mt-5'>
          <div><strong>Key Features:</strong>
            <ul className='[&>li]:relative [&>li]:pl-5 [&>li]:before:left-0 [&>li]:before:top-[8px] [&>li]:before:absolute [&>li]:before:rounded-[2vw] [&>li]:before:w-1.5 [&>li]:before:h-1.5  [&>li]:before [&>li]:before:content-[""] [&>li]:before:bg-blue ' >
              <li>Exceptionally smooth, rich, buttery consistency</li>
              <li>Dries quickly, permanent and archival in quality</li>
              <li>Ability to "stand up" and retain brush strokes</li>
              <li>All HB colors are thixotropic in nature</li>
              <li>Retain excellent flexibility when dry, diminishing the possibility of cracking</li>
              <li>Heavy Body viscosity can also be reduced successfully with water</li>
              <li>No flattening agents</li>
              <li>No opacifiers added to colors</li>
              <li>Clearest and cleanest quality</li>
              <li>101 different colors, shades and tints</li>
              <li>30 colors are mixture colors, the rest of produced from single, unique pigments</li>
              <li>Concentrated/Chemically Pure Cadmiums</li>
              <li>Can be mixed with all of our GOLDEN Mediums, Gels and other paint lines</li>
          </ul>
      </div>
      <div><strong>Perfect For:</strong>
      <ul className='[&>li]:relative [&>li]:pl-5 [&>li]:before:left-0 [&>li]:before:top-[8px] [&>li]:before:absolute [&>li]:before:rounded-[2vw] [&>li]:before:w-1.5 [&>li]:before:h-1.5  [&>li]:before [&>li]:before:content-[""] [&>li]:before:bg-blue ' >
              <li>Approved for professional artist</li>
              <li>100% acrylic binder</li>
              <li>Freeze-thaw stability</li>
              <li>"stand up" and retain brush strokes or palette knife marks on the canvas</li>
              <li>Largest assortment of unique pure pigments</li>
              <li>There are no fillers, extenders, opacifiers, toners, or dyes added</li>
          </ul>
      </div>
  </div>
          </div>

          <div className="flex gap-3 items-center mt-4">
                  <a href="#full-des" className='bg-blue text-white px-4 py-2 hover:bg-brand'>
                      See Full Description &gt; 
                  </a>
                  <a href="#shop-all" className='btn-outer rounded h-8 flex flex-none pl-2 pr-2'>
                      Shop All Supplies Below &gt; 
                  </a>
          </div>

          <div className="mt-8 pt-5  border-t border-grey-200  related_slider">
              Related To- See Also  
              <Swiper
                  className="mySwiper mt-5"
                  modules={[Navigation, Pagination, Scrollbar, A11y]}
                  spaceBetween={10}
                  navigation={{ nextEl: '.p_arrow-right', prevEl: '.p_arrow-left' }}
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
                  {[...Array(10)].map((_, i) => (
                    <SwiperSlide key={i}>
                      <div className="flex justify-center">
                        <img className="w-auto max-w-full h-auto" src="../image/mezzo-artist-organizer-storage-racks.jpg" alt={`Image ${i + 1}`} />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
          </div>   
          <div className="mt-5">
            <ul className='flex gap-10 justify-between [&>li>a]:flex [&>li>a]:gap-3 [&>li>a]:items-center [&>li>a]:text-blue [&>li>a]:text-sm [&>li>a]:font-semibold'>
              <li><a href="#"><i><img src="../image/email.png" /></i> Email</a></li>
              <li><a href="#"><i><img src="../image/email.png" /></i> Add to Favorites </a></li>
              <li><a href="#"><i><img src="../image/email.png" /></i> Need Help ? Chat With An Expert	</a></li>
            </ul>
            </div> 
        </div>
        </div>
        
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>

      <ProductVariations />

      {/* Shop by size 

    
      <div className="container 2xl:container">
        <div className="">
          <p className="">
            <span className="text-red text-center">Loading more...</span>
          </p>
        </div>
      </div>*/
      }
      {/* show bottom section */} 
      <div className='artists_sec pt-10 '>
        <div className='container 2xl:container'>
          <div className="flex ">
          <div className="w-9/12 relative">
          <h2 className='text-blue text-34 font-normal mb-8'>Frequently Bought Together:</h2>
            <div className='pr-10'>
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
                  {[...Array(10)].map((_, i) => (
                    <SwiperSlide key={i}>
                      <div className="flex flex-wrap justify-center border p-5">
                        <img className="w-auto max-w-full h-auto" src="../image/mezzo-artist-organizer-storage-racks.jpg" alt={`Image ${i + 1}`} />
                        <div className='block'>
                         <span className='text-sm no-underline hover:underline'>Chelsea Classical Studio Oil Painting Mediums Sampler Sets</span>
                         <p claclassNamess="minimal-price">
                            <span className="text-brand  block">Starting At:</span>
                            <span className="text-brand pl-4  font-bold">$11.53</span>
                          </p>
                          </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              
                <button className="pf_arrow-left arrow swiper-button-prev"></button>
                <button className="pf_arrow-right arrow swiper-button-next mr-10"></button>
                </div>
                </div>
                <div className="w-3/12 relative">
                <h2 className='text-blue text-34 font-normal mb-j15 '>Shop Related Sets</h2>
                 <Swiper
                  className="mySwiper mt-5"
                  modules={[Navigation, Pagination, Scrollbar, A11y]}
                  spaceBetween={10}
                  navigation={{ nextEl: '.ps_arrow-right', prevEl: '.ps_arrow-left' }}
                  pagination={{ clickable: true }}
                  scrollbar={{ draggable: true }}
                  slidesPerView={2}
                  breakpoints={{
                    1440: {
                      slidesPerView: 2,
                    },
                    1200: {
                      slidesPerView: 2,
                    },
                    992: {
                      slidesPerView: 2,
                    },
                    767: {
                      slidesPerView: 1,
                    },

                  }}
                >
                  {[...Array(10)].map((_, i) => (
                    <SwiperSlide key={i}>
                    <div className="flex flex-wrap justify-center border p-5">
                        <img className="w-auto max-w-full h-auto" src="../image/mezzo-artist-organizer-storage-racks.jpg" alt={`Image ${i + 1}`} />
                        <div className='block'>
                         <span className='text-sm no-underline hover:underline'>Chelsea Classical Studio Oil Painting Mediums Sampler Sets</span>
                         <p claclassNamess="minimal-price">
                            <span className="text-brand  block">Starting At:</span>
                            <span className="text-brand pl-4  font-bold">$11.53</span>
                          </p>
                          </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button className="ps_arrow-left arrow swiper-button-prev"></button>
                <button className="ps_arrow-right arrow swiper-button-next "></button>
                </div>
        </div>
        </div>
      </div>
    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;


const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
