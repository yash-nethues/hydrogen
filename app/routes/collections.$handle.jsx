import {defer, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import CouponBanners from "../components/CouponBanners";
import Accordion from "../components/accordion";
import CategorySlider from "../components/CategorySlider";
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

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collection,
  };
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


export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();

  console.warn({collection});

  

  return (
    <>
    <CouponBanners />

    <header className="2xl:container">
        <div className='h-44 pt-3 pb-3 border-t border-grey-200'>
       <div className='text-center pl-4 pr-4 max-w-[1170px] mx-auto text-base
 text-blue'>
         <h1 className='text-40 pt-5 pb-5 block font-semibold'><span className=''>{collection.title}</span></h1>
        <p>At Jerry's, we carry a large selection of specialty made and curated artist stretched canvas for painting on sale in any media from standard to high quality fine art canvas. More choices of the finest quality canvas and surface types for better results</p>
          <a href="#">...Read More+</a>
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
        <CategorySlider />
    <div className='2xl:container '>
      <div className='flex gap-5 border-t border-grey-200 '>
    <div className='w-1/5 border-r border-grey-200 pt-7 pr-7 sticky top-0'>
      <div className='relative'>
          <div class="flter-link border-b border-grey-200 py-4">
            <div className='flex justify-between text-base font-semibold uppercase' >Category 
            <button className="relative after:content-[''] after:w-2.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:border-b-gray-500 after:absolute after:right-3 after:top-1/2 after:transform after:-translate-y-1/2 after:rotate-45"></button>
              </div>
              <ul className="mt-5 [&>li]:leading-7 [&>li>a]:text-black hover:[&>li>a]:text-brand hover:[&>li>a]:underline">
               <li><Link to="">Stretched Cotton Canvas</Link></li>
               <li><Link to="">Stretched Linen Canvas</Link></li>
              <li><Link to="">Stretched Decorative Canvas</Link></li>
          </ul>
        </div>
        <div class="flter-link border-b border-grey-200 py-4">
          <div className='flex justify-between text-xl font-semibold uppercase'>Shop By</div>

        </div>
        <div class="flter-link border-b border-grey-200 py-4">
          <div className='flex justify-between text-base font-semibold uppercase'>Brand 
          <button className="relative after:content-[''] after:w-2.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:border-b-gray-500 after:absolute after:right-3 after:top-1/2 after:transform after:-translate-y-1/2 after:rotate-45"></button>
             </div>
             <ul className="mt-5  hidden [&>li]:leading-7 [&>li>a]:text-black hover:[&>li>a]:text-brand hover:[&>li>a]:underline">
              <li><Link to="">Centurion</Link></li>
              <li><Link to="">Creative Inspirations</Link></li>
              <li><Link to="">Fredrix</Link></li>
          </ul>
        </div>
        <div class="flter-link border-b border-grey-200 py-4">
          <div className='flex justify-between text-base font-semibold uppercase'>Brand 
          <button className="relative after:content-[''] after:w-2.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:border-b-gray-500 after:absolute after:right-3 after:top-1/2 after:transform after:-translate-y-1/2 after:rotate-45"></button>
             </div>
             <ul className="mt-5 hidden [&>li]:leading-7 [&>li>a]:text-black hover:[&>li>a]:text-brand hover:[&>li>a]:underline">
            <li><Link to="">Centurion</Link></li>
            <li><Link to="">Creative Inspirations</Link></li>
            <li><Link to="">Fredrix</Link></li>
          </ul>
        </div>
        <div class="flter-link border-b border-grey-200 py-4">
          <div className='flex justify-between text-base font-semibold uppercase'>Brand 
          <button className="relative after:content-[''] after:w-2.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:border-b-gray-500 after:absolute after:right-3 after:top-1/2 after:transform after:-translate-y-1/2 after:rotate-45"></button>
             </div>
           <ul className='hidden'>
            <li><Link to="">Centurion</Link></li>
            <li><Link to="">Creative Inspirations</Link></li>
            <li><Link to="">Fredrix</Link></li>
          </ul>
        </div>
        <div class="flter-link border-b border-grey-200 py-4">
          <div className='flex justify-between text-base font-semibold uppercase'>Brand 
          <button className="relative after:content-[''] after:w-2.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:border-b-gray-500 after:absolute after:right-3 after:top-1/2 after:transform after:-translate-y-1/2 after:rotate-45"></button>
             </div>
           <ul className='hidden'>
            <li><Link to="">Centurion</Link></li>
            <li><Link to="">Creative Inspirations</Link></li>
            <li><Link to="">Fredrix</Link></li>
          </ul>
        </div>
      </div>
    </div>
      <div className="w-4/5">
      <div className="collection mt-50">
        <div className='relative text-center pb-10'>
            <h1 className='custom-h2 text-center text-blue text-3xl'>{collection.title}</h1>
      </div>
      <p className="collection-description">{collection.description}</p>

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

    <section className='mt-10 p-10 bg-themegray'>
     <div className="faqs custom-container">
      <ul className="bg-white border border-gray-200">
        {Array(4)
          .fill()
          .map((_, index) => {
            return (
              <li key={index}>
                <div className="title relative pl-7 pt-5 pb-5 pb-10 border-b border-gray-200 text-blue text-xl font-500 justify-between flex">
                  <h2 className="mb-3">Title</h2>
                  <button
                    className="btn right-4 absolute text-3xl"
                    onClick={() => handleToggle(index)}>
                    +
                  </button>
                </div>
                <div className="hidden p-7 pb-14 text-base a:text-blue text-base [&>p>a]:underline [&>p>a]:font-bold [&>p>a]:text-blue hover:[&>p>a]:text-brand [&>p]:pb-4">
                     dddfd 
                  </div> 
              </li>
            );
          })}
      </ul>
      </div>
      </section>

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
      <small className='text-17 font-semibold   text-brand flex justify-center gap-2'>
          Only:    <Money data={product.priceRange.minVariantPrice} />
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

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
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
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
