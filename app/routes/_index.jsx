import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import React, { useEffect } from 'react';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render the initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollections: collections.nodes,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  return (
    <div className="home">   
      <HomeBannerCaraousel />    
      <RecommendedProducts products={data.recommendedProducts} />
      <AdvertisementBanner link='https://www.jerrysartarama.com/promotions/davinci-panels' />
      <FeaturedCollections collections={data.featuredCollections} />
    </div>
  );
}

/**
 * @param {{
 *   collections: FeaturedCollectionFragment[];
 * }}
 */
function FeaturedCollections({collections}) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="featured-collections">
      <h2 className="text-sky-500">Shop By Categories</h2>
      <div className="featured-collections-grid">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            className="featured-collection"
            to={`/collections/${collection.handle}`}
          >
            {collection.image && (
              <div className="featured-collection-image">
                <Image data={collection.image} sizes="100vw" />
              </div>
            )}
            <h3>{collection.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}


function AdvertisementBanner({link}) {

  return (
    <div className="advertisement-banner">
       <a href="{link}">
        <img src="/image/davinci-pro-artist-painting-panels-1-2024.jpg" className="advertisement"/>
        </a>
    </div>
  );

}


function HomeBannerCaraousel(){
  useEffect(() => {
    const slides = document.querySelector('.carousel-slides');
    const slideCount = slides.children.length;
    const indicators = document.querySelectorAll('.indicator');
    let currentIndex = 0;

    const updateCarousel = () => {
      slides.style.transform = `translateX(-${currentIndex * 100}%)`;
      indicators.forEach((ind, idx) => {
        ind.classList.toggle('bg-gray-800', idx === currentIndex);
        ind.classList.toggle('bg-gray-400', idx !== currentIndex);
      });
    };

    document.getElementById('prev').addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateCarousel();
    });

    document.getElementById('next').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slideCount;
      updateCarousel();
    });

    indicators.forEach((indicator, idx) => {
      indicator.addEventListener('click', () => {
        currentIndex = idx;
        updateCarousel();
      });
    });

    // Initialize carousel
    updateCarousel();
  }, []); // Empty dependency array ensures this runs only once after the component mounts

  return (
    <div className="pt-5">
      <div className="2xl:container">
        <div id="carousel" className="relative pb-8">
          <div className="relative overflow-hidden">
            <div className="carousel-slides flex transition-transform duration-500">
              <img src="image/banner-wn-lqtx-67-1600px-b.jpg" alt="Slide 1" className="w-full flex-shrink-0"/>
              <img src="image/fine-art-brushes-on-sale.jpg" alt="Slide 2" className="w-full flex-shrink-0"/>
            </div>
            <button id="prev" className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/50 hover:bg-white flex items-center justify-center text-4xl transition-all text-blue w-10 h-10 rounded-full">
              &#8249;
            </button>
            <button id="next" className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/50 hover:bg-white flex items-center justify-center text-4xl  transition-all text-blue w-10 h-10 rounded-full">
              &#8250;
            </button>
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button className="indicator w-2 h-2 bg-gray-400 rounded-full" data-slide="0"></button>
            <button className="indicator w-2 h-2 bg-gray-400 rounded-full" data-slide="1"></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2 className="text-brand-gold">Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
