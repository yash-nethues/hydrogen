import { useEffect, useState } from 'react';
import {useIsClient} from '~/hooks/useIsClient';
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
import {useWishlist} from '~/components/WishlistProvider';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { useSmoothScroll } from '~/components/useSmoothScroll';
import QuantityInput from '~/components/QuantityInput';
import UnitSwitcher from '~/components/UnitSwitcher';
import Modal from '~/components/Modal';
import {RichTextRenderer} from '~/components/RichTextRenderer';
import CouponBanners from "../components/CouponBanners";
import ProductSlider from "~/components/ProductSlider";
import BoughtTogetherSilder from "~/components/BoughtTogetherSilder";
import RelatedSet from "~/components/RelatedSet";
import RelatedToSee from '~/components/RelatedToSee';
import ArtistsViewedPDSlider from '~/components/ArtistsViewedPDSlider';
import {ProductTabs} from '~/components/ProductTabs';

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

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions: getSelectedProductOptions(request),
    },
  });

  const metafieldsList = (product?.metafields || []).filter(Boolean);
  const parseIdArray = (raw) => {
    const isGid = (v) => typeof v === 'string' && /^gid:\/\/shopify\//.test(v.trim());
    if (!raw) return [];

    // If array already
    if (Array.isArray(raw)) {
      return raw
        .map((v) => (typeof v === 'object' && v && v.id ? v.id : v))
        .filter((v) => isGid(v));
    }

    if (typeof raw === 'string') {
      // Normalize common encodings/variants
      let trimmed = raw.trim()
        .replace(/&quot;/g, '"')
        .replace(/&#34;/g, '"');
      // If wrapped in quotes, unwrap
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        trimmed = trimmed.slice(1, -1);
      }

      // Try JSON.parse first
      try {
        // Try JSON as-is
        let parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((v) => (typeof v === 'object' && v && v.id ? v.id : v))
            .filter((v) => isGid(v));
        }
        if (parsed && parsed.id && isGid(parsed.id)) return [parsed.id];
      } catch {}
      // Try single-quote array: ['gid://...','gid://...']
      try {
        const sq = trimmed.replace(/'/g, '"');
        const parsedSq = JSON.parse(sq);
        if (Array.isArray(parsedSq)) {
          return parsedSq
            .map((v) => (typeof v === 'object' && v && v.id ? v.id : v))
            .filter((v) => isGid(v));
        }
        if (parsedSq && parsedSq.id && isGid(parsedSq.id)) return [parsedSq.id];
      } catch {}

      // Single gid string
      if (isGid(trimmed)) return [trimmed];

      // Handle bracketed but unquoted list: [gid://..., gid://...]
      const bracketMatch = trimmed.replace(/^\[|\]$/g, '');
      const splitCandidates = bracketMatch.split(/\s*,\s*|\s+/).filter(Boolean);
      const fromSplit = splitCandidates.filter((v) => isGid(v));
      if (fromSplit.length) return fromSplit;

      // Fallback: regex extraction of any gid substrings
      const regexMatches = trimmed.match(/gid:\/\/shopify\/[A-Za-z]+\/[0-9]+/g);
      if (regexMatches && regexMatches.length) return regexMatches;

      return [];
    }

    // If object with id
    if (typeof raw === 'object' && raw.id && isGid(raw.id)) return [raw.id];
    return [];
  };
  const rawViscosity = metafieldsList.find((m) => m?.key === 'select_viscosity')?.value;
  const viscosityIds = parseIdArray(rawViscosity);

  const {nodes: viscosityObjects} = await storefront.query(PRODUCT_VIDEOS_QUERY, {
    variables: {
      ids: viscosityIds,
    },
  });


  const rawMeta = metafieldsList.find((m) => m?.key === 'select_product_videos')?.value;
  const metaobjectIds = parseIdArray(rawMeta);

  const {nodes: videoObjects} = await storefront.query(PRODUCT_VIDEOS_QUERY, {
    variables: {
      ids: metaobjectIds,
    },
  });

  const rawMeta1 = metafieldsList.find((m) => m?.key === 'product_charts_pdf')?.value;
  const pdfobjectIds = parseIdArray(rawMeta1);

  const rawPaintsAttr = metafieldsList.find((m) => m?.key === 'paints_mediums_multiselect_attribute')?.value;
  const paintsAttrIds = parseIdArray(rawPaintsAttr);


  const {nodes: pdfObjects} = await storefront.query(PRODUCT_VIDEOS_QUERY, {
    variables: {
      ids: pdfobjectIds,
    },
  });

  const paintsNodesResp = paintsAttrIds.length
    ? await storefront.query(PRODUCT_VIDEOS_QUERY, { variables: { ids: paintsAttrIds } })
    : null;
  const paintsMetaobjects = paintsNodesResp?.nodes?.filter(Boolean) || [];



  const {nodes: metaobjects } = await storefront.query(COLLECTION_COUPONS_QUERY, {
    variables: {
      type: "collection_coupons",
      first: 3
    },
  });

  const newArrivalID = '483298181417';
  const professionalID = '484561191209';

  const arrivalcollectionData = await storefront.query(GET_COLLECTION_BY_ID_QUERY, {
    variables: { id: `gid://shopify/Collection/${newArrivalID}` },
  });

  const professionalcollectionData = await storefront.query(GET_COLLECTION_BY_ID_QUERY, {
    variables: { id: `gid://shopify/Collection/${professionalID}` },
  });


  if (!product?.id) {
    throw new Response(null, {status: 404});
  }


  return {
    product,
    videoObjects,
    viscosityObjects,
    pdfObjects,
    pdfobjectIds,
    rawMeta1,
    paintsMetaobjects,
    metaobjects,
    arrivalcollectionData,
    professionalcollectionData
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

export function WishlistButton({productId}) {
  console.log('productId', productId);
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const inWishlist = isInWishlist(productId);

  console.log('inWishlist', inWishlist);

  return (
    <button className='flex gap-2 items-center'
      onClick={() =>
        inWishlist ? removeFromWishlist(productId) : addToWishlist(productId)
      }
    >
        <svg width="26" height="26" aria-hidden="true">
          <use href={`#icon-${inWishlist ? 'wishlistAdded' : 'wishlistRemoved'}`} />
        </svg>
      Add to Favorites
    </button>
  );
}


export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, videoObjects, viscosityObjects, pdfobjectIds, pdfObjects, rawMeta1, paintsMetaobjects, collection, arrivalcollectionData, professionalcollectionData} = useLoaderData();
  
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

  const {title, descriptionHtml, images, options} = product;

  const [urlOptions, setUrlOptions] = useState({});
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      const params = new URLSearchParams(window.location.search);

      const selectedColor = params.get('Color');
      const selectedSize = params.get('Size');
      const selectedFormat = params.get('Format');

      setUrlOptions({
        color: selectedColor,
        size: selectedSize,
        format: selectedFormat
      });
    }
  }, [isClient]);

  const safeMetafields = (product.metafields || []).filter(Boolean);
  const shortDes = safeMetafields.find((m) => m?.key === 'short_description')?.value;
  const catalogItemNumber = safeMetafields.find((m) => m?.key === 'catalog_item_number')?.value;
  const colorDescription = safeMetafields.find((m) => m?.key === 'reference_color_description')?.value;
  const paintsMediumsAttribute = safeMetafields.find((m) => m?.key === 'paints_mediums_multiselect_attribute')?.value;
  const productType = safeMetafields.find((m) => m?.key === 'select_product_type')?.value;
  console.log('productType', productType);

  const mainPVC = options?.[0]?.optionValues?.[0]?.name;
  const mainPVS = options?.[1]?.optionValues?.[0]?.name;
  const mainPVF = options?.[2]?.optionValues?.[0]?.name;

  /*let match = isClient &&
    mainPVC === urlOptions.color &&
    mainPVS === urlOptions.size &&
    mainPVF === urlOptions.format;*/

  let match = isClient && productType === 'Grouped Product';

  const handleOpenVideoGallery = () => {
    const galleryItems = videoObjects.map((meta) => {
      const videoUrl = meta.fields.find(f => f.key === 'video_url')?.value;
      const product_name = meta.fields.find(f => f.key === 'product_name')?.value;

      const imageField = meta.fields.find(f => f.key === 'thumbnail_image');
      const thumb = imageField?.reference?.image?.url;

      return {
        src: videoUrl,
        type: "video",
        caption: product_name,
        thumb: thumb,
      };
    });

    Fancybox.show(galleryItems, {
      Thumbs: {
        autoStart: true,
      },
    });
  };

  useSmoothScroll();



  const handleFDBtnClick = (e) => {
    e.preventDefault();
    if (!isClient) {
      console.log('Not client, ignoring.');
      return;
    }
    // Scroll to the description tab and ensure it's open
    const tabElement = document.querySelector('#tab-description');
    if (tabElement) {
      // Click the tab to open it (this will toggle, so we need to check if it's closed first)
      const isCurrentlyOpen = tabElement.classList.contains('bg-blue');
      if (!isCurrentlyOpen) {
        tabElement.click();
      }
      // Scroll to the tab
      tabElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  console.log('collection Data New:-', arrivalcollectionData);

  const [quantity, setQuantity] = useState(1);
  const [filterModal, setFilterModal] = useState(false);
  const [unit, setUnit] = useState('oz');

  const color = selectedVariant.selectedOptions.find(
    (opt) => opt.name.toLowerCase() === 'color'
  )?.value;

  const size = selectedVariant.selectedOptions.find(
    (opt) => opt.name.toLowerCase() === 'size'
  )?.value;

  const format = selectedVariant.selectedOptions.find(
    (opt) => opt.name.toLowerCase() === 'format'
  )?.value;

  
  const paintsAttributes = (paintsMetaobjects || [])
    .filter((n) => n && (n.fields || n.__typename === 'Metaobject'))
    .map((node) => {
      const findField = (key) => node?.fields?.find((f) => f.key === key);
      const get = (key) => {
        const f = findField(key);
        if (!f) return '';
        if (f.reference && f.reference.__typename === 'Metaobject') {
          // Try to read meaningful value from referenced metaobject
          const baseKey = key.replace(/_(attribute|atrribute)$/i, '');
          const candidates = [baseKey, 'value', 'text', 'name', 'title'];
          for (const c of candidates) {
            const v = f.reference.fields?.find((rf) => rf.key === c)?.value;
            if (v) return v;
          }
        }
        return f.value || '';
      };
      return {
        color: get('color_name'),
        size: get('size'),
        format: get('format'),
        media: get('media_type'),
        type: get('type_atrribute'),
        series: get('series_name'),
        pigment: get('pigment'),
      };
    })
    .filter(Boolean);

  // Merge sparse attribute objects into a single, consolidated attributes object
  const mergedPaintsAttributes = paintsAttributes.reduce((acc, cur) => {
    if (!cur) return acc;
    for (const [k, v] of Object.entries(cur)) {
      if (v) {
        // For all fields, collect all values as arrays
        if (!acc[k]) acc[k] = [];
        if (!acc[k].includes(v)) acc[k].push(v);
      }
    }
    return acc;
  }, { color: [], size: [], format: [], media: [], type: [], series: [], pigment: [] });

  // Process viscosity data similar to paints attributes
  const viscosityAttributes = (viscosityObjects || [])
    .filter((n) => n && (n.fields || n.__typename === 'Metaobject'))
    .map((node) => {
      const findField = (key) => node?.fields?.find((f) => f.key === key);
      const get = (key) => {
        const f = findField(key);
        if (!f) return '';
        if (f.reference && f.reference.__typename === 'Metaobject') {
          // Try to read meaningful value from referenced metaobject
          const baseKey = key.replace(/_(attribute|atrribute)$/i, '');
          const candidates = [baseKey, 'value', 'text', 'name', 'title'];
          for (const c of candidates) {
            const v = f.reference.fields?.find((rf) => rf.key === c)?.value;
            if (v) return v;
          }
        }
        return f.value || '';
      };
      return {
        viscosity: get('viscosity_name'),
      };
    })
    .filter(Boolean);

  const mergedViscosity = viscosityAttributes.reduce((acc, cur) => {
    if (!cur) return acc;
    for (const [k, v] of Object.entries(cur)) {
      if (v) {
        if (!acc[k]) acc[k] = [];
        if (!acc[k].includes(v)) acc[k].push(v);
      }
    }
    return acc;
  }, { viscosity: [] });

  console.log('viscosityAttributes', viscosityAttributes);
  console.log('mergedViscosity', mergedViscosity); 
    
  const referenceSize = Array.isArray(mergedPaintsAttributes.size) 
    ? mergedPaintsAttributes.size[0] 
    : mergedPaintsAttributes.size;

  const getDisplayReferenceSize = () => {
    if (!referenceSize) return '';
    const base = referenceSize.trim();
    const ozMatch = base.match(/([\d,.]+)\s*oz/i);
    const mlMatch = base.match(/([\d,.]+)\s*ml/i);

    if (unit === 'oz') {
      if (ozMatch) {
        const amount = ozMatch[1].replace(',', '');
        return `${amount} OZ`;
      }
      if (mlMatch) {
        const amount = mlMatch[1].replace(',', '');
        return `${amount} ML`;
      }
      return base;
    }

    // unit === 'ml'
    if (ozMatch) {
      const ounces = parseFloat(ozMatch[1].replace(',', ''));
      if (Number.isNaN(ounces)) return base;
      const mlFixed = (ounces * 29.5735).toFixed(2);
      return `${mlFixed} ML`;
    }
    if (mlMatch) {
      const amount = mlMatch[1].replace(',', '');
      return `${amount} ML`;
    }
    return base;
  };

  return (
    <div className={`group/product ${match ? 'parrentProduct' : 'childProduct'}`}>
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
              <li className="!text-grey-500  text-sm underline hover:no-underline hover:!text-brand px-2 first:ps-0 last:pe-0 relative after:content-['/'] after:absolute after:-end-0.5 after:top-0.5 after:pointer-events-none after:!text-grey-500 last:after:hidden after:text-10"><a href="/">Home</a></li>
              <li className="!text-grey-500 text-sm underline hover:no-underline hover:!text-brand px-2 first:ps-0 last:pe-0 relative after:content-['/'] after:absolute after:-end-0.5 after:top-0.5 after:pointer-events-none after:!text-grey-500 last:after:hidden after:text-10"><a href="/">Collection</a></li>
              <li className="active text-sm !text-brand  px-2 first:ps-0 last:pe-0 relative after:content-['/'] after:absolute after:-end-0.5 after:top-0.5 after:pointer-events-none after:!text-grey-500 last:after:hidden after:text-10"> {title}</li>
            </ul>
          </div>
        </div>
      <div className='container 2xl:container'>
        <div className="product flex flex-col tb:flex-row tb:justify-start gap-0">
          { /* <ProductImage image={selectedVariant?.image} /> */ }
          <ProductImage images={images.nodes} productVideos={videoObjects} />
          <div className="product-main tb:py-j30 tb:pl-12 w-[45%] flex-initial">
            <h1 className='text-blue text-4xl font-semibold mb-j15'>{title}</h1>
            
            <div className=" float-right group-[.parrentProduct]/product:hidden">
              <div className=" bg-gray-100 py-1.5 px-3 text-blue text-sm">
                <span className='font-medium'>Save</span>
                <div className=" text-blue text-26 font-semibold flex mt-1  ">
                  63%&nbsp; <span className='text-17'>off </span>&nbsp;  <small className="text-sm relative font-normal">  List Price*  </small>
                </div>
              </div>
            </div>            
            <div className="flex gap-10 mt-1 items-center">
              <div className="uppercase text-10 text-center leading-none bg-blue text-white w-16 p-1 hidden">Only AT <br/> Jerry's</div>
              <div className="">Ratting section</div>
            </div>
            <div className="flex flex-wrap gap-4 w-full mt-4 group-[.childProduct]/product:hidden">
              <div className=" text-blue text-26 font-semibold mt-5 ">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              </div>
              <div className=" bg-gray-100 py-1.5 px-3 text-blue text-sm">
                <span className='font-medium'>Save</span>
                <div className=" text-blue text-26 font-semibold flex mt-1  ">
                  <ProductPrice price={selectedVariant?.price} compareAtPrice={selectedVariant?.compareAtPrice} />&nbsp; <span className='text-17'>off </span>&nbsp;  <small className="text-sm relative font-normal">  Reg. Price*  </small>
                </div>
              </div>
            </div>
            <div className='clear-both  group-[.parrentProduct]/product:hidden'>
              <div>
                <p className='text-[90%]'>Item # <span>{catalogItemNumber || product.sku}</span></p>
                <div className='flex w-full items-center flex-wrap'>
                  <div className='flex flex-col w-64'>
                    <div className="text-17 mb-0.5 font-medium">
                      <span>Color : </span>
                      <span>{colorDescription}</span>
                    </div>
                    <div className="text-17 mb-0.5 font-medium">
                      <span>Size : </span>
                      <span>{getDisplayReferenceSize()}</span>
                    </div>
                    <UnitSwitcher value={unit} onUnitChange={(selectedUnit) => setUnit(selectedUnit)} />
                    <div className="text-17 mb-0.5 font-medium">
                      <span>Format : </span>
                      <span>{mergedPaintsAttributes.format || format}</span>
                    </div>                  
                  </div>
                  <div>
                    <ul className="badgesFlags flex flex-wrap gap-1">
                      <li className="alert-item w-7 group/tooltip rounded-sm tech-notes tech-specs">
                        <svg width="18" height="18" aria-hidden="true">
                          <use href="#icon-tech-notes" />
                        </svg>
                        <span className="sr-only">Tech Notes:</span>
                        <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  group-[&.active]/gridItem:scale-75 group-hover/gridItem:scale-75 origin-bottom">Click This Icon To See Tech Notes</span>
                      </li>
                      <li className="alert-item w-7 group/tooltip rounded-sm lpp">
                        <svg width="18" height="18" aria-hidden="true">
                          <use href="#icon-lpp" />
                        </svg>
                        <span className="sr-only">LPP</span>
                        <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  group-[&.active]/gridItem:scale-75 group-hover/gridItem:scale-75 origin-bottom">Lowest Price - This item is already at the Best Lowest Price Possible and no further discounts or coupons can be applied.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>              
              <div className='mt-5'>
                <div className="mt-2.5 flex gap-x-4">
                  <div className="flex w-auto gap-x-6">
                    <div className='flex-grow text-grey group/price [&.reg]:text-blue-600 [&.sale]:text-brand'>
                      <strong className="flex items-center text-14/4 font-medium gap-x-2">
                        <span>List</span>
                        <span className="info relative cursor-pointer group/tooltip">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 383.47 384">
                            <path d="M203.82,0c4.31,1.16,9.24,1.01,13.74,1.61,81.03,10.74,147.75,74.59,162.68,154.95l3.23,23.38v23.99l-3.23,23.38c-14.89,80.17-81.74,144.36-162.68,154.95-4.5.59-9.43.46-13.74,1.61-7.92-.34-16.06.46-23.95,0C76.75,377.81-4.35,286.63.18,183.27,4.41,86.76,83.57,5.64,179.87,0h23.95ZM181.96,22.71C49.93,30.24-23.14,181.9,54.25,290.37c67.24,94.26,207.35,94.54,274.87.43,83.13-115.88-5.76-276.16-147.16-268.09Z" fill="currentColor" />
                            <path d="M231.25,106.72c20.25,19.91,22.31,52.73,4.74,75.07-11.36,14.44-30.01,17.01-32.73,38.44-.91,7.18,1.77,18.58-2.84,24.15-5.98,7.22-18.34,3.46-19.76-5.64-2.48-15.86,1.92-35.49,11.62-48.25,11.94-15.7,31.97-17.53,33.27-41.64,2.12-39.14-53.47-49.13-65.5-13.13-2.66,7.95.08,19.46-10.1,22.12-11.14,2.9-14.93-7.19-14.15-16.42,3.92-46.38,62.03-67.56,95.45-34.7Z" fill="currentColor" />
                            <path d="M189.39,270.82c14.85-3.05,18.94,19.26,4.91,22.15-14.85,3.05-18.94-19.26-4.91-22.15Z" fill="currentColor" />
                          </svg>
                          <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-14/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                            <strong>List Price:</strong>  (Also known as Manufacturer's Suggested Retail Price, we do not set or inflate the MSRP. We report it. For our Jerry's manufactured brand products, we establish MSRP based on those of third-party vendors whose products most closely resemble ours in quality and size.)
                          </span>
                        </span>
                      </strong>
                      <span className='text-xl group-[.reg]/price:line-through'>${selectedVariant?.compareAtPrice?.amount}</span>
                    </div>
                    <div className='flex-grow text-grey group/price [&.reg]:text-blue-600 [&.sale]:text-brand reg'>
                      <strong className="flex items-center text-14/4 font-medium gap-x-2">
                        <span>Reg. Price</span>                      
                      </strong>
                      <span className='text-xl group-[.reg]/price:line-through group-[.reg]/price:text-26'>${selectedVariant?.compareAtPrice?.amount}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 text-blue-700 group/price [&.sale]:text-brand sale">
                  <strong className="block font-medium text-14/4 group-[.sale]/price:uppercase">Sale</strong>
                  <strong className='text-4xl font-semibold '>${selectedVariant?.price?.amount}</strong>
                </div>
              </div>              
              <div className="text-22 mt-5 pt-5 flex gap-5">
                <QuantityInput 
                  quantity={quantity}
                  onChange={setQuantity}
                  sectionClasses="text-black max-w-[30%] text-xl border border-gray-200"
                  btnClasses="w-j30 h-11"
                  fieldClasses="border-0"
                />
                <div className='flex-auto'>
                  <ProductForm
                    productOptions={productOptions}
                    selectedVariant={selectedVariant}
                    quantity={quantity}
                  />
                </div>
              </div>
              <div className='flex mt-5 justify-between items-center gap-x-6 gap-y-2'>
                <div className='flex flex-wrap gap-5'>
                  {selectedVariant?.availableForSale ? (
                    <>
                      <span className='text-green flex-none text-15 flex gap-1.5 items-center font-medium'>
                        <svg width="16" height="16" aria-hidden="true">
                          <use href="#icon-check" />
                        </svg>
                        <span>In Stock</span>
                      </span>
                      <span className='text-brand text-15'>Hurry Only 9 left</span>
                    </>
                  ) : (
                    <span className='text-red flex-none text-15 flex gap-1.5 items-center font-medium'>
                      <svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span>Out of Stock</span>
                    </span>
                  )}
                </div>
                <div className="w-full group/addList relative max-w-44" role="button">
                  <span className="border border-grey-200 text-xl text-grey flex group-hover/addList:text-green group-hover/addList:border-green  hover:text-green hover:border-green group-[.active]/addList:text-green group-[.active]/addList:border-green transition-all  items-center justify-center ps-2.5 pe-10 py-2 w-full h-full relative">
                    <span>Add To Lists</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className='absolute end-2 top-1/2 -translate-y-1/2 w-6 aspect-square group-[.active]/addList:-scale-100' viewBox="0 0 384 384">
                      <path fill="currentColor" d="M92.62,128.43c5.61-.97,10.94.03,15.17,3.94l84.3,84.33,82.97-82.46c13.06-13.06,34.24.24,26.49,17.55-30.41,34.4-64.89,65.57-96.82,98.74-5.45,5.19-12.54,7.07-19.61,3.86-34.71-31.99-67.2-66.72-100.86-99.95-7.29-8.48-3.01-24.04,8.35-26Z"/>
                    </svg>
                  </span>
                  <div className="hidden z-10 group-[.active]/addList:flex group-hover/addList:flex absolute top-full end-0 min-w-max flex-col bg-grey-100 border border-grey-200">
                    <button type="button" title="Add To Favorites lists" className=" text-xs ps-10 pe-2.5 py-3 text-start bg-transparent border-t border-grey-200 first:border-t-0 hover:bg-white transition-all relative">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.9 43.13" className='absolute left-2 top-1/2 -translate-y-1/2 w-6 aspect-square'>
                        <path fill="currentColor" d="M0,14.38v-2.25C.84,4.06,8.28-1.47,16.28.37c3.11.72,5.72,2.59,7.63,5.11.17.04.68-.77.83-.94,9.27-10.05,25.17-2.14,22.94,11.27-.48,2.92-1.84,5.8-3.42,8.28,4.08,3.71,4.85,9.76,1.65,14.33-3.92,5.59-12.08,6.16-16.68,1.11l-5.11,3.59h-.27c-4.54-2.91-8.89-6.23-12.77-9.98C6.27,28.49.49,21.33,0,14.38ZM23.86,10.45c-1.07-2.62-2.44-4.87-4.87-6.41C13.75.71,6.71,2.55,3.73,7.95c-5.02,9.11,4.9,19.89,11.24,25.52.98.87,8.38,6.93,9.02,6.87l3.81-2.67c-1.33-2.56-1.81-5.3-1.12-8.14,1.65-6.87,9.54-10.17,15.71-6.84,3.06-4.75,4.7-10.8,1.14-15.78-4.57-6.4-14.23-5.95-18.19.85-.46.79-.8,1.83-1.27,2.57-.06.09.01.17-.21.12ZM36.1,23.79c-3.31.32-6.28,2.99-7.12,6.18-2.09,7.96,7.24,13.97,13.54,8.7s1.98-15.69-6.43-14.88Z"/>
                        <polygon fill="currentColor" points="38.27 27.32 38.27 30.98 42.01 30.98 42.01 33.32 38.41 33.32 38.27 33.46 38.27 37.07 35.93 37.07 35.93 33.32 32.28 33.32 32.28 30.98 35.93 30.98 35.93 27.32 38.27 27.32"/>
                      </svg>
                      <span>My Favorites/Saved Lists</span>
                    </button>
                    <button type="button" title="Add To Teacher's Cart" className=" text-xs ps-10 pe-2.5 py-3 text-start bg-transparent border-t border-grey-200 first:border-t-0 hover:bg-white transition-all relative">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.44 15.81" className='absolute left-2 top-1/2 -translate-y-1/2 w-6 aspect-square'>
                        <circle fill="currentColor" cx="3.03" cy="2.98" r="2.98"/>
                        <path fill="currentColor" d="M11.17,7.41c0,.22-.1.44-.28.59l-2.97,2.46c-.12.1-.26.15-.4.16-.21.07-.46.04-.65-.1l-1.38-.97v6.26H0v-6.78c0-1.51,1.23-2.75,2.74-2.75.75,0,1.44.31,1.94.81.03.03.05.05.07.08l2.57,1.8,2.59-2.15c.33-.27.81-.22,1.08.1.12.15.18.32.18.49Z"/>
                        <path fill="currentColor" d="M23.44,1.07v13.47c0,.42-.34.76-.76.76h-13.37c-.43,0-.77-.34-.77-.76,0-.01,0-.03.01-.04-.01-.01-.01-.03-.01-.04v-2.32c0-.42.34-.76.77-.76s.76.34.76.76v1.63h11.84V1.83h-11.84v3.68c0,.42-.34.76-.76.76s-.77-.34-.77-.76V1.07c0-.43.34-.77.77-.77h13.37c.42,0,.76.34.76.77Z"/>
                        <rect fill="currentColor" x="14.84" y="4.37" width="1.53" height="6.88" rx=".76" ry=".76" transform="translate(23.41 -7.79) rotate(90)"/>
                        <rect fill="currentColor" x="15.15" y=".27" width="1.53" height="9" rx=".76" ry=".76" transform="translate(20.69 -11.14) rotate(90)"/>
                        <rect fill="currentColor" x="15.54" y="5.8" width="1.53" height="9.63" rx=".76" ry=".76" transform="translate(26.92 -5.69) rotate(90)"/>
                      </svg>
                      <span>My Teacher/Supply Lists</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className='mt-4 flex justify-between items-center gap-x-6 gap-y-2 border-b border-grey-200 pb-4'>
                <a href="#"  className='btn-outer rounded h-8 uppercase text-14 font-bold inline-flex flex-none pl-2 pr-2 scroll-to-element-jq' data-scroll-to="#tab-description" data-delay="200" data-click="0">
                  See Full Description &gt; 
                </a>
                <ul className='flex gap-5 justify-between [&>li>a]:flex [&>li>a]:gap-2 [&>li>a]:items-center [&>li]:text-blue [&>li>a]:text-blue [&>li]:text-15 scale-[.8] origin-right [&>li]:font-medium'>
                  <li>
                    <button className='flex gap-2 items-center'>
                        <svg width="20" height="20" aria-hidden="true">
                          <use href="#icon-wishlistRemoved" />
                        </svg>
                        <span>Save</span>
                    </button>
                  </li>
                  <li>
                    <a href="#">
                      <svg width="20" height="20" aria-hidden="true">
                        <use href="#icon-envelope" />
                      </svg>
                      <span>Email</span>
                    </a></li>
                </ul>
              </div>
              <div className='mt-5 flex flex-wrap items-center text-15 text-blue '>
                <p className='after:ml-1 after:top-px after:relative after:content-["->"]'>Select Colors & Sizes To See More</p>
                <div className='mx-2 flex flex-wrap gap-1'>
                  {/* <a href="" className='border border-brand rounded-sm py-0.5 text-[90%] text-medium text-brand px-1'>Round</a> */}
                  <button onClick={() => setFilterModal(true)} href="" className='group/tooltip w-5 relative aspect-square' style={{ 'background':'#000000' }}>
                    <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  origin-bottom">Black</span>
                  </button>
                  <button onClick={() => setFilterModal(true)} href="" className='group/tooltip w-5 relative aspect-square' style={{ 'background':'#0000ff' }}>
                    <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  origin-bottom">Blue</span>
                  </button>
                  <button onClick={() => setFilterModal(true)} href="" className='group/tooltip w-5 relative aspect-square' style={{ 'background':'linear-gradient(0.5turn, #ecd1ff,#d5d3d6)' }}>
                    <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  origin-bottom">Iridescent</span>
                  </button>
                </div>
                <p>Or Click Shop All Below</p>
              </div>
              <div className='mt-5 p-2.5 text-center bg-grey-100 border items-center border-grey-200 shadow-md flex flex-col'>
                <span className='m-2.5 font-medium'>See All Sizes & Shapes Available</span>
                <div className='relative mb-2.5 text-green'>
                  <svg width="25" height="25" aria-hidden="true" className='inline-block mr-2 -translate-y-1 -scale-100'>
                    <use href="#icon-roundArrow" />
                  </svg>
                  <a href={`/products/${product.handle}`} className='text-22 font-semibold underline'>{title}</a>
                </div>
              </div>
            </div>
            <div className='group-[.childProduct]/product:hidden'>
              <div className='shortDescription'>
                <span className='text-xl font-semibold pt-4 pb-4 block text-base-100 hidden'>Description</span>
                <div className='text-15 max-h-[450px] overflow-hidden text-base-100 font-medium [&>h2]:text-18 [&>h2]:2xl:text-xl [&>h2]:mb-4 [&>h2]:pt-4 [&>h2]:font-semibold [&>*]:mb-2.5 [&>div]:flex  [&>div]:gap-5 [&>div>div]:!max-w-[50%] [& ul li]:pl-2.5' dangerouslySetInnerHTML={{__html: descriptionHtml}} />
              </div>
              <div className="flex gap-3 items-center mt-4">
                <a href="#"  className='bg-blue fullDescription text-white px-4 py-2 hover:bg-brand' onClick={handleFDBtnClick}>
                    See Full Description &gt; 
                </a>
                <a href="#" className='btn-outer rounded h-8 flex flex-none pl-2 pr-2 scroll-to-element-jq' data-scroll-to="#shop-all" data-delay="200" data-click="0">
                    Shop All Supplies Below &gt; 
                </a>
              </div>
              <div className="mt-8 pt-5  border-t border-grey-200  related_slider">
                  <RelatedToSee arrivalsCollection={arrivalcollectionData.collection}/>
              </div>   
              <div className="mt-j30">
                <ul className='flex gap-10 justify-between [&>li>a]:flex [&>li>a]:gap-2 [&>li>a]:items-center [&>li]:text-blue [&>li>a]:text-blue [&>li]:text-sm [&>li]:font-semibold'>
                  
                  <li><a href="#">
                    <svg width="26" height="26" aria-hidden="true">
                      <use href="#icon-envelope" />
                    </svg>
                    <span>Email</span>
                    </a></li>
                  <li><WishlistButton productId={product.id} /></li>
                  <li><a href="#">
                    <svg width="26" height="26" aria-hidden="true">
                      <use href="#icon-needHelp" />
                    </svg>
                    <span>Need Help ? Chat With An Expert</span>
                    </a></li>
                </ul>
              </div> 
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

      <div className="bg-gray-100 border-t border-t-grey-200 pt-5 pb-8 mt-20">
        <div className="container 2xl:container">
          {/* Product Tabs */}
          <ProductTabs images={images.nodes} productVideos={videoObjects} descriptionHtml={descriptionHtml} pdfObjects={pdfObjects} catalogItemNumber={catalogItemNumber} paintsAttributes={mergedPaintsAttributes} viscosity={mergedViscosity.viscosity} colorDescription={colorDescription} />

          {/* <ProductVariations images={images.nodes} productVariant={productVariant} /> */}
          <ProductVariations images={images.nodes} productVariants={product.adjacentVariants} productVideos={videoObjects} productOptions={productOptions} descriptionHtml={descriptionHtml} pdfObjects={pdfObjects} />
      
        </div>
      </div>
      {/* show bottom section */} 
      
      <div className='artists_sec pt-10 '>
        <div className='container 2xl:container'>
          <div className="flex flex-wrap">
            <BoughtTogetherSilder arrivalsCollection={arrivalcollectionData.collection} />
            <RelatedSet arrivalsCollection={arrivalcollectionData.collection} />
          </div>
        </div>
      </div>
      <div className='upsale pt-20 group-[.parrentProduct]/product:hidden'>
        <div className='container 2xl:container'>
          <ArtistsViewedPDSlider artistCollection={arrivalcollectionData.collection} />
        </div>
        
      </div>
      
      <Modal show={filterModal} onClose={() => setFilterModal(false)}  width="w-[95%]" headerClasses="hidden" footerClasses="hidden"
        //  headerContent={}
        // footerContent={}
      >
        <div className=''>
          <h2 className="text-[140%] leading-relaxed text-blue text-center bg-grey-100 p-j5  font-semibold">Shop Da Vinci Pro Birch Round and Oval Painting Panels</h2>
          <div className='mb-j30 pt-j30'>
            {productOptions.map((option) => {
            if (option.optionValues.length === 1) return null;
            return (
            <div className='border-b  border-grey-200 pb-5' key={option.name}>
              <label className='font-semibold mb-0 leading-none'>{option.name}</label>
              <div className='flex flex-wrap items-center gap-6'>
                <ul className='flex gap-4'>
                  {option.optionValues.map((value) => {
                    const {
                      name,
                      handle,
                      variantUriQuery,
                      selected,
                      available,
                      exists,
                      isDifferentProduct,
                      swatch,
                    } = value;
                    if (option.name == 'Color') {
                      return (
                  <li key={name}>
                    <label className='p-0 pl-6 leading-6 relative'  style={{ 'background': '#000000' }}>
                        <input className='opacity-0 z-10 m-0 w-6 peer h-6 top-0 left-0 absolute' type="checkbox"  value={name} /> <span className='ps-j5 pe-2.5 bg-white'>{name}</span>
                        <span className='absolute w-[22px] h-[21px] mt-px ml-px opacity-0 peer-checked:opacity-100 bg-white left-0 top-0 border after:absolute after:left-[7px] after:top-[2px] after:w-[6px] after:h-[13px] after:rotate-45 after:border-r after:border-b after:border-blue'></span>
                    </label>
                  </li>
                  )
                    }else{
                      return (
                        <li>
                          <label className='p-0 pl-6 leading-6 relative'>
                            <input className='opacity-0 z-10 m-0 w-6 peer h-6 top-0 left-0 absolute' type="checkbox"  value="{name}" /> <span className='ps-j5 pe-2.5 bg-white'>{name}</span>
                            <span className='absolute w-6 h-6 peer-checked:bg-brand bg-white left-0 top-0 border after:absolute after:left-[7px] after:top-[2px] after:w-[6px] after:h-[13px] after:rotate-45 after:border-r after:border-b border-brand after:opacity-0 after:border-white peer-checked:after:opacity-100'></span>
                          </label>
                        </li>
                      )
                    }
                })}
                </ul>
                <button className='btn-greenOutline px-2.5 py-0.5 text-16 font-medium hidden'>Clear All</button>
              </div>
            </div>
                );
            })}
          </div>
          <div className='w-full'>
            <p className='text-brand pl-10'>click on an image to see more</p>
            <div className='flex flex-wrap gap-2.5 items-start justify-between md:justify-start p-5 pl-10'>
              {product.adjacentVariants.map((variant) => {
                const color = variant.selectedOptions.find(
                  (opt) => opt.name.toLowerCase() === 'color'
                )?.value;

                const size = variant.selectedOptions.find(
                  (opt) => opt.name.toLowerCase() === 'size'
                )?.value;

                const format = variant.selectedOptions.find(
                  (opt) => opt.name.toLowerCase() === 'format'
                )?.value;

                const variantId = variant.id.split('/').pop();
                
                const variantURL = '/products/' + variant.product.handle + '?Color=' + color + '&Size=' + size + '&Format=' + format;

                return (
                <div key={variant.id} className='relative group/gridItem [&.active]:scale-125 [&.active]:translate-y-4 hover:scale-125 hover:translate-y-4 hover:shadow-text [&.active]:-mb-[140px] hover:-mb-[140px] [&.active]:shadow-text w-[140px] hover:z-10 [&.active]:z-10 text-14/4 text-center bg-white border border-grey-200 p-j5 rounded-sm flex flex-col gap-y-1'>
                  <img src={variant.image.url} alt={variant.metafield?.value || variant.title} className="w-full aspect-square object-cover" />
                  <div className='flex flex-col'>
                    <p className="text-inherit mb-0">{variant.metafield?.value || variant.title}</p>
                    <span className='text-xs'>{size}</span>
                    <span className='text-xs text-blue flex flex-wrap justify-between group-[.active]/gridItem:flex-col group-hover/gridItem:flex-col group-[.active]/gridItem:justify-center group-hover/gridItem:justify-center'>
                      <span className='font-semibold group-[.active]/gridItem:text-[80%] group-hover/gridItem:text-[80%]'>Reg. Price</span>
                      <span className=' group-[.active]/gridItem:text-[110%] group-hover/gridItem:text-[110%]  group-[.active]/gridItem:font-semibold group-hover/gridItem:font-semibold'>${variant.price.amount}</span>
                    </span>
                    <div className='-m-j5 mt-j5 p-j5 border-t border-grey-200 hidden group-[.active]/gridItem:block group-hover/gridItem:block'>
                      <div className='flex flex-col gap-y-1'>
                        <a href={variantURL} className='text-brand text-[80%] underline text-center'>See This Item</a>
                        <span className='text-center text-[80%]'>Or</span>
                        <div className='text-[80%]'>
                          <span className='text-brand mb-1 block'>Hurry Only 7 left</span>
                          <div className='flex gap-2 items-center mb-2.5'>
                            <span className='flex-none font-medium'>Qty #:</span>
                            <QuantityInput 
                              quantity={quantity}
                              onChange={setQuantity}
                              sectionClasses="text-black font-semibold border border-gray-200"
                              btnClasses="w-5 h-j30 text-18"
                              fieldClasses="border-0 text-14"
                            />
                          </div>
                        </div>                      
                        <div className='flex  gap-x-1 items-center justify-center'>
                          <div className="flex flex-wrap flex-col">
                            <span className="prod-alert-label hidden">Product Badge:</span>
                            <ul className="badgesFlags flex flex-wrap gap-1">
                              <li className="alert-item w-6 group/tooltip rounded-sm tech-notes tech-specs">
                                <svg width="14" height="14" aria-hidden="true">
                                  <use href="#icon-tech-notes" />
                                </svg>
                                <span className="sr-only">Tech Notes:</span>
                                <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-4 -translate-x-1/4 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  group-[&.active]/gridItem:scale-75 group-hover/gridItem:scale-75 origin-bottom">Click This Icon To See Tech Notes</span>
                              </li>
                            </ul>
                          </div>
                          <button className="btn-toCart ml-auto px-4 text-[11px] uppercase !min-h-0">Add</button>
                        </div>
                      </div>                    
                    </div>
                  </div>
                </div> 
                    )              
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
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
    metafield(namespace: "custom", key: "product_variant_name") {
      value
      type
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
    images(first: 20) {
      nodes {
        url
        altText
        width
        height
      }
    }
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
      metafields(identifiers: [
        {namespace: "custom", key: "select_product_videos"},
        {namespace: "custom", key: "product_charts_pdf"},
        {namespace: "custom", key: "short_description"},
        {namespace: "custom", key: "catalog_item_number"},
        {namespace: "custom", key: "reference_color_description"},
        {namespace: "custom", key: "paints_mediums_multiselect_attribute"},
        {namespace: "custom", key: "reference_size"},
        {namespace: "custom", key: "select_viscosity"}
        {namespace: "custom", key: "select_product_type"}
        ]) {
        key
        value
        type
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const PRODUCT_VIDEOS_QUERY = `#graphql
query GetMetaobjects($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Metaobject {
      id
      handle
      type
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
}`;

const PRODUCT_PDF_QUERY = `#graphql
query GetPdfNodes($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on GenericFile {
      id
      url
      filename
      mimeType
      createdAt
    }
    ... on Metaobject {
      id
      handle
      type
      fields {
        key
        value
        reference {
          ... on GenericFile {
            id
            url
            filename
            mimeType
          }
          ... on MediaImage {
            image { url altText }
          }
        }
      }
    }
  }
}`;

const COLLECTION_COUPONS_QUERY = `#graphql
query GetCollectionCouponsMetaobjects($type: String!, $first: Int!) {
  metaobjects(type: $type, first: $first) {
    nodes {
      id
      handle
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
}`;

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
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
