import React, { useState } from 'react';
import { defer, redirect } from '@shopify/remix-oxygen';
import { useLoaderData, Link } from '@remix-run/react';
import SiblingCollections from "../components/SiblingCollections";
import CouponBanners from "../components/CouponBanners";
import Accordion from "../components/Accordion";
import ProductFilter from "../components/ProductFilter";
import { useLocation, useSearchParams } from '@remix-run/react';
import { CiGrid41 } from "react-icons/ci";
import { FaListUl } from "react-icons/fa";
import { CiPlay1 } from "react-icons/ci";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoHeart } from "react-icons/io5";
import { GoHeart } from "react-icons/go";
import { IoMdHeart } from "react-icons/io";
import { BiGridAlt } from "react-icons/bi";
import Popup from "../components/Popup";
import Modal from "../components/Modal";
import {useRouteLoaderData} from '@remix-run/react';
import {useWishlist} from '~/components/WishlistProvider';
import { TfiLayoutGrid2Alt } from "react-icons/tfi";
import { FaList } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import { isGroupProduct, formatGroupProductPrice } from '~/utils/groupPricing';
import { fetchGroupProductPriceRange } from '~/utils/groupPricing.server';
import { useVariantUrl } from '~/lib/variants';
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';


export const meta = ({ data }) => {
  return [{ title: `Hydrogen | ${data?.collection.title ?? ''} Collection` }];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({ ...deferredData, ...criticalData });
}

async function loadCriticalData({ context, params, request }) {
  const { handle } = params;
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request);

  if (!handle) {
    throw redirect('/collections');
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const filters = [];
  const selectedAttr = {
    color: searchParams.get('attr.color') || null,
    size: searchParams.get('attr.size') || null,
  };

  // Handle availability filter
  if (searchParams.get('availability') === 'true') {
    filters.push({ available: true });
  }

  searchParams.forEach((fValue, key) => {
    if (key.startsWith('filter.')) {
      const [_, filterType, filterName] = key.split('.');
      const parsedData = JSON.parse(fValue);
      //console.log('value', parsedData.productMetafield);
      if (parsedData.productVendor) {
        if (filterType === 'v') {
          filters.push({
            productVendor: parsedData.productVendor
          });
        }
      } else if (parsedData.tag) {
        if (filterType === 'v') {
          filters.push({
            tag: parsedData.tag
          });
        }
      } else if (parsedData.variantOption) {
        const { name, value } = parsedData.variantOption;
        if (filterType === 'v') {
          // Variant filters
          filters.push({
            variantOption: {
              name: name,
              value: value
            }
          });
        } else if (filterType === 'p') {
          // Product filters
          filters.push({
            [filterName]: value
          });
        }
      } else if (parsedData.productMetafield) {
        const { namespace, key, value } = parsedData.productMetafield;
        if (filterType === 'v') {
          // Variant filters
          filters.push({
            productMetafield: {
              namespace: namespace,
              key: key,
              value: value
            }
          });
        }
      }
    }
  });

  const { collection } = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      filters,
      ...paginationVariables
    },
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // Enhance grouped products with computed child price ranges
  const nodes = collection?.products?.nodes || [];
  const enhancedNodes = await Promise.all(
    nodes.map(async (product) => {
      if (isGroupProduct(product)) {
        // If metafield is list of references, prefer those ids
        const refIds = (product?.childProductsRefs?.references?.nodes || [])
          .map((n) => n?.id)
          .filter(Boolean);
        let updatedRange;
        if (refIds.length > 0) {
          try {
            const { nodes: priceNodes } = await context.storefront.query(`#graphql
              query ChildPrices($ids: [ID!]!) { nodes(ids: $ids) { ... on Product { id priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } } } } }
            `, { variables: { ids: refIds } });
            const prices = (priceNodes || []).filter(Boolean);
            let min = Infinity, max = -Infinity, cc = 'USD';
            prices.forEach((p) => {
              const a = parseFloat(p?.priceRange?.minVariantPrice?.amount || '0');
              const b = parseFloat(p?.priceRange?.maxVariantPrice?.amount || '0');
              if (a < min) { min = a; cc = p?.priceRange?.minVariantPrice?.currencyCode || cc; }
              if (b > max) { max = b; }
            });
            if (Number.isFinite(min) && Number.isFinite(max)) {
              updatedRange = { minVariantPrice: { amount: String(min), currencyCode: cc }, maxVariantPrice: { amount: String(max), currencyCode: cc } };
            }
          } catch {}
        }
        if (!updatedRange) {
          updatedRange = await fetchGroupProductPriceRange(context, product);
        }
        return { ...product, priceRange: updatedRange };
      }
      return product;
    })
  );
  let enhancedCollection = {
    ...collection,
    products: {
      ...collection.products,
      nodes: enhancedNodes,
    },
  };

  // Parse full width ads from dedicated metaobjects type and featured ads from metafield
  const fullWidthAds = [];
  const featuredAds = [];
  try {
    // Fetch metaobjects of type fullwidth_advertisement for parent collection pages
    const { metaobjects } = await storefront.query(`#graphql
      query GetFullwidthAds($type: String!) { metaobjects(type: $type, first: 10) { nodes { id handle fields { key value reference { ... on MediaImage { image { url altText } } } } } } }
    `, { variables: { type: "fullwidth_advertisement" } });
    const nodes = metaobjects?.nodes || [];
    nodes.forEach((node) => {
      const fields = (node?.fields || []).reduce((acc, f) => { acc[f.key] = f; return acc; }, {});
      // Per spec: fields: advertisement (image/file) and advertisement_link
      const img = fields.advertisement?.reference?.image?.url || fields.advertisement?.reference?.url || fields.image?.reference?.image?.url || '';
      const href = fields.advertisement_link?.value || fields.link?.value || '#';
      const alt = fields.alt?.value || fields.title?.value || '';
      if (img) fullWidthAds.push({ img, href, alt });
    });
  } catch {}

  // Parse featured ads similarly
  try {
    const edges = enhancedCollection?.featuredAds?.references?.edges || [];
    for (const { node } of edges) {
      if (!node) continue;
      if (node.__typename === 'Metaobject' || node.fields) {
        const fields = (node.fields || []).reduce((acc, f) => { acc[f.key] = f; return acc; }, {});
        // featured_advertisement metafield uses fields: advertisement, advertisement_link
        const img = fields.advertisement?.reference?.image?.url || fields.advertisement?.reference?.url || fields.image?.reference?.image?.url || '';
        const href = fields.advertisement_link?.value || fields.link?.value || '#';
        const alt = fields.alt?.value || fields.title?.value || '';
        if (img) featuredAds.push({ img, href, alt });
      } else if (node.image?.url) {
        featuredAds.push({ img: node.image.url, href: '#', alt: node.image.altText || '' });
      }
    }
  } catch {}

  // If attribute filters are present, filter products by paintsMediumsAttributes
  if (selectedAttr.color || selectedAttr.size) {
    const matchesAttr = (p) => {
      const attr = p?.paintsMediumsAttributes;
      const values = { colors: new Set(), sizes: new Set() };
      if (attr?.references?.edges?.length) {
        for (const { node } of attr.references.edges) {
          const fields = (node?.fields || []).reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
          const colorName = fields.color_name || fields.color || fields.colour || '';
          const sizeVal = fields.size || '';
          if (colorName) values.colors.add(String(colorName).trim());
          if (sizeVal) values.sizes.add(String(sizeVal).trim());
        }
      }
      // Fallback: parse text tokens for safety
      const raw = attr?.value;
      if (raw) {
        const tokens = String(raw).split(/\||,/).map((t) => t.trim());
        tokens.forEach((t) => {
          const [k, v] = t.split(':');
          const key = (k || '').trim().toLowerCase();
          const val = (v || '').trim();
          if (key === 'color' || key === 'colour') values.colors.add(val);
          if (key === 'size') values.sizes.add(val);
        });
      }
      const colorOk = selectedAttr.color ? values.colors.has(selectedAttr.color) : true;
      const sizeOk = selectedAttr.size ? values.sizes.has(selectedAttr.size) : true;
      return colorOk && sizeOk;
    };

    const filtered = enhancedNodes.filter((p) => matchesAttr(p));
    enhancedCollection = {
      ...enhancedCollection,
      products: { ...enhancedCollection.products, nodes: filtered },
    };
  }

  // Build Color/Size options from custom.paints_mediums_multiselect_attribute (Mixed reference)
  const attributeFilters = { colors: [], sizes: [] };
  try {
    const colorSet = new Set();
    const sizeSet = new Set();
    // Helper: parse IDs from metafield string
    const parseIdArray = (raw) => {
      const isGid = (v) => typeof v === 'string' && /^gid:\/\/shopify\//.test(v.trim());
      if (!raw) return [];
      if (Array.isArray(raw)) {
        return raw.map((v) => (typeof v === 'object' && v && v.id ? v.id : v)).filter((v) => isGid(v));
      }
      if (typeof raw === 'string') {
        let trimmed = raw.trim().replace(/&quot;/g, '"').replace(/&#34;/g, '"');
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          trimmed = trimmed.slice(1, -1);
        }
        try {
          let parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.map((v) => (typeof v === 'object' && v && v.id ? v.id : v)).filter((v) => isGid(v));
          }
          if (parsed && parsed.id && isGid(parsed.id)) return [parsed.id];
        } catch {}
        try {
          const sq = trimmed.replace(/'/g, '"');
          const parsedSq = JSON.parse(sq);
          if (Array.isArray(parsedSq)) {
            return parsedSq.map((v) => (typeof v === 'object' && v && v.id ? v.id : v)).filter((v) => isGid(v));
          }
          if (parsedSq && parsedSq.id && isGid(parsedSq.id)) return [parsedSq.id];
        } catch {}
        if (isGid(trimmed)) return [trimmed];
        const bracketMatch = trimmed.replace(/^\[|\]$/g, '');
        const splitCandidates = bracketMatch.split(/\s*,\s*|\s+/).filter(Boolean);
        const fromSplit = splitCandidates.filter((v) => isGid(v));
        if (fromSplit.length) return fromSplit;
        const regexMatches = trimmed.match(/gid:\/\/shopify\/[A-Za-z]+\/[0-9]+/g);
        if (regexMatches && regexMatches.length) return regexMatches;
        return [];
      }
      if (typeof raw === 'object' && raw.id && isGid(raw.id)) return [raw.id];
      return [];
    };

    // Collect all metaobject ids referenced by products
    const allIds = [];
    for (const p of enhancedNodes) {
      const attr = p?.paintsMediumsAttributes;
      if (!attr) continue;
      // Prefer GraphQL references if provided
      const edges = attr?.references?.edges || [];
      if (edges.length) {
        for (const { node } of edges) {
          const fields = (node?.fields || []).reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
          const colorName = fields.color_name || fields.color || fields.colour || '';
          const sizeVal = fields.size || '';
          if (colorName) colorSet.add(String(colorName).trim());
          if (sizeVal) sizeSet.add(String(sizeVal).trim());
        }
      } else {
        // Fallback: parse ids from raw value and fetch metaobjects
        const ids = parseIdArray(attr?.value);
        if (ids.length) allIds.push(...ids);
      }
    }
    // Fetch any unresolved metaobjects in one batch
    if (allIds.length) {
      const { nodes: metaNodes } = await storefront.query(METAOBJECTS_BY_IDS_QUERY, { variables: { ids: Array.from(new Set(allIds)) } });
      (metaNodes || []).filter(Boolean).forEach((node) => {
        const fields = (node?.fields || []).reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
        const colorName = fields.color_name || fields.color || fields.colour || '';
        const sizeVal = fields.size || '';
        if (colorName) colorSet.add(String(colorName).trim());
        if (sizeVal) sizeSet.add(String(sizeVal).trim());
      });
    }
    attributeFilters.colors = Array.from(colorSet);
    attributeFilters.sizes = Array.from(sizeSet);
  } catch (_) {}

  // Compute collections to display in the sidebar:
  // - If current collection has a parent: show siblings (same parent)
  // - If it does not have a parent: show children (collections where parent == current collection)
  const parentRefId = enhancedCollection?.parentCategory?.reference?.id || null;
  let siblingCollections = [];
  try {
    const allResp = await storefront.query(SIBLING_COLLECTIONS_QUERY, {
      variables: { first: 200 },
    });
    const allNodes = allResp?.collections?.nodes || [];
    const currentId = enhancedCollection.id;
    // Prefer children of the current collection, regardless of having a parent
    const children = allNodes
      .filter((c) => c?.parentCollection?.reference?.id === currentId)
      .map((c) => ({ id: c.id, title: c.title, handle: c.handle, image: c.image }));
    if (children.length > 0) {
      siblingCollections = children;
    } else if (parentRefId) {
      // Fallback to siblings (same parent, excluding current)
      siblingCollections = allNodes
        .filter((c) => c?.parentCollection?.reference?.id === parentRefId && c.handle !== enhancedCollection.handle)
        .map((c) => ({ id: c.id, title: c.title, handle: c.handle, image: c.image }));
    } else {
      siblingCollections = [];
    }
  } catch (e) {
    // ignore
  }

  // Build feature brands list from references
  const featureBrands = (enhancedCollection?.featureBrands?.references?.edges || [])
    .map(({ node }) => node)
    .filter(Boolean)
    .map((c) => ({ id: c.id, title: c.title, handle: c.handle, image: c.image }));

  return { collection: enhancedCollection, siblingCollections, attributeFilters, fullWidthAds, featuredAds, featureBrands };
}

function loadDeferredData({ context }) {
  return {};
}

function useFilters() {
  const [searchParams] = useSearchParams();
  const activeFilters = [];

  searchParams.forEach((value, key) => {
    if (key.startsWith('filter.')) {
      const [_, filterType, filterName] = key.split('.');

      activeFilters.push({
        key,
        type: filterType,
        name: filterName,
        value,
      });
    }
  });

  return activeFilters;
}

export default function Collection() {
  const { collection, siblingCollections = [], attributeFilters = { colors: [], sizes: [] }, fullWidthAds = [], featuredAds = [], featureBrands = [] } = useLoaderData();
  const filters = useFilters();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  console.log('siblingCollections', siblingCollections);
  const hasParent = Boolean(collection?.parentCategory?.reference?.id);
  const moreWaysFilter = collection?.products?.filters?.find((f) => String(f.id).includes('more_ways_to_shop'));

  const createFilterUrl = (filterType, filterName, value) => {
    const newSearchParams = new URLSearchParams(searchParams);

    // Clear existing filters of the same type and name
    newSearchParams.forEach((val, key) => {
      if (key.startsWith(`filter.${filterType}.${filterName}`)) {
        newSearchParams.delete(key);
      }
    });

    // Set the new filter if value is not null
    if (value !== null) {
      newSearchParams.set(`filter.${filterType}.${filterName}`, value);
    }

    // Reset pagination when filters change
    newSearchParams.delete('cursor');

    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  // Build URL for attribute filters like attr.color and attr.size
  const createAttrUrl = (attrName, attrValue) => {
    const newSearchParams = new URLSearchParams(searchParams);
    // Set attr param
    if (attrValue != null) newSearchParams.set(`attr.${attrName}`, attrValue);
    // Reset pagination when filters change
    newSearchParams.delete('cursor');
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  const removeFilter = (filterKey) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete(filterKey);
    newSearchParams.delete('cursor');
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  // Active attribute filters (color/size) from URL
  const activeAttr = {
    color: searchParams.get('attr.color'),
    size: searchParams.get('attr.size')
  };

  const removeAttrUrl = (attrName) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete(`attr.${attrName}`);
    newSearchParams.delete('cursor');
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  const clearAllUrl = () => {
    const newSearchParams = new URLSearchParams(location.search);
    // remove attr.* and filter.* keys
    Array.from(newSearchParams.keys()).forEach((k) => {
      if (k.startsWith('attr.') || k.startsWith('filter.')) newSearchParams.delete(k);
    });
    newSearchParams.delete('availability');
    newSearchParams.delete('cursor');
    const qs = newSearchParams.toString();
    return qs ? `${location.pathname}?${qs}` : location.pathname;
  };


  const [openIndex, setOpenIndex] = useState([0,1,2,3]);
  const handleToggle = (index) => {
    setOpenIndex((prevIndexes) => {
      if (prevIndexes.includes(index)) {
        // If index is already open, remove it (close)
        return prevIndexes.filter(i => i !== index);
      } else {
        // Otherwise, add it to openIndexes (open)
        return [...prevIndexes, index];
      }
    });
  };

  const [toggleView, setToggleView] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClearFilters = () => {

    const newSearchParams = new URLSearchParams(location.search);

    const filterKeys = Array.from(newSearchParams.keys()).filter(key => key.startsWith('filter.'));

    filterKeys.forEach(key => newSearchParams.delete(key));

    newSearchParams.delete('cursor');

    const newUrl = newSearchParams.toString() ? `${location.pathname}?${newSearchParams.toString()}` : location.pathname;

    window.location.assign(newUrl);
  };


  //popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [content, setContent] = useState(" is a popup!");

  const iframeContent = (
    <iframe
      id="fancybox-frame1743061232863"
      name="fancybox-frame1743061232863"
      className="fancybox-iframe"
      allowFullScreen
      allow="autoplay; fullscreen"
      src="https://www.youtube-nocookie.com/embed/ZY2rhHxC3Y4?autoplay=1&autohide=1&fs=1&rel=0&hd=1&wmode=transparent&enablejsapi=1&html5=1"
      scrolling="no"
    />
  );

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  // Function to close the popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  
  const allProducts = collection.products?.nodes || [];
  
  const paginatedNodes = allProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  
  

  const [showArrows, setShowArrows] = useState(false);
  const totalBrands = collection?.listBrands?.references?.edges?.length || 0;

  const updateShowArrows = (swiper) => {
  if (!swiper?.slides?.length) return;

  const totalSlides = swiper.slides.length;
  const currentSlidesPerView =
    typeof swiper.params.slidesPerView === "number"
      ? swiper.params.slidesPerView
      : Math.floor(swiper.width / swiper.slides[0].offsetWidth);

  setShowArrows(totalSlides > currentSlidesPerView);
};

  return (
    <>
    <div className='flex flex-col'>
      <CouponBanners bannerCoupons={collection.banner_coupons} />

      <header className="custom-container mb-5 md:mb-0">
        {(() => {
          const bannerUrl = collection?.bannerImage?.reference?.image?.url;
          const hasBanner = !!bannerUrl;
          return (
            <div
              className={`py-3 border-t border-b border-grey-200 relative ${hasBanner ? 'bg-cover bg-center' : ''}`}
              style={hasBanner ? { backgroundImage: `url(${bannerUrl})` } : undefined}
            >
              {hasBanner && <div className="absolute inset-0 bg-black/40 pointer-events-none" />}
              <div className={`relative text-center px-5 max-w-[1170px] mx-auto ${hasBanner ? 'text-white' : 'text-blue'}`}>
            <h1 className='text-22 md:text-26 jlg:text-40 py-5 mb-0 block font-semibold'><span className='leading-none block'>{collection.title}</span></h1>
            {collection.bannerContent?.value && <p>{collection.bannerContent.value}</p>}
            <a href="#faq" className='hover:underline'>...Read More+</a>
          </div>
        </div>
          );
        })()}
      </header>


      <div className='-order-1 md:order-none bg-grey-100 md:mb-5 h-10 md:h-11 flex items-center'>
        <div className="breadcrumb custom-container">
          <ul className="flex [&>li]:!text-grey-500 [&>li:last-child]:!text-brand [&>li]:text-13 [&>li]:md:text-sm [&>li]:px-3 [&>li]:md:px-2 [&>li:first-child]:ps-0 [&>li:last-child]:pe-0 [&>li]:relative [&>li]:after:content-['>'] [&>li]:after:text-[120%] [&>li]:md:after:content=['/'] [&>li]:after:absolute [&>li]:after:-end-1 [&>li]:md:after:-end-0.5 [&>li]:after:top-0.5 [&>li]:after:pointer-events-none [&>li]:after:!text-grey-500 [&>li:last-child]:after:hidden [&>li:nth-last-child(2)]:after:hidden [&>li:nth-last-child(2)]:md:after:block [&>li]:md:after:text-10 [&>li:last-child]:hidden [&>li:last-child]:md:block">
            <li className=""><Link to="/" className='font-medium  underline hover:no-underline hover:!text-brand'>Home</Link></li>
            <li className=""><Link to="/" className='font-medium  underline hover:no-underline hover:!text-brand'>Collection</Link></li>
            <li className="">{collection.title}</li>
          </ul>
        </div>
      </div>

      {siblingCollections.length > 0 && (
        hasParent ? (
          <div className=" custom-container relative">
            <Swiper
              className="group w-full py-j5 mb-2.5"
              modules={[Navigation, Pagination, Scrollbar,  A11y]}
              navigation={{ nextEl: ".a_arrow-right", prevEl: ".a_arrow-left" }}
              spaceBetween={10}
              slidesPerView={2}
              slidesPerGroup={1} 
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              onSwiper={updateShowArrows}
              onResize={updateShowArrows}
              breakpoints={{
                460: { slidesPerView: 3 },
                991: { slidesPerView: 4 },
                1201: { slidesPerView: 5 },
                1301: { slidesPerView: 6 },
              }}
            >
              {siblingCollections.map((node) => (
                <SwiperSlide key={node.id}>
                  <div className="w-full text-center">
              <Link to={`/collections/${node.handle}`} className='text-center'>
                      <div className="flex justify-center flex-col p-2.5">
                        <figure className=' mb-2.5 mx-auto aspect-[125/147] w-full max-w-32'>
                    {node.image?.url ? (
                            <img src={node.image.url} alt={node.title} className="w-full h-full object-contain" />
                    ) : (
                            <img src="/default-image.jpg" alt="Default" className="w-full h-full object-contain" />
                    )}
                  </figure>
                        <h6 className="text-blue mb-0 font-semibold text-sm hover:text-brand ">{node.title}</h6>
                </div>
              </Link>
            </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <button className={`a_arrow-left arrow swiper-button-prev after:hidden before:w-5 before:h-5 ml-1 ${ !showArrows ? "hidden" : ""}`}></button>
            <button className={`a_arrow-right arrow swiper-button-next after:hidden before:w-5 before:h-5  ${ !showArrows ? "hidden" : ""}`}></button>            
          </div>
        ) : (
          <>
          <SiblingCollections
            items={siblingCollections}
            title={`${collection.title} by Category`}
            forceGrid={true}
          />

          {/* Full width ads section below child collections on parent collection pages */}
          {fullWidthAds.length > 0 && (
            <div className="custom-container  ">
              {fullWidthAds.map((ad, idx) => (
                <div key={`fw-${idx}`} className="mt-10 p-5 bg-grey-100 border border-grey-200 hidden md:block">
                  {ad.href ? (
                    <a href={ad.href} className='block'>
                      <img src={ad.img} alt={ad.alt || 'Advertisement'} className="w-full h-auto" />
                    </a>
                  ) : (
                    <img src={ad.img} alt={ad.alt || 'Advertisement'} className="w-full h-auto" />
                  )}
                </div>
              ))}
        </div>
      )}

          {featuredAds.length > 0 && (
            <div className="custom-container mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredAds.map((ad, idx) => (
                <div key={`feat-${idx}`}>
                  {ad.href ? (
                    <a href={ad.href} className='block'>
                      <img src={ad.img} alt={ad.alt || 'Advertisement'} className="w-full h-auto" />
                    </a>
                  ) : (
                    <img src={ad.img} alt={ad.alt || 'Advertisement'} className="w-full h-auto" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="custom-container mt-[60px] md:mt-[150px]">
            <div className="page-list-collections">
              <h2 className="text-25 font-semibold  relative mb-j15">
                {collection.title} by Brands
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
                onSwiper={updateShowArrows}
                onResize={updateShowArrows}
              >
                {(featureBrands && featureBrands.length > 0 ? featureBrands : siblingCollections).map((node) => (
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
              <button className={`n_arrow-left arrow swiper-button-prev !-mt-j5 after:hidden before:w-5 before:h-5 ml-1 ${ !showArrows ? "hidden" : ""}`}></button>
              <button className={`n_arrow-right arrow swiper-button-next  !-mt-j5  after:hidden before:w-5 before:h-5  ${ !showArrows ? "hidden" : ""}`}></button>            
            </div>
          </div>
        </>
        )
      )}

      {(hasParent || siblingCollections.length === 0) && (
      <div className='custom-container'>
        <div className='flex md:border-t md:border-grey-200 '>
          <div className='hidden md:block md:w-[30%] tb:w-[20.833%] md:border-r md:border-grey-200 pt-j15 pr-j15 tb:pt-5 tb:pr-5 jlg:pt-j30 jlg:pr-j30'>
            <div className='sticky top-16'>
                      <div className="mainbox">
                {(activeAttr.color || activeAttr.size || filters.length > 0) && (
                  <div className="">
                    <div className="font-semibold !text-base/none bg-grey-100 py-3 pl-5 pr-10">Now Shopping by</div>
                    <ul className="flex flex-col gap-y-2.5 py-j15 px-2.5">
                      {activeAttr.color && (
                        <li className="flex items-center gap-2">
                          <Link to={removeAttrUrl('color')} className="w-3 h-3 peer relative before:inset-x-0 after:inset-x-0 before:top-1/2 after:top-1/2 before:absolute after:absolute before:h-px after:h-px before:bg-[#c7c7c7] after:bg-[#c7c7c7] hover:before:bg-[#494949] hover:after:bg-[#494949] before:transition-all after:transition-all before:rotate-45 after:-rotate-45"></Link>
                          <span className='peer-hover:opacity-50 transition-all'><span className="font-semibold">Color:</span> {activeAttr.color}</span>
                        </li>
                      )}
                      {activeAttr.size && (
                        <li className="flex items-center gap-2">
                          <Link to={removeAttrUrl('size')} className="w-3 h-3 peer relative before:inset-x-0 after:inset-x-0 before:top-1/2 after:top-1/2 before:absolute after:absolute before:h-px after:h-px before:bg-[#c7c7c7] after:bg-[#c7c7c7] hover:before:bg-[#494949] hover:after:bg-[#494949] before:transition-all after:transition-all before:rotate-45 after:-rotate-45"></Link>
                          <span className='peer-hover:opacity-50 transition-all'><span className="font-semibold">Size:</span> {activeAttr.size}</span>
                        </li>
                      )}
                      {filters.map((f) => {
                        try {
                          const parsed = JSON.parse(f.value);
                          const v = parsed?.productMetafield?.value || '';
                          if (typeof v === 'string') {
                            if (v.includes('On Super Sale')) {
                              return (
                                <li key={f.key} className="flex items-center gap-2">
                                  <Link to={removeFilter(f.key)} className="w-3 h-3 peer relative before:inset-x-0 after:inset-x-0 before:top-1/2 after:top-1/2 before:absolute after:absolute before:h-px after:h-px before:bg-[#c7c7c7] after:bg-[#c7c7c7] hover:before:bg-[#494949] hover:after:bg-[#494949] before:transition-all after:transition-all before:rotate-45 after:-rotate-45"></Link>
                                  <span className='peer-hover:opacity-50 transition-all'><span className="font-semibold">Is On Super Sale:</span> Yes</span>
                                </li>
                              );
                            }
                            if (v.includes('On Sale')) {
                              return (
                                <li key={f.key} className="flex items-center gap-2">
                                  <Link to={removeFilter(f.key)} className="w-3 h-3 peer relative before:inset-x-0 after:inset-x-0 before:top-1/2 after:top-1/2 before:absolute after:absolute before:h-px after:h-px before:bg-[#c7c7c7] after:bg-[#c7c7c7] hover:before:bg-[#494949] hover:after:bg-[#494949] before:transition-all after:transition-all before:rotate-45 after:-rotate-45"></Link>
                                  <span className='peer-hover:opacity-50 transition-all'><span className="font-semibold">Is On Sale:</span> Yes</span>
                                </li>
                              );
                            }
                            if (v.includes('New Arrivals') || v.includes('New Arrival')) {
                            return (
                                <li key={f.key} className="flex items-center gap-2">
                                  <Link to={removeFilter(f.key)} className="w-3 h-3 peer relative before:inset-x-0 after:inset-x-0 before:top-1/2 after:top-1/2 before:absolute after:absolute before:h-px after:h-px before:bg-[#c7c7c7] after:bg-[#c7c7c7] hover:before:bg-[#494949] hover:after:bg-[#494949] before:transition-all after:transition-all before:rotate-45 after:-rotate-45"></Link>
                                  <span className='peer-hover:opacity-50 transition-all'><span className="font-semibold">New Arrivals:</span> Yes</span>
                                </li>
                              );
                            }
                          }
                        } catch {}
                        return null;
                      })}
                    </ul>
                    <div className="mb-j30 px-2.5">
                      <Link to={clearAllUrl()} className="text-[#1979c3] text-sm">Clear All</Link>
                        </div>
                      </div>
                    )}
                  {siblingCollections.length > 0 && (
                   <div className="applied-filters border-b border-grey-200">
                     <button type="button" onClick={() => handleToggle(0)} className='w-full text-left text-base font-semibold flex items-center justify-between uppercase py-j15'>Categories <span className='ml-3'>{openIndex.includes(0) ? <FaChevronUp /> : <FaChevronDown />}</span></button>
                     {openIndex.includes(0) && (
                       <ul className="flex flex-col gap-y-1.5 pt-1 pb-5 max-h-48 overflow-auto">
                         {siblingCollections.map((node) => (
                           <li key={node.id}>
                             <Link to={`/collections/${node.handle}`} className="inline-block text-17 hover:text-brand hover:underline transition-all leading-[.9]">
                               {node.title}
                             </Link>
                           </li>
                         ))}
                       </ul>
                     )}
                      </div>
                  )}
                <h3 className='font-semibold pt-5 pb-j15 uppercase text-xl !leading-none border-b border-grey-200 mb-0'>SHOP BY:</h3>
                 {attributeFilters.colors.length > 0 || attributeFilters.sizes.length > 0 ? (
                   <>
                     {attributeFilters.colors.length > 0 && (
                       <div className='border-b border-grey-200'>
                         <button type="button" onClick={() => handleToggle(1)} className='w-full text-left text-base font-semibold flex items-center justify-between uppercase py-j15'>Color <span className='ml-3'>{openIndex.includes(1) ? <FaChevronUp /> : <FaChevronDown />}</span></button>
                         {openIndex.includes(1) && (
                           <ul className="flex flex-col gap-y-1.5 pt-1 pb-5 max-h-48 overflow-auto">
                             {attributeFilters.colors.map((color) => (
                               <li key={`color-${color}`}>
                                 <Link to={createAttrUrl('color', color)} className='inline-block text-17 hover:text-brand hover:underline transition-all leading-[.9]'>
                                   {color}
                                 </Link>
                               </li>
                             ))}
                           </ul>
                         )}
                       </div>
                     )}
                     {attributeFilters.sizes.length > 0 && (
                       <div className='border-b border-grey-200'>
                         <button type="button" onClick={() => handleToggle(2)} className='w-full text-left text-base font-semibold flex items-center justify-between uppercase py-j15'>Size <span className='ml-3'>{openIndex.includes(2) ? <FaChevronUp /> : <FaChevronDown />}</span></button>
                         {openIndex.includes(2) && (
                           <ul className="flex flex-col gap-y-1.5 pt-1 pb-5 max-h-48 overflow-auto">
                             {attributeFilters.sizes.map((size) => (
                               <li key={`size-${size}`}>
                                 <Link to={createAttrUrl('size', size)} className='inline-block text-17 hover:text-brand hover:underline transition-all leading-[.9]'>
                                   {size}
                                 </Link>
                               </li>
                             ))}
                           </ul>
                         )}
                       </div>
                     )}
                   </>
                 ) : null}
                 {moreWaysFilter?.values?.length ? (
                   <div className='border-b border-grey-200'>
                     <button type="button" onClick={() => handleToggle(3)} className='w-full text-left text-base font-semibold flex items-center justify-between uppercase py-j15'>More ways to shop <span className='ml-3'>{openIndex.includes(3) ? <FaChevronUp /> : <FaChevronDown />}</span></button>
                     {openIndex.includes(3) && (
                       <ul className="flex flex-col gap-y-1.5 pt-1 pb-5 max-h-48 overflow-auto">
                         {moreWaysFilter.values.map((value) => (
                            <li key={value.id}>
                              <Link
                               to={createFilterUrl('v', moreWaysFilter.id, value.input)}
                               className={`inline-block text-17 hover:underline transition-all leading-[.9] ${value.label === 'On Sale' ? 'text-onsale' : value.label === 'On Super Sale' ? 'text-onsupersale' : ' hover:text-brand'}`}
                              >
                                {value.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                 ) : null}
              </div>
            </div>
          </div>
          <div className="w-full md:w-[70%] tb:w-[79.167%] md:pt-j15 md:pl-j15 tb:pt-5 tb:pl-5">
            <div className='flex flex-wrap justify-between mb-2.5'>
              <div className='leading-10 font-semibold hidden md:block text-blue'>
                Showing All {collection.title}
              </div>
              <div className='flex flex-wrap justify-end gap-x-2 items-center ml-auto'>
                <span className='uppercase hidden md:block font-semibold text-blue'>Sort</span>
                <div className='flex gap-x-2.5'>
                  <button onClick={() => setToggleView(true)} className={`text-sm text-base-300 w-[45px] h-[45px] transition-all flex justify-center items-center border  hover:bg-brand hover:text-white font-semibold hover:border-brand ${toggleView ? ' bg-brand border-brand  text-white' : 'bg-gray-100 border-grey-200'}`}> <TfiLayoutGrid2Alt className="w-4 h-4" />  </button>
                  <button onClick={() => setToggleView(false)} className={`text-base text-base-300  w-[45px] h-[45px] transition-all  flex justify-center items-center border  hover:bg-brand hover:text-white font-semibold hover:border-brand ${toggleView ? 'bg-gray-100 border-grey-200' : ' bg-brand border-brand text-white'}`}>  <FaList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            { console.log('data', collection.products) }

            <PaginatedResourceSection
              connection={{ nodes: paginatedNodes }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              resourcesClassName="flex flex-wrap md:-mx-5"
            >
              {({ node: product, index }) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  isExpanded={isExpanded}
                  openPopup={openPopup}
                  content={content}
                  iframeContent={iframeContent}
                  closePopup={closePopup}
                  isPopupOpen={isPopupOpen}
                  handleToggleDescription={handleToggleDescription}
                  toggleView={toggleView}
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
      )}
      


      <Accordion page={collection} faqs={collection?.faqs?.references?.edges} type='collection ' />
    </div>
    </>
  );
}
/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({ product, loading, toggleView, iframeContent, isExpanded, handleToggleDescription, openPopup, isPopupOpen, closePopup, content }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const rootData = useRouteLoaderData('root');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  React.useEffect(() => {
    let cancelled = false;
    Promise.resolve(rootData?.isLoggedIn)
      .then((val) => { if (!cancelled) setLoggedIn(Boolean(val)); })
      .catch(() => { if (!cancelled) setLoggedIn(false); });
    return () => { cancelled = true; };
  }, [rootData?.isLoggedIn]);

  const inWishlist = isInWishlist(product.id);
  const handleWishlist = () => {
    if (!loggedIn) { setShowLoginPrompt(true); return; }
    if (inWishlist) removeFromWishlist(product.id); else {
      addToWishlist(product.id);
      setSuccessMsg('Added to wishlist');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  };
  const variantUrl = useVariantUrl(product.handle);
  //console.log('product data:- ', product);
  //const metafields = data.data.productByHandle.metafields.edges;
  //const moreWaysToShop = metafields.find(m => m.node.key === "more_ways_to_shop");

  return (

    <>
      {toggleView ? (
        <>
          <div className='sm:w-2/6 md:w-2/4 lg:w-2/6 xl:w-3/12 py-5 px-2.5 md:py-j30 md:px-5'>
            <div className='w-full min-h-full flex flex-col relative'>
              <Link className="product-item flex-none" key={product.id} prefetch="intent" to={variantUrl}>
                {product.featuredImage && (
                  <div className='w-full aspect-square flex items-center justify-center'>
                    <Image
                      alt={product.featuredImage.altText || product.title}
                      aspectRatio="1/1"
                      data={product.featuredImage}
                      loading={loading}
                      className='inline-block !w-auto max-w-[85%] max-h-[85%]'
                      sizes="(min-width: 45em) 400px, 100vw"
                    />
                  </div>
                )}
              </Link>
              <div className='text-center flex-1 flex flex-col pt-2.5'>
                <h4 className='text-sm md:text-15 m-0 !leading-normal min-h-14 font-semibold hover:underline'>
                    <Link to={variantUrl}>
                      {product.title}
                    </Link>
                  </h4>
                <small className='mb-j15 mt-0.5 text-sm md:text-15 !leading-normal text-brand flex flex-wrap justify-center gap-x-1 items-center'>
                  Starting At: <span className='font-semibold text-22 leading-none text-blue'> <Money data={formatGroupProductPrice(product)} /></span>
                </small>
                <div className='flex justify-center w-full md:max-w-40 mt-auto md:mx-auto max-[767px]:px-j5'>
                  <Link to={variantUrl} className='btn-secondary w-full px-2.5 py-2.5 mt-j30'>
                    Shop Now
                  </Link>
                </div>
              </div>
              <button type="button" onClick={handleWishlist} className='flex  group text-[28px] absolute right-4 top-4  text-gray-600 w-7 h-7 items-center justify-center '>
                {inWishlist ? <IoMdHeart className='fill-red-500'/> : <IoMdHeartEmpty />}
              </button>
              <div className='jerry-badge'>
                {/* 
                  <span className='special-offer'></span>
                  <span className='free-offer'></span>
                  <span className='bulk'></span>
                  <span className='top-sellers'></span>
                  <span className='new'></span>
                  <span className='best-value'></span>
                  <span className='has-new-items'></span>
                  <span className='out-of-stock'></span>
                */}
                {product?.metafield?.value === "On Sale" && (
                  <span className='sale'></span>
                )}
                {product?.metafield?.value === "On Super Sale" && (
                    <span className='super-sale'></span>
                )}                
                {product?.metafield?.value === "New Arrivals" && (
                  <span className='only-at-jerrys'></span> 
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className='w-full pb-11 relative border-b last:border-0 py-j30 px-5  border-grey-200'>
            <div
              className="flex relative py-5"
              key={product.id}
              prefetch="intent">
              {product.featuredImage && (
                <div className='w-j25 text-center'>
                  <Link to={variantUrl}>
                    <Image
                      alt={product.featuredImage.altText || product.title}
                      aspectRatio="1/1"
                      data={product.featuredImage}
                      loading={loading}
                      className='inline-block'
                      sizes="(min-width: 45em) 400px, 100vw"
                      style={{ width: '75%' }}
                    />

                    <div className='absolute top-0 left-0 w-11 gap-y-j5 flex flex-wrap'>
                      {product?.metafield?.value === "On Super Sale" && (
                        <img src="/image/super-sale_1.jpg" alt="Super Sale" />
                      )}
                      {product?.metafield?.value === "New Arrivals" && (
                        <img src="/image/only-at-jerrys_1.jpg" alt="On Sale" />
                      )}
                      {product?.metafield?.value === "On Sale" && (
                        <img src="/image/sale_1.jpg" alt="On Arrivals" />
                      )}
                    </div>
                  </Link>
                </div>
              )}
              <div className='w-j75'>
                <h4 className='text-22 font-semibold hover:underline'>{product.title}</h4>
                <small className='text-15 mb-2  text-brand flex justify-start gap-2 items-center'>
                  Starting At: <span className='font-semibold text-22 text-blue'> <Money data={formatGroupProductPrice(product)} /></span>
                </small>

                <p className="text-base">
                  {isExpanded || product.description.length <= 50
                    ? product.description
                    : `${product.description.substring(0, 370)}...`}
                  <span
                    className="text-brand pb-0 leading-0 inline-block relative before:content-[''] before:bg-brand-100 before:w-0 before:h-[1px] before:absolute before:left-0 before:bottom-0 hover:before:w-full hover:before:transition-all hover:before:duration-300 hover:before:ease-in-out cursor-pointer"
                    onClick={handleToggleDescription}
                  >
                    {isExpanded ? 'See Less' : 'See More'}
                  </span>
                </p>
                <div className='flex justify-start w-full items-center gap-x-4 mt-4'>
                  <Link to={variantUrl} className='btn-secondary-small  '>
                    Shop Now
                  </Link>
                  <button type="button" onClick={handleWishlist} className='flex group text-3xl border text-grey-300 border-grey-200 h-12 w-12 items-center justify-center'>
                    {inWishlist ? <IoMdHeart className='fill-red-500'/> : <IoMdHeartEmpty />}
                  </button>
                  <button onClick={openPopup} type="button" className='flex text-2xl border text-grey-300 hover:bg-grey-100 border-grey-200 h-12 w-12 items-center justify-center'><CiPlay1 /></button>
                  <Popup isOpen={isPopupOpen} closePopup={closePopup} content={content} iframeContent={iframeContent} />
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      <Modal
        show={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        width="w-[520px]"
        headerClasses=""
        footerClasses="hidden"
        headerContent={<span className='text-lg font-semibold'>Sign in required</span>}
      >
        <div className="w-full">
          <div className="flex border-b mb-6">
            <button type="button" onClick={() => setActiveTab('login')} className={`w-1/2 py-2 text-center font-semibold focus:outline-none ${activeTab==='login' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-pink-600'}`}>Login</button>
            <button type="button" onClick={() => setActiveTab('register')} className={`w-1/2 py-2 text-center font-semibold focus:outline-none ${activeTab==='register' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-pink-600'}`}>Register</button>
          </div>

          {activeTab === 'login' ? (
            <div>
              <h2 className="text-xl font-bold mb-2">Customer Login</h2>
              <p className="text-gray-600 mb-4">Already a customer? Sign in now for the best experience!</p>
              <form method="post" action="/account/login">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Email *</label>
                  <input type="email" name="customer[email]" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Password *</label>
                  <input type="password" name="customer[password]" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                <div className="flex items-center mb-4">
                  <input type="checkbox" id="remember-collection" className="mr-2" />
                  <label htmlFor="remember-collection" className="text-gray-600">Remember Me</label>
                </div>
                <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">Log In</button>
              </form>
              <div className="mt-4 text-sm">
                <Link to="/account/recover" prefetch="intent" className="text-pink-600 hover:underline">Click here & reset my password</Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">Create an Account</h2>
              <form method="post" action="/account">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-1">First Name *</label>
                    <input type="text" name="customer[first_name]" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Last Name *</label>
                    <input type="text" name="customer[last_name]" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Email *</label>
                  <input type="email" name="customer[email]" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Password *</label>
                  <input type="password" name="customer[password]" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Confirm Password *</label>
                  <input type="password" name="customer[password_confirmation]" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">Create an Account</button>
              </form>
              <p className="mt-4 text-sm">Already have an account?{' '}
                <button type="button" onClick={() => setActiveTab('login')} className="text-pink-600 hover:underline">Login</button>
              </p>
            </div>
          )}
        </div>
      </Modal>
      {successMsg && (
        <div className='fixed z-[10000] left-1/2 -translate-x-1/2 top-4 bg-green-600 text-white px-4 py-2 rounded shadow'>{successMsg}</div>
      )}
    </>

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
    description
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
    metafields(identifiers: [
      {namespace: "custom", key: "select_product_type"},
      {namespace: "custom", key: "child_products"}
    ]) {
      key
      value
    }
    childProductsRefs: metafield(namespace: "custom", key: "child_products") {
      value
      references(first: 50) {
        nodes { ... on Product { id } }
      }
    }
    paintsMediumsAttributes: metafield(namespace: "custom", key: "paints_mediums_multiselect_attribute") {
      value
      references(first: 100) {
        edges {
          node {
            ... on Metaobject {
              id
              fields { key value }
            }
          }
        }
      }
    }
    metafield(namespace: "custom", key: "more_ways_to_shop") {
      key
      value
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
      descriptionHtml
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
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
        references(first: 50) {
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
      featureBrands: metafield(namespace: "custom", key: "feature_brands") {
        references(first: 150) {
          edges {
            node {
              ... on Collection {
                id
                title
                handle
                image { url altText }
              }
            }
          }
        }
      }
      # fullWidthAds now sourced from metaobjects(type: "fullwidth_advertisement") in loader
      featuredAds: metafield(namespace: "custom", key: "featured_advertisement") {
        references(first: 10) {
          edges {
            node {
              ... on Metaobject {
                id
                handle
                fields {
                  key
                  value
                  reference {
                    ... on MediaImage { image { url altText } }
                  }
                }
              }
              ... on MediaImage { image { url altText } }
            }
          }
        }
        value
      }
      parentCategory: metafield(namespace: "custom", key: "parent_collection") {
        reference {
          ... on Collection {
            id
            title
            handle
            image { url altText }
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

const SIBLING_COLLECTIONS_QUERY = `#graphql
  query AllCollectionsForSiblings($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        image { url altText }
        parentCollection: metafield(namespace: "custom", key: "parent_collection") {
          reference { ... on Collection { id } }
        }
      }
    }
  }
`;

const METAOBJECTS_BY_IDS_QUERY = `#graphql
  query GetMetaobjectsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Metaobject {
        id
        fields { key value }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */