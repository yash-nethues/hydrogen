import { defer } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import React, { useEffect } from 'react';
import ProductsTabs from '~/components/ProductsTabs';
import HomeBlog from '~/components/home/HomeBlog';
import BetterMaterials from '~/components/home/BetterMaterials';
import CustomShop from "~/components/home/CustomShop";
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

  const FinestcollectionId = '484561191209'; // Change this to any dynamic value
  const betterMaterialcollectionId = '484561223977'; // Change this to any dynamic value
  const newArrivalID = '483298181417';
  const professionalID = '484561191209';
  const artistID = '484561223977';



  const finestcollectionData = await fetchCollectionById(args, FinestcollectionId);
  const bettercollectionData = await fetchCollectionById(args, betterMaterialcollectionId);

  const arrivalcollectionData = await fetchCollectionById(args, newArrivalID);
  const professionalcollectionData = await fetchCollectionById(args, professionalID);
  const artistcollectionData = await fetchCollectionById(args, artistID);

  const bannerWithContentImageData = await bannerWithContentImage(args);
  return defer({ ...deferredData, ...criticalData, ...bannerData, adsData, supplyData, bannerWithContentImageData , finestcollectionData, bettercollectionData , arrivalcollectionData, professionalcollectionData, artistcollectionData});
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
function loadDeferredData({ context }) {

  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
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

    // Parse the banner_images field from the response
    const bannerImagesStr = GetMetaobject?.metaobjects?.edges?.[0]?.node?.fields?.find(field => field.key === "banner_images")?.value;

    if (!bannerImagesStr) {
      console.error("No banner images found.");
      return { bannerImages: [] };
    }

    // Parse the JSON string to get an array of image IDs
    const bannerImageIds = bannerImagesStr ? JSON.parse(bannerImagesStr) : [];

    // Fetch the actual image data using the MediaImage IDs
    const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, {
      variables: { ids: bannerImageIds }
    });

    // Extract the image URLs from the response
    const bannerImages = mediaResponse?.nodes?.map(node => node?.image?.url) || [];

    return { bannerImages };
  } catch (error) {
    console.error('Error fetching banner data:', error);
    return { bannerImages: [] };  // Return an empty array in case of error
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

    // Extract MediaImage IDs from adsData
    const mediaImageIds = adsData
      .filter(ad => ad.ads_image?.startsWith('gid://shopify/MediaImage/'))
      .map(ad => ad.ads_image);

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
      });
    }

    console.log('Processed Ads Data (After Fetching Images):', adsData);

    return adsData;
  } catch (error) {
    console.error('Error fetching ads data:', error);
    return [];
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
  console.log('collectionData',data.collectionData);
  return (
    <div className="home">
      <HomeBannerCaraousel banner={data.bannerImages} type="home_banner" />
      {/*<TopAdsLink />*/}
      <RecommendedProducts products={data.recommendedProducts} title="Jerry's Choice Artist Deals!" />
      <SaleProducts ads={data.adsData} type="home_ads_with_link" />
      <BetterMaterials  title="Only At Jerry's: The Finest Supplies" collectionData={data.finestcollectionData} />
      <FinestSupplies />
      <ArtAndSupplies />
      <BetterMaterials title="Better Materials @ Amazing Prices" collectionData={data.bettercollectionData} />
      <ProductsTabs arrivals={data.arrivalcollectionData} professional={data.professionalcollectionData} artist={data.artistcollectionData} />
      <CategoryLinkContent bannerWithContentImage={data.bannerWithContentImageData} type="banner_with_content_image" />
      <ImageLinkList ads={data.adsData} type="home_ads_with_link" />
      <AdvertisementBanner ads={data.adsData} type="home_ads_with_link" />
      <CustomShop />
      <FeaturedCollections collections={data.featuredCollections} title="Shop By Categories" />
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

    updateCarousel();
  }, []);

  return (
    <div className="pt-5">
      <div className="container 2xl:container">
        <div className='pl-3  pr-3'>
        <div id="carousel" className="relative pb-8">
          <div className="relative overflow-hidden">
            <div className="carousel-slides flex transition-transform duration-500">



              {banner && banner.length > 0 ? (
                banner.map((image, index) => (
                  <>
                  <div className='relative w-full flex-shrink-0'>

                  {index === 0 ? (
                    <>
                <a key={index} href="#" className=''> <img key={index} src={image} alt={`Slide ${index + 1}`} className="w-full" /></a>
                <div className='absolute z-10 top-2/4 left-2/4 bg-white w-j600 -translate-x-2/4  h-56 -translate-y-2/4'>
                <div className="p-5 text-center">
                    <h2 className='text-34 leading-tight font-medium  text-blue mb-4'>Elegant Plein Aire Frames<br />with Timeless Style</h2>
                    <p className='mb-5 text-base !text-blue'>Our Most Popular Ready-Made Frame Style</p>
                    <a className="btn-secondary py-2 rounded-sm shadow-lg" href="#" >Shop Now</a>
                   </div>
                </div>
            </>
            ) : (
             <>
              <a key={index} href="#" className=''> <img key={index} src={image} alt={`Slide ${index + 1}`} className="w-full" /></a>
              <a href="#" className='btn-secondary absolute bottom-7 left-12 rounded-sm shadow-lg'>
                Shop Now
              </a>
              </>
            )}
                      </div>
                 </>
                ))
              ) : (
                <div>No Banner Images Available</div>
              )}


            </div>
            <button id="prev" className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/50 hover:bg-white flex items-center justify-center text-4xl transition-all text-blue w-10 h-10 rounded-full">
              &#8249;
            </button>
            <button id="next" className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/50 hover:bg-white flex items-center justify-center text-4xl  transition-all text-blue w-10 h-10 rounded-full">
              &#8250;
            </button>
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banner.map((image, index) => (
                <button key={index} className="indicator w-2 h-2 bg-gray-400 rounded-full" data-slide={index}></button>
              ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}


function TopAdsLink({ adsData }) {
  return (
    <div className="2xl:container pt-5">
      <div className="flex">
      {adsData
  ?.filter(ad => ad.position_?.trim().toLowerCase() === "top")
  .map((ad, index) => (
    <li key={index} data-position={ad.position_}>
      <a href={ad.ads_link || "#"}>
        <img
          src={ad.ads_image || "/image/placeholder.jpg"}
          alt={`Ad ${index + 1}`}
          className="cat-list inline-block"
        />
      </a>
    </li>
  ))}

      </div>
    </div>
  );
}



/**
 * @param {{
*   products: Promise<RecommendedProductsQuery | null>;
* }}
*/
function RecommendedProducts({ products, title }) {
  return (
    <div className="2xl:container pt-6 ">
      <div className="recommended-products  bg-themegray p-10 pl-10 pr-10 ">
        <div className='text-center'>
          <h2 className="flex justify-center text-center font-semibold text-blue text-34 pb-8 center">{title}</h2>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={products}>
            {(response) => (
              <div className="flex w-full border-dashed  border-gray border border-r-0 rounded">
                {response
                  ? response.products.nodes.map((product) => (
                    <div className='recommended_box relative bg-white p-5 pb  -10 border-dashed  border-gray border-r w-3/12'  key={product.id}>
                       <span className='absolute top-3 left-3 bg-themeteal text-white font-bold pt-1 pb-1 pl-2 pr-2 text-base text-sm
'> TOP CHOICE </span>
                      <Link
                        key={product.id}
                        className="recommended-product"
                        to={`/products/${product.handle}`}
                      >
                        <figure className="mb-0 pb-0">
                        <Image
                          data={product.images.nodes[0]}
                          aspectRatio="1/1"
                          sizes="(min-width: 45em) 20vw, 50vw"
                        />
                        </figure>
                        <div className='text-center pt-5'>
                          <h4 className='font-semibold text-sm '>{product.title}</h4>
                          <small className='text-17 font-bold text-brand flex justify-center gap-2'>
                            Only: <Money data={product.priceRange.minVariantPrice} />
                          </small>
                        </div>
                      </Link>
                    </div>
                  ))
                  : null}
              </div>
            )}
          </Await>
        </Suspense>
      
      </div>
    </div>
  );
}


function FeaturedCollections({ collections, title }) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className='container 2xl:container pt-20'>
      <div className='text-center pb-20'>
        <h2 className='text-blue text-4xl font-semibold custom-h2 relative pb-8'>{title}</h2>
      </div>
      <div className="featured-collections ons-grid flex flex-wrap">
        {collections.map((collection) => (
          <div className=" pl-2 pr-2 w-1/6 mb-9" key={collection.id}>
            <Link key={collection.id} className="featured-collection group " to={`/collections/${collection.handle}`} >
              {collection.image && (
                <div className="featured-collection-image">
                  <Image data={collection.image} sizes="100vw" />
                </div>
              )}
              <h3 className='pt-2 mt-6 text-base text-blue text-center group-hover:text-brand font-semibold'>{collection.title}</h3>
            </Link>
          </div>
        ))}

      </div>
    </div>
  );
}


function AdvertisementBanner({ ads, type }) {
  return (
    <div className='container 2xl:container pt-20 '>
      {ads
        ?.filter(ad => ad.position_?.trim().toLowerCase() === "bottom")
        .map((ad, index) => (
            <div className="advertisement-banner" key={index}>
            <a data-discover="true" href={ad.ads_link || "#"}>
              <img
                src={ad.ads_image || "/image/placeholder.jpg"}
                alt={`Ad ${index + 1}`}
                className="advertisement w-full"
              />
            </a>
        </div>
        ))}
    </div>
  );
}

function CategoryLinkContent({ bannerWithContentImage, type }) {

  return (
    <>
      <div className='container 2xl:container pt-20'>
        {bannerWithContentImage.map((banner, index) => (
          <div key={index} className="category-link-content pt-10">
            <div className={`flex items-center bg-gray-100 ${index % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
              <div className="w-1/2 text-center m-auto">
                
                <h2 className='text-4xl text-blue font-bold leading-relaxed w-5/6 m-auto'>{banner.title}</h2>
                <p className='text-2xl text-blue font-bold pb-2'>{banner.subtitle}</p>
                <span className='text-2xl text-brand font-normal pb-4 inline-block'>{banner.content}</span>
                <h4 className="badge text-blue text-xl font-bold pb-9">{banner.badge}</h4>
                <a href={banner.button_link} className='btn-secondary'>{banner.button}</a>
              </div>
              <div className="w-1/2">
                <img src={banner.image} alt={banner.title} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function SaleProducts({ ads, type }) {
  // Handle cases where ads is undefined or empty
  if (!ads || ads.length === 0) {
    return (
      <div className='container 2xl:container pt-20 dd'>
        <p>No ads available.</p>
      </div>
    );
  }

  return (
    <div className='container 2xl:container'>
        {ads
  .filter(ad => ad.position_?.trim().toLowerCase() === "top") // Filter only "Top" ads
  .reduce((rows, ad, index) => {
    if (index % 3 === 0) {
      rows.push([]); // Start a new row every 3 items
    }
    rows[rows.length - 1].push({ ...ad, globalIndex: index }); // Track the global index
    return rows;
  }, [])
  .map((row, rowIndex) => (
    <div key={rowIndex}  className={`${row.length  > 2 ? "flex gap-5 pt-16" : "flex  gap-5 pt-8 pb-8"}`}>
      {row.map((ad, index) => (
        <div key={index} className={`${ad.globalIndex > 2 ? "w-6/12" : "w-4/12"}`}>
          <a href={ad.ads_link || "#"}>
            <img src={ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${ad.globalIndex + 1}`} />
          </a>
        </div>
      ))}
    </div>
  ))}
   
    </div>
  );
}


function OfferProducts() {
  return (
    <div className='container 2xl:container pt-6'>
      <div className="flex" align="center">
        <div className="w-6/12"><a href="#"><img src="/image/special-buys-Jan25.jpg" width="98%" height="auto" alt="Special Buys For Artists" /></a></div>
        <div className="w-6/12"><a href="#"><img src="/image/free-offers-home-Jan2025.jpg" width="98%" height="auto" alt="FREE Offers &amp; Special Sale Prices at Jerry's" /></a></div>
      </div>
    </div>
  );
}

function ArtAndSupplies() {
  return (
    <section className='bg-grey-100 mt-20 py-10'>
      <div className='container 2xl:container'>
        <div className="specialist-in-providing center text-center">
          <div data-content-type="html" data-appearance="default" data-element="main" data-decoded="true">
            <h1 className='text-blue text-48  font-semibold pb-2 block'>Professional Art Supplies &amp; Framing Specialists</h1>
            <span className='text-blue block pb-negative-5'>Better Art Materials, Reliability, Great Prices, Exceptional Service! Trusted For Over 50 Years. The Quality Of Your Art Matters To Us!</span>
            <Link to="#" className='text-blue underline '><strong>About Us &gt;</strong></Link></div></div>
      </div>
    </section>
  );
}

function ShopSupplies({ supplyList = [], type, title }) {

  if (!supplyList || supplyList.length === 0) {
    return null; // Prevents rendering an empty section
  }

  return (
    <section className="bg-gray-100 mt-50 mb-50 py-8">
      <div className="container 2xl:container">
        <div className="specialist-in-providing center text-center">
            <h2 className="text-blue text-38 font-semibold pb-2">{title}</h2>
        </div>
      </div>

      <div className="mt-10">
        <div className="container 2xl:container">
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
    <div className='container 2xl:container pt-20 hidden'>

    </div>
  );
}


function ImageLinkList({ ads, type }) {

  return (
    <div className='container 2xl:container pt-20'>
      <div className="image-link-lists">
        <ul className="image-catList flex gap-10 justify-center">
          
        {ads ?.filter(ad => ad.position_?.trim().toLowerCase() === "middle")
         .map((ad, index) => (
          <li key={index}>
          <a href={ad.ads_link || "#"}>
          <img
          src={ad.ads_image || "/image/placeholder.jpg"}
          alt={`Ad ${index + 1}`}
          className="cat-list inline-block"
        />
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
    products(first: 5, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

const GET_METAOBJECT_QUERY = `#graphql
  query GetMetaobject($type: String!) {
    metaobjects(type: $type, first: 10) {
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
  query GetCollectionById($id: ID!) {
    collection(id: $id) {
      id
      title
      description
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
