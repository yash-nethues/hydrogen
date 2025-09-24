import React from 'react';

export default function CategoryLinkContent({ bannerWithContentImage }) {
  if (!Array.isArray(bannerWithContentImage) || bannerWithContentImage.length === 0) return null;
  return (
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
  );
}

// Loader for banner with content image blocks
export async function bannerWithContentImage({ context }, type = "banner_with_content_image") {
  const GET_METAOBJECT_QUERY = `#graphql
    query GetMetaobject($type: String!) {
      metaobjects(type: $type, first: 20) {
        edges { node { fields { key value } } }
      }
    }
  `;
  const GET_MEDIA_IMAGES_QUERY = `#graphql
    query GetMediaImages($ids: [ID!]!) { nodes(ids: $ids) { ... on MediaImage { id image { url } } } }
  `;
  try {
    const GetMetaobject = await context.storefront.query(GET_METAOBJECT_QUERY, { variables: { type } });
    const allData = GetMetaobject?.metaobjects?.edges || [];
    const items = allData.map(edge => edge.node.fields.reduce((acc, field) => { acc[field.key] = field.value; return acc; }, {}));
    const mediaImageIds = items.map(x => x.image).filter(id => id?.startsWith('gid://shopify/MediaImage/'));
    if (mediaImageIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, { variables: { ids: mediaImageIds } });
      const imageUrlMap = (mediaResponse?.nodes || []).reduce((acc, node) => { if (node?.id && node?.image?.url) acc[node.id] = node.image.url; return acc; }, {});
      items.forEach(item => {
        if (item.image?.startsWith('gid://shopify/MediaImage/')) {
          item.image = imageUrlMap[item.image] || '/image/placeholder.jpg';
        }
      });
    }
    return items;
  } catch (error) {
    console.error('bannerWithContentImage error', error);
    return [];
  }
}


