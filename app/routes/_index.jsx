import { defer } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import { RichTextRenderer } from '~/components/RichTextRenderer';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { useIsClient } from "~/hooks/useIsClient";
import ProductsTabs from '~/components/ProductsTabs';
import HomeBlog from '~/components/home/HomeBlog';
import BetterMaterials from '~/components/home/BetterMaterials';
import CustomShop from "~/components/home/CustomShop";
import 'swiper/css';
export const meta = () => {
  return [{ title: 'Hydrogen | Home' }];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render the initial state of the page
  const criticalData = await loadCriticalData(args);

  const bannerData = await loadBannerData(args);

  const adsData = await loadADSData(args);
  const supplyData = await loadFooterSupplyData(args);
  const customShopItems = await loadCustomShop(args);
  const featureContent = await loadFeatureContent(args);

  const bannerWithContentImageData = await bannerWithContentImage(args);
  const jtabFeaturedList = await loadJtabFeaturedProduct(args);
  const homepageFeaturedCollections = await loadHomepageFeaturedCollections(args);
  return defer({ ...deferredData, ...criticalData, ...bannerData, adsData, supplyData, featureContent, customShopItems, bannerWithContentImageData, jtabFeaturedList, homepageFeaturedCollections });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
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

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
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


  console.log('blogPosts', blogPosts);

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

    console.log("Raw API response:", response); // Log the response

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


async function loadBannerData({ context }, type = "home_banner") {
  try {
    const GetMetaobject = await context.storefront.query(GET_METAOBJECT_QUERY, {
      variables: { type }
    });

    const edges = GetMetaobject?.metaobjects?.edges || [];
    // Each metaobject entry represents a banner item now. Fields:
    // - banner_image: MediaImage GID or URL
    // - banner_heading: string (optional)
    // - banner_content: string (optional)
    // - button_text, button_link (optional)

    // Collect all media image IDs to resolve to URLs in one request
    const mediaIds = [];
    const items = edges.map((edge) => {
      const fields = (edge?.node?.fields || []).reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
      const banner_image = fields.banner_image || '';
      const mobile_image = fields.mobile_image || '';
      if (typeof banner_image === 'string' && banner_image.startsWith('gid://shopify/MediaImage/')) {
        mediaIds.push(banner_image);
      }
      if (typeof mobile_image === 'string' && mobile_image.startsWith('gid://shopify/MediaImage/')) {
        mediaIds.push(mobile_image);
      }
      const fromRaw = fields.from || fields.from || '';
      const toRaw = fields.to || fields.to || '';
      const parseTs = (v) => {
        if (!v || typeof v !== 'string') return null;
        const ts = Date.parse(v);
        return Number.isFinite(ts) ? ts : null;
      };
      return {
        raw_image: banner_image,
        raw_mobile_image: mobile_image,
        banner_heading: fields.banner_heading || '',
        banner_content: fields.banner_content || '',
        banner_order: parseInt(fields.banner_order) || 0,
        fromTs: parseTs(fromRaw),
        toTs: parseTs(toRaw),
        // Support multiple possible field names for button text and link
        button: fields.button_text || fields.banner_button || fields.banner_button_text || '',
        button_link: fields.button_link || fields.banner_button_link || fields.banner_link || '#',
      };
    });

    let imageUrlMap = {};
    if (mediaIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, {
        variables: { ids: mediaIds }
      });
      imageUrlMap = (mediaResponse?.nodes || []).reduce((acc, node) => {
        if (node?.id && node?.image?.url) acc[node.id] = node.image.url;
        return acc;
      }, {});
    }

    // Filter by time window (from/to). If no bounds provided, always include
    const nowTs = Date.now();
    const timeFiltered = items.filter((it) => {
      if (it.fromTs && nowTs < it.fromTs) return false;
      if (it.toTs && nowTs > it.toTs) return false;
      return true;
    });

    // Sort items by banner_order in ascending order
    const sortedItems = timeFiltered.sort((a, b) => a.banner_order - b.banner_order);

    const bannerItems = sortedItems.map((it) => ({
      image: it.raw_image?.startsWith('gid://shopify/MediaImage/') ? (imageUrlMap[it.raw_image] || '/image/placeholder.jpg') : (it.raw_image || '/image/placeholder.jpg'),
      mobileImage: it.raw_mobile_image?.startsWith('gid://shopify/MediaImage/') ? (imageUrlMap[it.raw_mobile_image] || '') : (it.raw_mobile_image || ''),
      heading: it.banner_heading,
      content: it.banner_content,
      button: it.button,
      button_link: it.button_link,
    }));

    return { bannerItems };
  } catch (error) {
    console.error('Error fetching banner data:', error);
    return { bannerItems: [] };  // Return an empty array in case of error
  }
}


async function loadADSData({ context }, type = "home_ads_with_link") {
  try {
    const GetMetaobject = await context.storefront.query(GET_METAOBJECT_QUERY, {
      variables: { type }
    });

    console.log('Metaobject Response:', GetMetaobject);

    const adsAllData = GetMetaobject?.metaobjects?.edges || [];

    const adsData = adsAllData.map(edge => {
      return edge.node.fields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});
    });

    console.log('Processed Ads Data (Before Fetching Images):', adsData);

    // Extract MediaImage IDs from adsData (desktop and mobile)
    const mediaImageIds = [];
    adsData.forEach((ad) => {
      if (ad.ads_image?.startsWith('gid://shopify/MediaImage/')) mediaImageIds.push(ad.ads_image);
      if (ad.mobile_image?.startsWith('gid://shopify/MediaImage/')) mediaImageIds.push(ad.mobile_image);
    });

    console.log('MediaImage IDs:', mediaImageIds);

    // Fetch image URLs for MediaImage IDs
    if (mediaImageIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, {
        variables: { ids: mediaImageIds }
      });

      console.log('Media Response:', mediaResponse);

      // Create a map of MediaImage IDs to URLs
      const imageUrlMap = mediaResponse.nodes.reduce((acc, node) => {
        if (node?.image?.url) {
          acc[node.id] = node.image.url;
        }
        return acc;
      }, {});

      console.log('Image URL Map:', imageUrlMap);

      // Map image URLs back to adsData
      adsData.forEach(ad => {
        if (ad.ads_image?.startsWith('gid://shopify/MediaImage/')) {
          ad.ads_image = imageUrlMap[ad.ads_image] || "/image/placeholder.jpg";
        }
        if (ad.mobile_image?.startsWith('gid://shopify/MediaImage/')) {
          ad.mobile_image = imageUrlMap[ad.mobile_image] || ad.ads_image || "/image/placeholder.jpg";
        }
      });
    }

    console.log('Processed Ads Data (After Fetching Images):', adsData);

    return adsData;
  } catch (error) {
    console.error('Error fetching ads data:', error);
    return [];
  }
}

// Load homepage featured collections via metaobject 'homepage_feature_collection'
async function loadHomepageFeaturedCollections({ context }, type = "homepage_feature_collection") {
  try {
    const resp = await context.storefront.query(GET_METAOBJECT_QUERY, { variables: { type } });
    const edges = resp?.metaobjects?.edges || [];
    // Collect GIDs from all metaobjects and fields
    const gidSet = new Set();
    for (const edge of edges) {
      const fieldList = edge?.node?.fields || [];
      // Any JSON array in any field
      for (const f of fieldList) {
        const val = f?.value;
        if (!val || typeof val !== 'string') continue;
        // Try parse as JSON array
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => {
              if (typeof p === 'string' && p.startsWith('gid://shopify/Collection/')) gidSet.add(p);
            });
            continue;
          }
        } catch {
          // not JSON, continue
        }
        // If direct GID string
        if (val.startsWith('gid://shopify/Collection/')) gidSet.add(val);
      }
    }
    const rawIds = Array.from(gidSet);
    if (!Array.isArray(rawIds) || rawIds.length === 0) return [];
    // Fetch collections by ID
    const results = await Promise.all(
      rawIds.map(async (gid) => {
        try {
          const res = await context.storefront.query(GET_COLLECTION_BY_ID_QUERY, { variables: { id: gid } });
          return res?.collection || null;
        } catch {
          return null;
        }
      })
    );
    return results.filter((c) => c && c.image);
  } catch (e) {
    console.error('loadHomepageFeaturedCollections error', e);
    return [];
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

async function loadFooterSupplyData({ context }, type = "before_footer_supplies") {
  try {
    // Fetch the metaobject data
    const GetMetaobject = await context.storefront.query(GET_METAOBJECT_QUERY, {
      variables: { type }
    });

    console.log('Metaobject Response:', GetMetaobject);

    // Parse the metaobject edges from the response
    const allSupplyData = GetMetaobject?.metaobjects?.edges || [];

    // Process each metaobject to extract fields
    const supplyData = allSupplyData.map(edge => {
      return edge.node.fields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});
    });

    console.log('Processed Supply Data (Before Fetching Images):', supplyData);

    // Extract MediaImage IDs from supplyData
    const mediaImageIds = supplyData
      .map(supply => supply.icon)
      .filter(icon => icon?.startsWith('gid://shopify/MediaImage/'));

    console.log('MediaImage IDs:', mediaImageIds);

    // Fetch image URLs for MediaImage IDs
    if (mediaImageIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, {
        variables: { ids: mediaImageIds }
      });

      console.log('Media Response:', mediaResponse);

      // Ensure `mediaResponse.nodes` exists before using reduce
      const imageUrlMap = (mediaResponse?.nodes || []).reduce((acc, node) => {
        if (node?.id && node?.image?.url) {
          acc[node.id] = node.image.url;
        }
        return acc;
      }, {});

      console.log('Image URL Map:', imageUrlMap);

      // Map image URLs back to supplyData
      supplyData.forEach(supply => {
        if (supply.icon?.startsWith('gid://shopify/MediaImage/')) {
          supply.icon = imageUrlMap[supply.icon] || "/image/placeholder.jpg";
        }
      });
    }

    console.log('Processed Supply Data (After Fetching Images):', supplyData);

    return supplyData;
  } catch (error) {
    console.error('Error fetching supply data:', error);
    return []; // Return an empty array in case of error
  }
}

// Load Custom Shop content from metaobject 'homepage_custom_shop'
async function loadCustomShop({ context }, type = "homepage_custom_shop") {
  try {
    const resp = await context.storefront.query(GET_METAOBJECT_QUERY, { variables: { type } });
    const edges = resp?.metaobjects?.edges || [];
    const items = edges.map((edge) => {
      const fields = (edge?.node?.fields || []).reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
      return {
        shop_title: fields.shop_title || '',
        shop_subtitle: fields.shop_subtitle || '',
        shop_content: fields.shop_content || '',
        shop_image: fields.shop_image || '',
        shop_button: fields.shop_button || '',
        button_link: fields.button_link || '#',
        order: parseInt(fields.ads_order) || 0,
      };
    });

    // Resolve MediaImage IDs to URLs
    const mediaIds = items
      .map((it) => it.shop_image)
      .filter((id) => typeof id === 'string' && id.startsWith('gid://shopify/MediaImage/'));
    let imageUrlMap = {};
    if (mediaIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, { variables: { ids: mediaIds } });
      imageUrlMap = (mediaResponse?.nodes || []).reduce((acc, node) => {
        if (node?.id && node?.image?.url) acc[node.id] = node.image.url;
        return acc;
      }, {});
    }

    const normalized = items
      .map((it) => ({
        ...it,
        shop_image: it.shop_image?.startsWith('gid://shopify/MediaImage/') ? (imageUrlMap[it.shop_image] || '/image/placeholder.jpg') : (it.shop_image || '/image/placeholder.jpg'),
      }))
      .sort((a, b) => a.order - b.order);

    // Return only the latest two entries (by incoming order), prefer end of list
    const latestTwo = normalized.slice(-2);
    return latestTwo;
  } catch (e) {
    console.error('loadCustomShop error', e);
    return [];
  }
}

async function bannerWithContentImage({ context }, type = "banner_with_content_image") {
  try {
    // Fetch the metaobject data
    const GetMetaobject = await context.storefront.query(GET_METAOBJECT_QUERY, {
      variables: { type }
    });

    console.log('Metaobject Response:', GetMetaobject);

    // Parse the metaobject edges from the response
    const allbannerWithContentImageData = GetMetaobject?.metaobjects?.edges || [];

    // Process each metaobject to extract fields
    const bannerWithContentImageData = allbannerWithContentImageData.map(edge => {
      return edge.node.fields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});
    });

    console.log('Processed Supply Data (Before Fetching Images):', bannerWithContentImageData);

    // Extract MediaImage IDs from supplyData
    const mediaImageIds = bannerWithContentImageData
      .map(bannerWithContentImage => bannerWithContentImage.image)
      .filter(image => image?.startsWith('gid://shopify/MediaImage/'));

    console.log('MediaImage IDs:', mediaImageIds);

    // Fetch image URLs for MediaImage IDs
    if (mediaImageIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, {
        variables: { ids: mediaImageIds }
      });

      console.log('Media Response:', mediaResponse);

      // Ensure `mediaResponse.nodes` exists before using reduce
      const imageUrlMap = (mediaResponse?.nodes || []).reduce((acc, node) => {
        if (node?.id && node?.image?.url) {
          acc[node.id] = node.image.url;
        }
        return acc;
      }, {});

      console.log('Image URL Map:', imageUrlMap);

      // Map image URLs back to supplyData
      bannerWithContentImageData.forEach(bannerWithContentImage => {
        if (bannerWithContentImage.image?.startsWith('gid://shopify/MediaImage/')) {
          bannerWithContentImage.image = imageUrlMap[bannerWithContentImage.image] || "/image/placeholder.jpg";
        }
      });
    }

    console.log('Processed Supply Data (After Fetching Images):', bannerWithContentImageData);

    return bannerWithContentImageData;
  } catch (error) {
    console.error('Error fetching supply data:', error);
    return []; // Return an empty array in case of error
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
      {isClient && <RecommendedProducts products={data.recommendedProducts} title="The Finest Supplies Created For Artists" />}
      <SaleProducts ads={data.adsData} type="home_ads_with_link" />
      <BetterMaterials  title="Use Only The Best From Jerry's" products={data.recommendedProducts} featuredList={data.jtabFeaturedList} />
      <FinestSupplies />
      <ArtAndSupplies feature={data.featureContent} />
      <BetterMaterials title="Better Quality, Best Sellers" products={data.recommendedProducts} featuredList={data.jtabFeaturedList} />
      {isClient && <ProductsTabs products={data.recommendedProducts} />}
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
/**   {Array(20).fill().map((_, index) => {
                            return (
                            <SwiperSlide key={index}>
                                  <div className="slider-item">
                                        <figure>
                                            <img src="image/tusc-pine-oils-main-group.jpg" />
                                        </figure>
                                        <div className="info text-center">
                                        <div className="savinBox ">
                                                <div className="saveTxt text-brand text-center font-bold">Now Only</div>
                                                <div className="amount-text te
 * @param {{
 *   collections: FeaturedCollectionFragment[];
 * }}
 */

function HomeBannerCaraousel({ banner, type }) {
  console.log('banner:- ', banner);
  // banner is now array of bannerItems: {image, heading, content, button, button_link}
  const items = Array.isArray(banner) ? banner : [];
  
  useEffect(() => {
    const root = document.querySelector('.home_banner');
    if (!root) return;
    const slides = root.querySelector('.carousel-slides');
    const indicators = root.querySelectorAll('.indicator');
    if (!slides) return;
    const slideEls = slides.querySelectorAll('.carousel-slide');
    const slideCount = slideEls.length;
    if (slideCount === 0) return;

    // Ensure proper layout for translateX carousel
    slides.style.display = 'flex';
    slides.style.willChange = 'transform';
    slides.style.transition = 'transform 0.5s ease';
    slideEls.forEach((el) => {
      el.style.flex = '0 0 100%';
      el.style.width = '100%';
    });
    let currentIndex = 0;

    const updateCarousel = () => {
      slides.style.transform = `translateX(-${currentIndex * 100}%)`;
      indicators.forEach((ind, idx) => {
        ind.classList.toggle('bg-gray-800', idx === currentIndex);
        ind.classList.toggle('bg-gray-400', idx !== currentIndex);
      });
    };

    const prevBtn = root.querySelector('.carousel-prev');
    const nextBtn = root.querySelector('.carousel-next');

    const onPrev = () => {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateCarousel();
    };
    const onNext = () => {
      currentIndex = (currentIndex + 1) % slideCount;
      updateCarousel();
    };
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);

    indicators.forEach((indicator, idx) => {
      const onClick = () => {
        currentIndex = idx;
        updateCarousel();
      };
      indicator.addEventListener('click', onClick);
      // Attach reference for cleanup
      indicator.__onClick = onClick;
    });

    updateCarousel();

    return () => {
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      indicators.forEach((indicator) => {
        if (indicator.__onClick) {
          indicator.removeEventListener('click', indicator.__onClick);
          delete indicator.__onClick;
        }
      });
    };
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="home_banner relative   -order-1 md:order-none">
      <div className='container px-[10px] md:px-10 2xl:px-[60px]'>
      <div className="carousel-container  relative overflow-hidden">
        <div className="carousel-slides relative">
          {items.map((b, index) => (
            <div key={index} className="carousel-slide relative">
              <div className="relative">
                <div className="carousel-slide-inner">
                  <a key={index} href={b.button_link || '#'}>
                    {/* mobile image */}
                    <img key={`m-${index}`} src={b.mobileImage || b.image} alt={`Slide ${index + 1}`} className="w-full md:hidden" />
                    {/* desktop image */}
                    <img key={`d-${index}`} src={b.image} alt={`Slide ${index + 1}`} className="w-full hidden md:block" />
                  </a>
                </div>
                {((b.heading || b.content) && b.button) && (
                  <div className='absolute z-10 top-2/4 left-2/4 bg-white/90 border-2 border-grey-200 w-3/5 max-[479px]:w-[90%] max-w-[600px] -translate-x-2/4  mx-5 max-[479px]:!mx-0 -translate-y-2/4'> 
                    <div className="p-j15 md:p-5 text-center">
                      {b.heading && (
                        <h2 className='text-base md:text-xl tb:text-26 jlg:text-34 leading-tight font-medium  text-blue mb-2.5 md:mb-4' dangerouslySetInnerHTML={{__html: b.heading}} />
                      )}
                      {b.content && (
                        <p className='mb-2.5 text-xs md:text-sm jxl:text-base !text-blue' dangerouslySetInnerHTML={{__html: b.content}} />
                      )}
                      {b.button && (
                        <a className="btn-secondary uppercase min-w-[165px] !leading-none inline-block min-h-j30 md:min-h-[38px] tb:min-h-10  max-[767px]:text-xs py-2.5 md:pt-3 rounded-[3px] shadow-[0px_0px_5px_rgba(0,0,0,0.4)]" href={b.button_link || '#'} >{b.button}</a>
                      )}
                    </div>
                  </div>
                )}
                {(!b.heading && !b.content && b.button) && (
                  <div className="absolute bottom-[5%] left-[3%]">
                    <a className="btn-secondary uppercase min-w-[165px] !leading-none inline-block min-h-j30 md:min-h-[38px] tb:min-h-10  max-[767px]:text-xs py-2.5 md:pt-3 rounded-[3px] shadow-[0px_0px_5px_rgba(0,0,0,0.4)]" href={b.button_link || '#'} >{b.button}</a>
                  </div>
                )}
              </div>
              <div className="carousel-caption absolute bottom-0 w-full text-center"></div>
            </div>
          ))}
        </div>
        <button className="carousel-prev carousel-nav absolute top-1/2 left-2 -translate-y-1/2 bg-white/50 hover:bg-white flex items-center justify-center text-4xl transition-all text-blue w-10 h-10 rounded-full -scale-x-100"></button>
        <button className="carousel-next carousel-nav absolute top-1/2 right-2 -translate-y-1/2 bg-white/50 hover:bg-white flex items-center justify-center text-4xl  transition-all text-blue w-10 h-10 rounded-full"></button>
      </div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (
          <button key={index} className="indicator w-2 h-2 bg-gray-400 rounded-full" data-slide={index}></button>
        ))}
      </div>
      </div>
      
    </div>
  );
}


function TopAdsLink({ ads }) {
  console.log('adsData:- ', ads);
  return (
    <div className="container mt-j30 md:mt-[50px] px-0 md:px-10 2xl:px-[60px]  -order-1 md:order-none">
      <ul className="flex">
        {ads
          ?.filter(ad => ad.position_?.trim().toLowerCase() === "top hero banner ad")
          .map((ad, index) => (
            <li key={index} data-position={ad.position_}>
              <a href={ad.ads_link || "#"}>
                {/* desktop image */}
                <img src={ad.ads_image || "/image/placeholder.jpg"} alt={`Ad ${index + 1}`} className="cat-list inline-block hidden md:block" />
                {/* mobile image */}
                <img src={ad.mobile_image || ad.ads_image || "/image/placeholder.jpg"} alt={`Ad ${index + 1}`} className="cat-list inline-block md:hidden" />
              </a>
            </li>
          ))
        }
      </ul>
    </div>
  );
}



// Utility function to check if a product is a group product and calculate price range
function isGroupProduct(product) {
  const productTypeMetafield = product.metafields?.find(metafield => 
    metafield && metafield.key === 'select_product_type'
  );
  return productTypeMetafield?.value === 'Grouped Product';
}

// Utility function to parse child product IDs from metafield
function parseChildProductIds(product) {
  const childProductsMetafield = product.metafields?.find(metafield => 
    metafield && metafield.key === 'child_products'
  );
  
  if (!childProductsMetafield) {
    return [];
  }
  
  try {
    return JSON.parse(childProductsMetafield.value);
  } catch (e) {
    return [];
  }
}

// Function to fetch child product prices and calculate group product price range
async function fetchGroupProductPriceRange(context, product) {
  if (!isGroupProduct(product)) {
    return product.priceRange;
  }
  
  const childProductIds = parseChildProductIds(product);
  if (childProductIds.length === 0) {
    return product.priceRange; // Fallback to original price range
  }
  
  try {
    const childProductsResponse = await context.storefront.query(CHILD_PRODUCTS_PRICE_QUERY, {
      variables: { ids: childProductIds }
    });
    
    const childProducts = childProductsResponse?.nodes || [];
    if (childProducts.length === 0) {
      return product.priceRange; // Fallback to original price range
    }
    
    // Calculate min and max prices from child products
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let currencyCode = 'USD';
    
    childProducts.forEach(childProduct => {
      if (childProduct?.priceRange) {
        const childMinPrice = parseFloat(childProduct.priceRange.minVariantPrice?.amount || '0');
        const childMaxPrice = parseFloat(childProduct.priceRange.maxVariantPrice?.amount || '0');
        
        if (childMinPrice < minPrice) {
          minPrice = childMinPrice;
          currencyCode = childProduct.priceRange.minVariantPrice?.currencyCode || 'USD';
        }
        if (childMaxPrice > maxPrice) {
          maxPrice = childMaxPrice;
        }
      }
    });
    
    // If no valid prices found, fallback to original
    if (minPrice === Infinity || maxPrice === -Infinity) {
      return product.priceRange;
    }
    
    return {
      minVariantPrice: {
        amount: minPrice.toString(),
        currencyCode
      },
      maxVariantPrice: {
        amount: maxPrice.toString(),
        currencyCode
      }
    };
  } catch (error) {
    console.error('Error fetching child product prices:', error);
    return product.priceRange; // Fallback to original price range
  }
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

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({ products, title }) {
  return (
    <div className="container mt-[50px] md:px-10 2xl:px-[60px]  -order-1 md:order-none">
      <div className="recommended-products [&_.recommended-item:not(:nth-child(-n+3))]:max-[767px]:hidden max-[767px]:-mx-5 bg-themegray p-2.5 tb:p-10">
        <div className='text-center'>
          <h2 className="flex justify-center text-center font-semibold text-blue text-25 md:text-34 mb-j30 center">{title}</h2>
        </div>
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
              
              // Limit products based on title
              const maxProducts = title === "The Finest Supplies Created For Artists" ? 5 : 12;
              const limitedProducts = filteredProducts.slice(0, maxProducts);
              
              return (
                <div className="flex w-full border-dashed  border-gray border border-r-0 rounded">
                  {limitedProducts.length > 0 ? (
                    limitedProducts.map((product) => (
                      <div className='recommended-item recommended_box relative bg-white p-2.5 pb-[45px] md:pb-[35px] lg:p-5 lg:pb-10 border-dashed  border-gray border-r w-1/3 md:w-1/4'  key={product.id}>
                         <span className='absolute top-2.5 left-2.5 max-[479px]:top-j5 max-[479px]:left-j5 bg-themeteal text-white font-semibold tb:font-bold py-[3px] px-2 text-xs  max-[479px]:text-10 leading-normal tb:text-sm rounded-sm uppercase'> TOP CHOICE </span>
                        <Link
                          key={product.id}
                          className="recommended-product"
                          to={`/products/${product.handle}`}
                        >
                          <figure className="mb-2.5 pb-0">
                          <Image
                            data={product.images.nodes[0]}
                            aspectRatio="1/1"
                            sizes="(min-width: 45em) 20vw, 50vw"
                          />
                          </figure>
                          <div className='text-center'>
                            <h4 className='font-semibold text-base max-[479px]:text-10 mb-0 !leading-normal text-base-500'>{product.title}</h4>
                            <small className='text-xs max-[479px]:text-13 mt-j5 tb:text-15 font-semibold text-brand-300 flex justify-center gap-2'>
                              Only: <Money data={formatGroupProductPrice(product)} />
                            </small>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-8">
                      <p className="text-gray-500">No products found for this category.</p>
                    </div>
                  )}
                </div>
              );
            }}
          </Await>
        </Suspense>
      
      </div>
    </div>
  );
}


function FeaturedCollections({ collections, title }) {
  const [isMobile, setIsMobile] = useState(false);

  if (!collections || collections.length === 0) return null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className='container mt-j30 md:mt-[50px] jlg::mt-[65px] md:px-10 2xl:px-[60px]'>
      <div className='-mx-5 md:mx-0'>
        <div class="text-center mb-j30 md:mb-[50px] px-2.5">
          <h2 class="text-blue text-xl md:text-26 jlg:text-3xl jxl:text-4xl font-semibold custom-h2 relative pb-6 mb-0">{title}</h2>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={collections}>
            {(response) =>
              response ? (
                <>
                  {isMobile ? (
                    <div className='px-5 relative'>
                      <Swiper
                        modules={[Navigation, Pagination, Scrollbar, Autoplay, A11y]}
                        spaceBetween={10}
                        slidesPerView={3}
                        slidesPerGroup={3} 
                        pagination={{ clickable: true }}
                        scrollbar={{ draggable: true }}
                        navigation={{ nextEl: ".c_arrow-right", prevEl: ".c_arrow-left" }}
                        autoplay={{
                          delay: 3000, // 3 seconds
                          disableOnInteraction: false, // keep autoplay after user swipes
                        }}                        
                        breakpoints={{
                          460: {
                            slidesPerView: 4, 
                            slidesPerGroup: 4,                          
                          },
                          650: {
                            slidesPerView: 5, 
                            slidesPerGroup: 5,                          
                          },
                        }}
                      >
                        {(collections || []).filter((c) => !!c.image).map((collection) => (
                          <SwiperSlide key={collection.id}>
                            <div className="flex flex-col">
                              <Link key={collection.id} to={`/collections/${collection.handle}`} >
                                <div className="featured-collection-image aspect-square flex-none flex items-center justify-center">
                                  {collection.image ? (
                                    <span className='w-3/4 aspect-square'>  
                                      <Image data={collection.image} sizes="100vw" />
                                    </span>
                                  ) : (
                                    <span className='w-3/4 aspect-square bg-grey-100 flex items-center justify-center'>
                                      <img src="/image/placeholder.jpg" alt={collection.title} className="w-full h-full object-cover" />
                                    </span>
                                  )}
                                </div>
                                <h3 className='text-sm jxl:text-base mb-0 text-blue text-center group-hover:text-brand font-normal'>{collection.title}</h3>
                              </Link>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <button className="c_arrow-left arrow swiper-button-prev left-1"></button>
                      <button className="c_arrow-right arrow swiper-button-next right-1 before:-mr-j5"></button>
                    </div>
                  ) : (
                    <div className="featured-collections ons-grid grid grid-cols-5 tb:grid-cols-6 gap-y-10 gap-x-5">
                        {(collections || []).filter((c) => !!c.image).map((collection) => (
                          <div className="flex flex-col" key={collection.id}>
                            <Link key={collection.id} className="" to={`/collections/${collection.handle}`} >
                              <div className="featured-collection-image aspect-square flex-none flex items-center justify-center">
                                {collection.image ? (
                                  <span className='w-3/4 aspect-square'>  
                                    <Image data={collection.image} sizes="100vw" />
                                  </span>
                                ) : (
                                  <span className='w-3/4 aspect-square bg-grey-100 flex items-center justify-center'>
                                    <img src="/image/placeholder.jpg" alt={collection.title} className="w-full h-full object-cover" />
                                  </span>
                                )}
                              </div>
                              <h3 className='text-sm jxl:text-base mb-0 text-blue text-center group-hover:text-brand font-normal'>{collection.title}</h3>
                            </Link>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              ) : null
            }
          </Await>
        </Suspense>        
      </div>
    </div>
  );
}


function AdvertisementBanner({ ads, type }) {
  return (
    <div className='container md:px-10 2xl:px-[60px] mt-j30 md:mt-[50px] jlg::mt-[65px]'>
      {ads
        ?.filter(ad => ad.position_?.trim().toLowerCase() === "middle hero banner ad")
        .map((ad, index) => (
        <div className='-mx-5 md:mx-0'>
          <div class="text-center mb-j30 md:mb-[51px] px-2.5 md:hidden">
            <h2 class="text-blue text-xl md:text-26 jlg:text-3xl jxl:text-4xl font-semibold custom-h2 relative pb-6 mb-0">
              <span>Finely Crafted Supplies For Artists</span>
            </h2>
          </div>
          <div className="advertisement-banner" key={index}>              
            <a data-discover="true" href={ad.ads_link || "#"}>
              {/* desktop image */}
              <img src={ad.ads_image || "/image/placeholder.jpg"} alt={`Ad ${index + 1}`} className="advertisement hidden md:block w-full" />
              {/* mobile image */}
              <img src={ad.mobile_image || ad.ads_image || "/image/placeholder.jpg"} alt={`Ad ${index + 1}`} className="advertisement md:hidden w-full" />
            </a>
          </div>
        </div>
        ))}
    </div>
  );
}

function CategoryLinkContent({ bannerWithContentImage, type }) {

  return (
    <>
      <div className='container  md:px-10 2xl:px-[60px]'>
        {bannerWithContentImage.map((banner, index) => (
          <div key={index} className="category-link-content -mx-5 md:mx-0 mt-j30 md:mt-[50px] jlg:mt-[65px]">
            <div className={`flex flex-col items-center bg-gray-100 ${index % 2 !== 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="w-full md:w-1/2">
                <img src={banner.image} alt={banner.title} />
              </div>
              <div className="w-full md:w-1/2 p-5 text-center m-auto">  
                <div className='w-full md:w-4/5 md:mx-auto'>
                  <div>             
                    <span className='text-[2.1vw] !leading-normal text-blue font-bold mb-0'>{banner.title}</span>
                  </div>
                  <div>
                    <span className='text-[1.3vw] !leading-normal text-blue font-medium'>{banner.subtitle}</span>
                  </div>
                  <p className='text-[1.1vw]/normal !leading-normal text-brand mb-2.5'>{banner.content}</p>
                  <p className="badge text-blue !leading-normal font-bold mb-2.5"><span className='text-[1vw]/normal'>{banner.badge}</span></p>
                  <a href={banner.button_link} className='!px-j30 text-sm font-medium md:!py-0 md:!leading-[48px] text-brand uppercase md:normal-case md:btn-secondary md:mt-5 inline-block'>{banner.button}</a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function SaleProducts({ ads, type }) {
  if (!ads || ads.length === 0) return null;
  const norm = (s) => (s || '').trim().toLowerCase();
  const nowTs = Date.now();
  const parseTs = (v) => {
    if (!v || typeof v !== 'string') return null;
    const ts = Date.parse(v);
    return Number.isFinite(ts) ? ts : null;
  };
  const withinWindow = (ad) => {
    const fromTs = parseTs(ad.from);
    const toTs = parseTs(ad.to);
    if (fromTs && nowTs < fromTs) return false;
    if (toTs && nowTs > toTs) return false;
    return true;
  };

  // Split by positions
  const topThree = ads.filter((ad) => norm(ad.position_) === 'top three ads block').filter(withinWindow);
  const twoBlock = ads.filter((ad) => norm(ad.position_) === 'two ads block').filter(withinWindow);

  // Top Three: latest 3 by ads_order (desc)
  const latestTopThree = topThree
    .slice()
    .sort((a, b) => (parseInt(b.ads_order) || 0) - (parseInt(a.ads_order) || 0))
    .slice(0, 3);

  // Two Ads Block: sort by ads_order asc (or keep as-is if not provided)
  const sortedTwoBlock = twoBlock.slice().sort((a, b) => (parseInt(a.ads_order) || 0) - (parseInt(b.ads_order) || 0));
  // Chunk into rows of 2
  const twoRows = [];
  for (let i = 0; i < sortedTwoBlock.length; i += 2) {
    twoRows.push(sortedTwoBlock.slice(i, i + 2));
  }

  return (
    <div className='container mt-j30 md:px-10 2xl:px-[60px] -order-1 md:order-none'>
      {/* Top Three Ads Block - single row, 3 columns */}
      {latestTopThree.length > 0 && (
        <div className='flex flex-col md:flex-row -mx-5 px-2.5 mb-10 md:mb-0 md:px-0 md:mx-0 gap-y-5 md:gap-x-5 lg:gap-x-10'>
          {latestTopThree.map((ad, idx) => (
            <div key={idx} className='w-full md:mb-[34px] md:w-4/12'>
              <a href={ad.ads_link || "#"}>
                {/* desktop image */}
                <img src={ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${idx + 1}`} className="hidden md:block" />
                {/* mobile image */}
                <img src={ad.mobile_image || ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${idx + 1}`} className="md:hidden" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Two Ads Block - multiple rows, 2 columns */}
      {twoRows.map((row, rIndex) => (
        <div key={rIndex} className='flex flex-col md:flex-row -mx-5 px-2.5 mb-10 md:mb-0 md:px-0 md:mx-0  gap-y-2.5 md:gap-x-5 lg:gap-x-10'>
          {row.map((ad, idx) => (
            <div key={idx} className='w-full md:mb-[34px] md:w-6/12'>
              <a href={ad.ads_link || "#"}>
                {/* desktop image */}
                <img src={ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${idx + 1}`} className="hidden md:block" />
                {/* mobile image */}
                <img src={ad.mobile_image || ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${idx + 1}`} className="md:hidden" />
              </a>
            </div>
          ))}
          {row.length === 1 && <div className='md:w-6/12'></div>}
        </div>
      ))}
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

function ArtAndSupplies({ feature }) {
  if (!feature) return null;
  const bgStyle = feature.background_color ? { backgroundColor: feature.background_color } : {};
  return (
    <section className='mt-j30 md:mt-[50px] jlg::mt-[65px] -order-1 md:order-none' style={bgStyle}>
      <div className='container max-w-[1240px] md:px-10 2xl:px-[60px]'>
        <div className="specialist-in-providing center text-center -mx-5  py-5 px-2.5 md:mx-0 md:py-10 md:px-0">
          <div data-content-type="html" data-appearance="default" data-element="main" data-decoded="true">
            {feature.feature_title && (
              <h1 className='text-blue text-[clamp(11px,2.5vw,36px)] font-semibold mb-j5 block' dangerouslySetInnerHTML={{ __html: feature.feature_title }} />
            )}
            {feature.feature_content && (() => {
              // feature_content may be rich text JSON from Shopify
              try {
                const json = JSON.parse(feature.feature_content);
                if (json && typeof json === 'object') {
                  return (
                    <div className='text-blue text-[1.5vw] max-[479px]:text-[2.5vw] tb:text-[1.3em] block mb-j5 leading-normal'>
                      <RichTextRenderer content={json} />
                    </div>
                  );
                }
              } catch (_) {
                // not JSON; fall through to HTML string
              }
              return (
                <span className='text-blue text-[1.5vw] max-[479px]:text-[2.5vw] tb:text-[1.3em] block mb-j5 leading-normal' dangerouslySetInnerHTML={{ __html: feature.feature_content }} />
              );
            })()}
            {feature.feature_button && (
              <a href={feature.feature_button_link || '#'} className='text-blue underline text-[1.5vw] max-[479px]:text-[2.5vw] tb:text-sm'><strong>{feature.feature_button}</strong></a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ShopSupplies({ supplyList = [], type, title }) {

  if (!supplyList || supplyList.length === 0) {
    return null; // Prevents rendering an empty section
  }

  return (
    <section className="bg-gray-100 mt-50 mb-50 py-8 hidden">
      <div className="container md:px-10 2xl:px-[60px]">
        <div className="specialist-in-providing center text-center">
            <h2 className="text-blue text-38 font-semibold pb-2">{title}</h2>
        </div>
      </div>

      <div className="mt-10">
        <div className="container md:px-10 2xl:px-[60px]">
          <div className="flex flex-wrap text-center -mx-3.5">
            {supplyList.map((supply, index) => (
              <div key={index} className="flex-1 w-1/2 md:w-1/4 flex flex-col items-center p-3.5">
                <img
                  src={supply.icon?.url || supply.icon || "/image/placeholder.jpg"}
                  width="100"
                  height="90"
                  alt={supply.title || "Supply Image"}
                />
                <h3 className="text-sm md:text-xl text-base-100 font-semibold py-2.5">
                  {supply.title}
                </h3>
                <p className="text-xs md:text-sm">{supply.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function FinestSupplies() {
  return (
    <div className='container pt-20 md:px-10 2xl:px-[60px] hidden '>

    </div>
  );
}


function ImageLinkList({ ads, type }) {

  return (
    <div className='container md:px-10 2xl:px-[60px] mt-j30 md:mt-[50px] jlg::mt-[65px]'>
      <div className="image-link-lists -mx-2.5 md:mx-0">
        <ul className="image-catList flex flex-col md:flex-row md:flex-wrap gap-y-2.5 md:gap-y-5 tb:gap-y-10 justify-center md:-mx-2.5 tb:-mx-5">          
          {ads ?.filter(ad => ad.position_?.trim().toLowerCase() === "bottom three ads block")
          .map((ad, index) => (
            <li key={index} className='md:w-1/3  md:px-2.5 tb:px-5'>
              <a href={ad.ads_link || "#"}>
                {/* desktop image */}
                <img src={ad.ads_image || "/image/placeholder.jpg"} alt={`Ad ${index + 1}`} className="cat-list w-full hidden md:block" />
                {/* mobile image */}
                <img src={ad.mobile_image || ad.ads_image || "/image/placeholder.jpg"} alt={`Ad ${index + 1}`} className="cat-list w-full md:hidden" />
              </a>
            </li>
          ))}
        </ul>
      </div>
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

const CHILD_PRODUCTS_PRICE_QUERY = `#graphql
  query ChildProductsPrice($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
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
      }
    }
  }
`;

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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
