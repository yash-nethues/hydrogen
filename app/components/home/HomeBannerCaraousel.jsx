import React, { useEffect } from 'react';

export default function HomeBannerCaraousel({ banner, type }) {
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
                      <img key={`m-${index}`} src={b.mobileImage || b.image} alt={`Slide ${index + 1}`} className="w-full md:hidden" />
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

// Loader for home banner data
export async function loadBannerData({ context }, type = "home_banner") {
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
    const edges = GetMetaobject?.metaobjects?.edges || [];
    const mediaIds = [];
    const items = edges.map((edge) => {
      const fields = (edge?.node?.fields || []).reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
      const banner_image = fields.banner_image || '';
      const mobile_image = fields.mobile_image || '';
      if (typeof banner_image === 'string' && banner_image.startsWith('gid://shopify/MediaImage/')) mediaIds.push(banner_image);
      if (typeof mobile_image === 'string' && mobile_image.startsWith('gid://shopify/MediaImage/')) mediaIds.push(mobile_image);
      const fromRaw = fields.from || fields.from || '';
      const toRaw = fields.to || fields.to || '';
      const parseTs = (v) => { if (!v || typeof v !== 'string') return null; const ts = Date.parse(v); return Number.isFinite(ts) ? ts : null; };
      return {
        raw_image: banner_image,
        raw_mobile_image: mobile_image,
        banner_heading: fields.banner_heading || '',
        banner_content: fields.banner_content || '',
        banner_order: parseInt(fields.banner_order) || 0,
        fromTs: parseTs(fromRaw),
        toTs: parseTs(toRaw),
        button: fields.button_text || fields.banner_button || fields.banner_button_text || '',
        button_link: fields.button_link || fields.banner_button_link || fields.banner_link || '#',
      };
    });
    let imageUrlMap = {};
    if (mediaIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, { variables: { ids: mediaIds } });
      imageUrlMap = (mediaResponse?.nodes || []).reduce((acc, node) => { if (node?.id && node?.image?.url) acc[node.id] = node.image.url; return acc; }, {});
    }
    const nowTs = Date.now();
    const timeFiltered = items.filter((it) => { if (it.fromTs && nowTs < it.fromTs) return false; if (it.toTs && nowTs > it.toTs) return false; return true; });
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
    return { bannerItems: [] };
  }
}


