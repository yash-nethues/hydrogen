import React from 'react';

export default function ShopSupplies({ supplyList = [], title }) {
  if (!supplyList || supplyList.length === 0) return null;
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
                <img src={supply.icon?.url || supply.icon || "/image/placeholder.jpg"} width="100" height="90" alt={supply.title || "Supply Image"} />
                <h3 className="text-sm md:text-xl text-base-100 font-semibold py-2.5">{supply.title}</h3>
                <p className="text-xs md:text-sm">{supply.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Loader for footer supply data from metaobject 'before_footer_supplies'
export async function loadFooterSupplyData({ context }, type = "before_footer_supplies") {
  const GET_METAOBJECT_QUERY = `#graphql
    query GetMetaobject($type: String!) {
      metaobjects(type: $type, first: 20) { edges { node { fields { key value } } } }
    }
  `;
  const GET_MEDIA_IMAGES_QUERY = `#graphql
    query GetMediaImages($ids: [ID!]!) { nodes(ids: $ids) { ... on MediaImage { id image { url } } } }
  `;
  try {
    const GetMetaobject = await context.storefront.query(GET_METAOBJECT_QUERY, { variables: { type } });
    const allSupplyData = GetMetaobject?.metaobjects?.edges || [];
    const supplyData = allSupplyData.map(edge => edge.node.fields.reduce((acc, field) => { acc[field.key] = field.value; return acc; }, {}));
    const mediaImageIds = supplyData.map(supply => supply.icon).filter(icon => icon?.startsWith('gid://shopify/MediaImage/'));
    if (mediaImageIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, { variables: { ids: mediaImageIds } });
      const imageUrlMap = (mediaResponse?.nodes || []).reduce((acc, node) => { if (node?.id && node?.image?.url) { acc[node.id] = node.image.url; } return acc; }, {});
      supplyData.forEach(supply => {
        if (supply.icon?.startsWith('gid://shopify/MediaImage/')) {
          supply.icon = imageUrlMap[supply.icon] || "/image/placeholder.jpg";
        }
      });
    }
    return supplyData;
  } catch (error) {
    console.error('Error fetching supply data:', error);
    return [];
  }
}


