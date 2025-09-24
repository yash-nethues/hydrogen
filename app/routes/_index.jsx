import { defer } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import { isGroupProduct, formatGroupProductPrice } from '~/utils/groupPricing';
import { fetchGroupProductPriceRange } from '~/utils/groupPricing.server';
import { RichTextRenderer } from '~/components/RichTextRenderer';
import TopAdsLink from '~/components/home/TopAdsLink';
import SaleProducts from '~/components/home/SaleProducts';
import HomeBannerCaraousel, { loadBannerData } from '~/components/home/HomeBannerCaraousel';
import AdvertisementBanner, { loadADSData } from '~/components/home/AdvertisementBanner';
import ImageLinkList from '~/components/home/ImageLinkList';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { useIsClient } from "~/hooks/useIsClient";
import HomeProductsTabs from '~/components/home/HomeProductsTabs';
import HomeBlog from '~/components/home/HomeBlog';
import BetterMaterials from '~/components/home/BetterMaterials';
import CustomShop, { loadCustomShopData } from "~/components/home/CustomShop";
import ArtAndSupplies from '~/components/home/ArtAndSupplies';
import RecommendedProducts from '~/components/home/RecommendedProducts';
import CategoryLinkContent, { bannerWithContentImage } from '~/components/home/CategoryLinkContent';
import FeaturedCollections, { loadHomepageFeaturedCollections } from '~/components/home/FeaturedCollections';
import ShopSupplies, { loadFooterSupplyData } from '~/components/home/ShopSupplies';
import 'swiper/css';
export const meta = () => {
  return [{ title: 'Hydrogen | Home' }];
};


export async function loader(args) {

  const deferredData = loadDeferredData(args);

  // Await the critical data required to render the initial state of the page
  const criticalData = await loadCriticalData(args);

  const bannerData = await loadBannerData(args);

  const adsData = await loadADSData(args);
  const supplyData = await loadFooterSupplyData(args);
  const customShopItems = await loadCustomShopData(args);
  const featureContent = await loadFeatureContent(args);

  const bannerWithContentImageData = await bannerWithContentImage(args);
  const jtabFeaturedList = await loadJtabFeaturedProduct(args);
  const homepageFeaturedCollections = await loadHomepageFeaturedCollections(args);
  return defer({ ...deferredData, ...criticalData, ...bannerData, adsData, supplyData, featureContent, customShopItems, bannerWithContentImageData, jtabFeaturedList, homepageFeaturedCollections });
}

async function loadCriticalData({ context }) {
  const [{ collections }] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),

  ]);

  // Exclude collections where custom.collection_type === 'Brand'
  const featuredCollections = (collections?.nodes || [])
    .filter((collection) => {
      const typeMetafield = collection?.metafields?.find(
        (mf) => mf && mf.key === 'collection_type'
      );
      const value = (typeMetafield?.value || '').trim().toLowerCase();
      return value !== 'brand';
    })
    .filter((c) => !!c.image)
    .slice(0, 15);

  return {
    featuredCollections,
  };
}


function loadDeferredData({ context }) {

  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .then(async (response) => {
      if (!response?.products?.nodes) {
        return response;
      }

      // Process each product to fetch child product prices for group products
      const processedProducts = await Promise.all(
        response.products.nodes.map(async (product) => {
          if (isGroupProduct(product)) {
            const updatedPriceRange = await fetchGroupProductPriceRange(context, product);
            return {
              ...product,
              priceRange: updatedPriceRange
            };
          }
          return product;
        })
      );

      return {
        ...response,
        products: {
          ...response.products,
          nodes: processedProducts
        }
      };
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  const blogPosts = context.storefront
    .query(BLOG_POSTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
    blogPosts
  };
}

const GET_MEDIA_IMAGES_QUERY = `#graphql
  query GetMediaImages($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on MediaImage {
        id
        image {
          url
        }
      }
    }
  }
`;


async function fetchCollectionById(args, id) {
  const shopifyGid = `gid://shopify/Collection/${id}`;

  try {
    console.log(`Fetching collection with ID: ${shopifyGid}`);
    
    const response = await args.context.storefront.query(GET_COLLECTION_BY_ID_QUERY, {
      variables: { id: shopifyGid },
    });

    if (!response || !response.collection) {
      console.error(`Collection with ID ${id} not found.`);
      return null;
    }

    return response.collection;
  } catch (error) {
    console.error(`Error fetching collection with ID ${id}:`, error);
    return null;
  }
}

async function loadJtabFeaturedProduct({ context }, type = "jtab_featured_product") {
  try {
    const resp = await context.storefront.query(GET_METAOBJECT_QUERY, { variables: { type } });
    const edges = resp?.metaobjects?.edges || [];
    const items = [];
    for (const edge of edges) {
      const node = edge?.node;
      if (!node) continue;
      const fields = (node.fields || []).reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
      const imageId = fields.promo_image?.startsWith('gid://shopify/MediaImage/') ? fields.promo_image : null;
      let promo_image = fields.promo_image;
      if (imageId) {
        const mediaResp = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, { variables: { ids: [imageId] } });
        promo_image = mediaResp?.nodes?.[0]?.image?.url || promo_image;
      }
      items.push({
        featuring_section: fields.featuring_section || '',
        promo_url: fields.promo_url || '/',
        promo_image: promo_image || '/image/placeholder.jpg',
        promo_image_title: fields.promo_image_title || '',
      });
    }
    return items;
  } catch (e) {
    console.error('loadJtabFeaturedProduct error', e);
    return [];
  }
}

// Load feature content for ArtAndSupplies section from metaobject 'feature_content'
async function loadFeatureContent({ context }, type = "feature_content") {
  try {
    const resp = await context.storefront.query(GET_METAOBJECT_QUERY, { variables: { type } });
    const edge = resp?.metaobjects?.edges?.[0];
    const fields = (edge?.node?.fields || []).reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
    return {
      feature_title: fields.feature_title || '',
      feature_content: fields.feature_content || '',
      feature_button: fields.feature_button || '',
      feature_button_link: fields.feature_button_link || '#',
      background_color: fields.background_color || ''
    };
  } catch (e) {
    console.error('loadFeatureContent error', e);
    return null;
  }
}

export default function Homepage() {

  const data = useLoaderData();
  const isClient = useIsClient();
  console.log('collectionData',data);
  return (
    <div className="home flex flex-col ">
      <HomeBannerCaraousel banner={data.bannerItems} type="home_banner" />
      <TopAdsLink ads={data.adsData} />
      {isClient && <RecommendedProducts products={data.recommendedProducts} title="The Finest Supplies Created For Artists" formatGroupProductPrice={formatGroupProductPrice} />}
      <SaleProducts ads={data.adsData} />
      <BetterMaterials  title="Use Only The Best From Jerry's" products={data.recommendedProducts} featuredList={data.jtabFeaturedList} />
      <FinestSupplies />
      <ArtAndSupplies feature={data.featureContent} />
      <BetterMaterials title="Better Quality, Best Sellers" products={data.recommendedProducts} featuredList={data.jtabFeaturedList} />
      {isClient && <HomeProductsTabs products={data.recommendedProducts} />}
      <AdvertisementBanner ads={data.adsData} type="home_ads_with_link" />
      <CategoryLinkContent bannerWithContentImage={data.bannerWithContentImageData} type="banner_with_content_image" />
      <ImageLinkList ads={data.adsData} type="home_ads_with_link" />
      <CustomShop items={data.customShopItems} />
      <FeaturedCollections collections={data.homepageFeaturedCollections?.length ? data.homepageFeaturedCollections : data.featuredCollections} title="Shop By Categories" />
      <HomeBlog posts={data.blogPosts} title='Latest Blog Articles  <div class="block w-full text-sm mt-2.5">Know more about the latest updates</div>' />
      <ShopSupplies supplyList={data.supplyData} type="before_footer_supplies" title="Shop Our Artists Supplies" />
    </div>
  );
}


function OfferProducts() {
  return (
    <div className='container pt-6 md:px-10 2xl:px-[60px]'>
      <div className="flex" align="center">
        <div className="w-6/12"><a href="#"><img src="/image/special-buys-Jan25.jpg" width="98%" height="auto" alt="Special Buys For Artists" /></a></div>
        <div className="w-6/12"><a href="#"><img src="/image/free-offers-home-Jan2025.jpg" width="98%" height="auto" alt="FREE Offers &amp; Special Sale Prices at Jerry's" /></a></div>
      </div>
    </div>
  );
}

function FinestSupplies() {
  return (
    <div className='container pt-20 md:px-10 2xl:px-[60px] hidden '>

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
    metafields(identifiers: [
      {namespace: "custom", key: "collection_type"}
    ]) {
      id
      key
      value
    }
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 200, sortKey: UPDATED_AT, reverse: true) {
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
      maxVariantPrice {
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
    metafields(identifiers: [
      {namespace: "custom", key: "jtab"},
      {namespace: "custom", key: "select_product_type"},
      {namespace: "custom", key: "child_products"}
    ]) {
      id
      key
      value
    }
  }
  query RecommendedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

// CHILD_PRODUCTS_PRICE_QUERY moved to '~/utils/groupPricing.server'

const GET_METAOBJECT_QUERY = `#graphql
  query GetMetaobject($type: String!) {
    metaobjects(type: $type, first: 20) {
      edges {
        node {
          handle
          type
          fields {
            key
            value
          }
        }
      }
    }
  }
`;

const BLOG_POSTS_QUERY = `#graphql
  query BlogPosts($country: CountryCode, $language: LanguageCode) 
    @inContext(country: $country, language: $language) {
    blog(handle: "blogs") {
      articles(first: 5, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          title
          handle
          publishedAt
          content
          image {
            url
            altText
          }
        }
      }
    }
  }
`;


const GET_COLLECTION_BY_ID_QUERY = `#graphql
  query GetCollectionByIdHome($id: ID!) {
    collection(id: $id) {
      id
      title
      description
      handle
      image {
        url
        altText
      }
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
              }
            }
            metafields(identifiers: [{namespace: "custom", key: "jtab"}]) {
              id
              key
              value
            }
          }
        }
      }
    }
  }
`;
