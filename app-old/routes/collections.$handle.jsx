import {defer, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import CouponBanners from "../components/CouponBanners";
import Accordion from "../components/accordion";
import { useLocation, useSearchParams } from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const filters = [];

  // Construct filters in the format Shopify expects
  searchParams.forEach((value, key) => {
    if (key.startsWith('filter.v.option.')) {
      const filterName = key.replace('filter.v.option.', '');
      filters.push({
        variantOption: {
          name: filterName,
          value: value,
        },
      });
    }
  });

  const { collection } = await storefront.query(COLLECTION_QUERY, {
    variables: { 
      handle, 
      filters: filters.length > 0 ? filters : null, // Send null if no filters
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

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

function useFilters() {
  const [searchParams] = useSearchParams();
  const activeFilters = [];

  searchParams.forEach((value, key) => {
    if (key.startsWith('filter.v.option.')) {
      activeFilters.push({
        name: key.replace('filter.v.option.', ''),
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

  const createFilterUrl = (filterName, value) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Check if this filter already exists with this value
    const filterKey = `filter.v.option.${filterName}`;
    const currentValue = newSearchParams.get(filterKey);
    
    if (currentValue === value) {
      // Remove filter if it's already set
      newSearchParams.delete(filterKey);
    } else {
      // Set new filter value
      newSearchParams.set(filterKey, value);
    }
    
    // Reset pagination when filters change
    newSearchParams.delete('cursor');
    
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  return (
    <>
      <CouponBanners bannerCoupons={collection.banner_coupons} />

      <header className="container 2xl:container">
        <div className='h-44 pt-3 pb-3' style={collection.bannerImage?.reference?.image?.url
          ? { backgroundImage: `url(${collection.bannerImage.reference.image.url})` }
          : {}}>
          <div className='text-center pl-4 pr-4 max-w-[1170px] mx-auto text-base text-white'>
            <h1 className='text-40 pt-5 pb-5 block font-semibold'><span className='' style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>{collection.title}</span></h1>
            {collection.bannerContent?.value && <p className='pt-2 text-base !text-white'>{collection.bannerContent.value}</p>}
            <a href="#faq">...Read More+</a>
          </div>
        </div>
      </header>

      <div className='bg-themegray pl-0 pr-0 mb-5 h-11 flex items-center'>
        <div className="breadcrumb 2xl:container">
          <ul className=" flex">
            <li className="!text-gay-500 text-sm underline hover:no-underline hover:!text-brand"><a href="/">Home&nbsp; </a></li>
            <li className="text-10 top-1 relative !text-gay-500 ">/ </li>
            <li className="!text-gay-500 text-sm underline hover:no-underline hover:!text-brand">&nbsp;<a href="/">Collection&nbsp; </a></li>
            <li className="text-10 top-1 relative !text-gay-500 ">/ </li>
            <li className="active text-sm !text-brand ">&nbsp; {collection.title}</li>
          </ul>
        </div>
      </div>
        
      {collection.relatedCategories?.references?.edges?.length > 0 && (
        <div className="page-list-collections">
          <div className="flex flex-wrap custom-container">
            {collection.relatedCategories.references.edges.map(({ node }) => (
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

      <div className='2xl:container '>
        <div className='flex gap-5 border-t border-grey-200 '>
          <div className='w-1/5 border-r border-grey-200 pt-7 pr-7 sticky top-0'>
            <div className='relative'>
            {collection.products.filters.map((filter) => (
    <div key={filter.id} className="flter-link border-b border-grey-200 py-4">
      <div className="flex justify-between text-base font-semibold uppercase">
        {filter.label}
        <button className="relative after:content-[''] after:w-2.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:border-b-gray-500 after:absolute after:right-3 after:top-1/2 after:transform after:-translate-y-1/2 after:rotate-45"></button>
      </div>
      <ul className="mt-5 [&>li]:leading-7 [&>li>a]:text-black hover:[&>li>a]:text-brand hover:[&>li>a]:underline">
        {filter.values.map((value) => (
          <li key={value.id}>
            <Link
              to={createFilterUrl(filter.id, value.input)}
              className={
                filters.some(f => 
                  f.name === filter.id && 
                  f.value === value.input
                ) ? 'font-bold text-brand' : ''
              }
            >
              {value.label} ({value.count})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ))}

            </div>
          </div>
          <div className="w-4/5">
            <div className="collection mt-50">
              <div className='relative text-center pb-10'>
                <h1 className='custom-h2 text-center text-blue text-3xl'>{collection.title}</h1>
              </div>

              <PaginatedResourceSection
                connection={collection.products}
                resourcesClassName="products-grid "
              >
                {({node: product, index}) => (
                  <ProductItem
                    key={product.id}
                    product={product}
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

      <Accordion page={collection} faqs={collection.faqs.references.edges} />
    </>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <div className='categoryBox'>
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
          </div>
        )}
        <div className='text-center pt-5'>
          <h4 className='text-18'>{product.title}</h4>
          <small className='text-17 font-semibold text-brand flex justify-center gap-2'>
            Only: <Money data={product.priceRange.minVariantPrice} />
          </small>
        </div>
      </Link>
    </div>
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
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
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