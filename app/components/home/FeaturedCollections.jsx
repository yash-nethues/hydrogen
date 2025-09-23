import React, { useEffect, useState, Suspense } from 'react';
import { Await, Link } from '@remix-run/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Image } from '@shopify/hydrogen';

export default function FeaturedCollections({ collections, title }) {
  const [isMobile, setIsMobile] = useState(false);
  if (!collections || collections.length === 0) return null;
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return (
    <div className='container mt-j30 md:mt-[50px] jlg::mt-[65px] md:px-10 2xl:px-[60px]'>
      <div className='-mx-5 md:mx-0'>
        <div className="text-center mb-j30 md:mb-[50px] px-2.5">
          <h2 className="text-blue text-xl md:text-26 jlg:text-3xl jxl:text-4xl font-semibold custom-h2 relative pb-6 mb-0">{title}</h2>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={collections}>
            {(response) => response ? (
              <>
                {isMobile ? (
                  <div className='px-5 relative'>
                    <Swiper modules={[Navigation, Pagination, Scrollbar, Autoplay, A11y]} spaceBetween={10} slidesPerView={3} slidesPerGroup={3} pagination={{ clickable: true }} scrollbar={{ draggable: true }} navigation={{ nextEl: '.c_arrow-right', prevEl: '.c_arrow-left' }} autoplay={{ delay: 3000, disableOnInteraction: false }} breakpoints={{ 460: { slidesPerView: 4, slidesPerGroup: 4 }, 650: { slidesPerView: 5, slidesPerGroup: 5 } }}>
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
            ) : null}
          </Await>
        </Suspense>        
      </div>
    </div>
  );
}

// Loader for homepage featured collections via metaobject 'homepage_feature_collection'
export async function loadHomepageFeaturedCollections({ context }, type = "homepage_feature_collection") {
  const GET_METAOBJECT_QUERY = `#graphql
    query GetMetaobject($type: String!) {
      metaobjects(type: $type, first: 20) {
        edges { node { fields { key value } } }
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
        image { url altText }
      }
    }
  `;
  try {
    const resp = await context.storefront.query(GET_METAOBJECT_QUERY, { variables: { type } });
    const edges = resp?.metaobjects?.edges || [];
    const gidSet = new Set();
    for (const edge of edges) {
      const fieldList = edge?.node?.fields || [];
      for (const f of fieldList) {
        const val = f?.value;
        if (!val || typeof val !== 'string') continue;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => {
              if (typeof p === 'string' && p.startsWith('gid://shopify/Collection/')) gidSet.add(p);
            });
            continue;
          }
        } catch {}
        if (val.startsWith('gid://shopify/Collection/')) gidSet.add(val);
      }
    }
    const rawIds = Array.from(gidSet);
    if (!Array.isArray(rawIds) || rawIds.length === 0) return [];
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


