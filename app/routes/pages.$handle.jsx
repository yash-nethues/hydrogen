import { defer } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Accordion from "../components/accordion";
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

  return (
    <div className="page">
      <CouponBanners bannerCoupons={page.banner_coupons} />

      <header className="container 2xl:container">
        <div className='h-44 pt-3 pb-3' style={page.bannerImage?.reference?.image?.url
          ? { backgroundImage: `url(${page.bannerImage.reference.image.url})` }
          : {}}>
          <div className='text-center pl-4 pr-4 max-w-[1170px] mx-auto text-base
 text-white'>
            <h1 className='text-40 pt-5 pb-5 block font-semibold'><span className='' style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>{page.title}</span></h1>
            {page.bannerContent?.value && <p className='pt-2 text-base
!text-white'>{page.bannerContent.value}</p>}
            <a href="#faq">...Read More+</a>
          </div>
        </div>
      </header>
      <div className=' bg-grey-100 pl-0 pr-0 mb-5 h-11 flex items-center'>
        <div className="container breadcrumb 2xl:container">
          <ul className="flex">
            <li className="!text-grey-500 text-sm underline hover:no-underline hover:!text-brand"><a href="/">Home&nbsp; </a></li>
            <li className="text-10 top-1 relative !text-grey-500 ">/ </li>
            <li className="active text-sm !text-brand ">&nbsp; {page.title}</li>
          </ul>
        </div>
      </div>

      {page.listCollections?.references?.edges?.length > 0 && (
        <div className="page-list-collections">
          <div className="text-center p-5 mb-10">
            <h2 className="text-blue text-3xl custom-h2  relative pb-7">
              {page.title} by Category
            </h2>
          </div>

          <div className="flex flex-wrap  custom-container">
            {page.listCollections.references.edges.map(({ node }) => (
              <div key={node.id} className="w-1/5 p-5 text-center">
                <a href={`/collections/${node.handle}`} className='text-center'>
                  <div className="flex justify-center flex-wrap p-5">
                    <figure className='h-52 mb-5 flex items-center'>
                      {node.image?.url ? (
                        <img src={node.image.url} alt={node.title} className="image-thumb" />
                      ) : (
                        <img src="/default-image.jpg" alt="Default" className="image-thumb" />
                      )}
                    </figure>
                    <h6 className="text-blue font-[500] text-lg hover:underline">{node.title}</h6>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      {page.listBrands?.references?.edges?.length > 0 && (
        <div className="container 2xl:container mt-40">
          <div className="page-list-collections">
            <h2 className="text-blue text-2xl font-bold relative pb-4">
              {page.title} by Brands
            </h2>
          </div>
          <div className="flex relative custom-container bg-themegray border border-grey-200 pt-5 pl-7 pr-7 pb-0">


            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={20}
              navigation={{ nextEl: ".n_arrow-right", prevEl: ".n_arrow-left" }}
              pagination={{ clickable: true }}
              scrollbar={{ draggable: false }}
              slidesPerView={3}
              breakpoints={{
                1440: {
                  slidesPerView: 10,
                },
                1200: {
                  slidesPerView: 1,
                },
                992: {
                  slidesPerView: 1,
                },
                767: {
                  slidesPerView: 1,
                },
              }}
            >
              return (
              {page.listBrands.references.edges.map(({ node }) => (
                <SwiperSlide key={node.id} style={{ width: '141px' }}>
                  <a href={`/collections/${node.handle}`}>
                    <figure className="border border-gray-200 bg-white mb-0">
                      {node.image?.url ? (
                        <img src={node.image.url} alt={node.title} className="image-thumb" />
                      ) : (
                        <img src="/default-image.jpg" alt="Default" className="image-thumb" />
                      )}
                    </figure>
                  </a>
                </SwiperSlide>
              ))}
              );
            </Swiper>
              <button className="n_arrow-left arrow swiper-button-prev -mt-4 ml-1"></button>
              <button className="n_arrow-right arrow swiper-button-next -mt-4"></button>

            {/*page.listBrands.references.edges.map(({ node }) => (
                  <div key={node.id} className="sub-category">
                    
                    <a href={`/collections/${node.handle}`}>
                      <figure className="border border-gray-200 bg-white">
                        {node.image?.url ? (
                          <img src={node.image.url} alt={node.title} className="image-thumb" />
                        ) : (
                          <img src="/default-image.jpg" alt="Default" className="image-thumb" />
                        )}
                      </figure>
                    </a>
                  </div>
                ))*/}
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
      references(first: 10) {
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
      references(first: 10) {
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
