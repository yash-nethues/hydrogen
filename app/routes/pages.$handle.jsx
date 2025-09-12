import React, { useState } from "react";
import { defer } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { Navigation, Pagination, Scrollbar,  A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Accordion from "../components/Accordion";
import CouponBanners from "../components/CouponBanners";
import 'swiper/css';
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({ data }) => {
  return [{ title: `Hydrogen | ${data?.page.title ?? ''}` }];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({ ...deferredData, ...criticalData });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({ context, params }) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{ page }] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', { status: 404 });
  }

  return {
    page,
  };
}

/**     
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({ context }) {
  return {};
}
export default function Page() {
  /* @type {LoaderReturnData} */
  const { page } = useLoaderData();
  const [showArrows, setShowArrows] = useState(false);
  const totalBrands = page?.listBrands?.references?.edges?.length || 0;
  return (
    <div className="page">
      <CouponBanners bannerCoupons={page.banner_coupons} />

      <header className="custom-container mb-5 md:mb-0">
        <div className='min-h-[100px] md:min-h-44 py-3 bg-center bg-[length:100%_100%] md:bg-cover' style={page.bannerImage?.reference?.image?.url
          ? { backgroundImage: `url(${page.bannerImage.reference.image.url})` }
          : {}}>
          <div className='text-center px-5 max-w-[1170px] mx-auto text-white'>
            <h1 className='text-22 md:text-26 jlg:text-40 py-5 mb-0 block font-semibold'><span className='leading-none block' style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>{page.title}</span></h1>
            {page.bannerContent?.value && <p>{page.bannerContent.value}</p>}
            <a href="#faq" className='hover:underline'>... Read More+</a>
          </div>
        </div>
      </header>
      <div className='-order-1 md:order-none bg-grey-100 md:mb-5 h-11 flex items-center'>
        <div className=" breadcrumb custom-container">
          <ul className="flex">
            <li className="!text-grey-500  text-sm px-2 first:ps-0 last:pe-0 relative after:content-['/'] after:absolute after:-end-0.5 after:top-0.5 after:pointer-events-none after:!text-grey-500 last:after:hidden after:text-10"><a href="/" className='font-medium  underline hover:no-underline hover:!text-brand'>Home</a></li>
            <li className="active text-sm !text-brand  px-2 first:ps-0 last:pe-0 relative after:content-['/'] after:absolute after:-end-0.5 after:top-0.5 after:pointer-events-none after:!text-grey-500 last:after:hidden after:text-10"> </li>
          </ul>
        </div>
      </div>

      {page.listCollections?.references?.edges?.length > 0 && (
        <div className="page-list-collections">
          <div className='custom-container'>
            <div className="text-center mb-5 md:mb-10">
              <h2 className="text-blue font-normal text-xl md:text-3xl custom-h2 before:ml-j30 after:-ml-j30 after:bottom-1 relative p-j5 md:p-5">
                {page.title} by Category
              </h2>
            </div>

            <div className="flex flex-wrap">
              {page.listCollections.references.edges.map(({ node }) => (
                <div key={node.id} className="w-1/2 sm:1/3 tb:w-1/4 jlg:w-1/5 p-5 text-center">
                  <a href={`/collections/${node.handle}`} className='text-center'>
                    <div className="flex flex-col">
                      <figure className='w-full aspect-square flex items-center justify-center'>
                        {node.image?.url ? (
                          <img src={node.image.url} alt={node.title} className="image-thumb max-w-[75%] max-h-full" />
                        ) : (
                          <img src="/default-image.jpg" alt="Default" className="image-thumb max-w-[75%] max-h-full" />
                        )}
                      </figure>
                      <h6 className=" text-blue font-[500] mb-0 text-sm jxl:text-lg hover:underline">{node.title}</h6>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {page.listBrands?.references?.edges?.length > 0 && (
        <div className="custom-container mt-[60px] md:mt-[150px]">
          <div className="page-list-collections">
            <h2 className="text-25 font-semibold  relative mb-j15">
              {page.title} by Brands
            </h2>
          </div>
          <div className="flex relative custom-container bg-themegray border border-grey-200 py-5 px-[25px]">
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={20}
              navigation={{ nextEl: ".n_arrow-right", prevEl: ".n_arrow-left" }}
              pagination={{ clickable: true }}
              scrollbar={{ draggable: false }}
              slidesPerView={'auto'}
              loop={true}
              onSwiper={(swiper) => {
                const totalSlides = swiper.slides.length;

                // Determine current slidesPerView (handles both "auto" and number)
                const currentSlidesPerView =
                  typeof swiper.params.slidesPerView === "number"
                    ? swiper.params.slidesPerView
                    : Math.floor(swiper.width / swiper.slides[0].offsetWidth);

                // Store condition in swiper instance for later use
                setShowArrows(totalSlides > currentSlidesPerView);
              }}
              onResize={(swiper) => {
                const totalSlides = swiper.slides.length;
                const currentSlidesPerView =
                  typeof swiper.params.slidesPerView === "number"
                    ? swiper.params.slidesPerView
                    : Math.floor(swiper.width / swiper.slides[0].offsetWidth);

                setShowArrows(totalSlides > currentSlidesPerView);
              }}
            >
              {page.listBrands.references.edges.map(({ node }) => (
                <SwiperSlide key={node.id} className='!w-[140px]'>
                  <a href={`/collections/${node.handle}`} className='block' >
                    <figure className="border border-gray-200 aspect-square flex items-center justify-center bg-white p-2.5 mb-0">
                      {node.image?.url ? (
                        <img src={node.image.url} alt={node.title} className="image-thumb max-w-full max-h-[120px]" />
                      ) : (
                        <img src="/default-image.jpg" alt="Default" className="image-thumb max-w-full max-h-[120px]" />
                      )}
                    </figure>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
            <button className={`n_arrow-left arrow swiper-button-prev before:w-5 before:h-5 ml-1 ${ !showArrows ? "hidden" : ""}`}></button>
            <button className={`n_arrow-right arrow swiper-button-next before:w-5 before:h-5  ${ !showArrows ? "hidden" : ""}`}></button>            
          </div>
        </div>
      )}

      <Accordion page={page} faqs={page.faqs.references.edges} />

    </div>
  );
}
const PAGE_QUERY = `#graphql
query Page(
  $language: LanguageCode
  $country: CountryCode
  $handle: String!
) @inContext(language: $language, country: $country) {
  page(handle: $handle) {
    id
    title
    body
    handle
    seo {
      description
      title
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
    listCollections: metafield(namespace: "custom", key: "list_collections") {
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
    listBrands: metafield(namespace: "custom", key: "list_brands") {
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

/**  @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
