import React from 'react';

export default function AdvertisementBanner({ ads }) {
  if (!ads || ads.length === 0) return null;
  return (
    <div className='container md:px-10 2xl:px-[60px] mt-j30 md:mt-[50px] jlg::mt-[65px]'>
      {ads
        ?.filter(ad => ad.position_?.trim().toLowerCase() === 'middle hero banner ad')
        .map((ad, index) => (
          <div key={index} className='-mx-5 md:mx-0'>
            <div className="text-center mb-j30 md:mb-[51px] px-2.5 md:hidden">
              <h2 className="text-blue text-xl md:text-26 jlg:text-3xl jxl:text-4xl font-semibold custom-h2 relative pb-6 mb-0">
                <span>Finely Crafted Supplies For Artists</span>
              </h2>
            </div>
            <div className="advertisement-banner">              
              <a data-discover="true" href={ad.ads_link || '#'}>
                <img src={ad.ads_image || '/image/placeholder.jpg'} alt={`Ad ${index + 1}`} className="advertisement hidden md:block w-full" />
                <img src={ad.mobile_image || ad.ads_image || '/image/placeholder.jpg'} alt={`Ad ${index + 1}`} className="advertisement md:hidden w-full" />
              </a>
            </div>
          </div>
        ))}
    </div>
  );
}

// Loader to fetch ads data
export async function loadADSData({ context }, type = "home_ads_with_link") {
  const GET_METAOBJECT_QUERY = `#graphql
    query GetMetaobject($type: String!) { metaobjects(type: $type, first: 20) { edges { node { fields { key value } } } } }
  `;
  const GET_MEDIA_IMAGES_QUERY = `#graphql
    query GetMediaImages($ids: [ID!]!) { nodes(ids: $ids) { ... on MediaImage { id image { url } } } }
  `;
  try {
    const GetMetaobject = await context.storefront.query(GET_METAOBJECT_QUERY, { variables: { type } });
    const adsAllData = GetMetaobject?.metaobjects?.edges || [];
    const adsData = adsAllData.map(edge => edge.node.fields.reduce((acc, field) => { acc[field.key] = field.value; return acc; }, {}));
    const mediaImageIds = [];
    adsData.forEach((ad) => {
      if (ad.ads_image?.startsWith('gid://shopify/MediaImage/')) mediaImageIds.push(ad.ads_image);
      if (ad.mobile_image?.startsWith('gid://shopify/MediaImage/')) mediaImageIds.push(ad.mobile_image);
    });
    if (mediaImageIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, { variables: { ids: mediaImageIds } });
      const imageUrlMap = (mediaResponse.nodes || []).reduce((acc, node) => { if (node?.image?.url) acc[node.id] = node.image.url; return acc; }, {});
      adsData.forEach(ad => {
        if (ad.ads_image?.startsWith('gid://shopify/MediaImage/')) ad.ads_image = imageUrlMap[ad.ads_image] || "/image/placeholder.jpg";
        if (ad.mobile_image?.startsWith('gid://shopify/MediaImage/')) ad.mobile_image = imageUrlMap[ad.mobile_image] || ad.ads_image || "/image/placeholder.jpg";
      });
    }
    return adsData;
  } catch (error) {
    console.error('Error fetching ads data:', error);
    return [];
  }
}


