import React from 'react';
import { Link } from '@remix-run/react';
import { useIsClient } from '~/hooks/useIsClient';

// Swiper is only used on the client. Importing here keeps route files SSR-safe.
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function SiblingCollections({ items = [], title, forceGrid = false }) {
  const isClient = useIsClient();
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const showSlider = isClient && safeItems.length > 6 && !forceGrid;

  if (!safeItems.length) return null;

  if (!showSlider) {
    return (
      <div className="custom-container">
        {title ? (
          <div className="text-center mb-5 md:mb-8">
            <h2 className="text-blue text-xl md:text-[30px] font-normal custom-h2 relative py-j5 md:py-5 mb-0 before:ml-j30 after:-ml-j30 after:bottom-1">
              {title}
            </h2>
          </div>
        ) : null}
        <div className="flex flex-wrap">
        {safeItems.map((node) => (
          <div key={node.id} className="w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5 text-center">
            <Link to={`/collections/${node.handle}`} className='text-center group'>
              <div className="flex flex-col justify-center p-5">
                <figure className=' w-full aspect-square flex items-center justify-center'>
                  {node.image?.url ? (
                    <img src={node.image.url} alt={node.title} className="max-w-[75%] max-h-[75%]" />
                  ) : (
                    <img src="/default-image.jpg" alt="Default" className="max-w-[75%] max-h-[75%]" />
                  )}
                </figure>
                <h6 className="text-blue mb-0 font-medium text-sm  jxl:text-lg group-hover:underline">{node.title}</h6>
              </div>
            </Link>
          </div>
        ))}
        </div>
      </div>
    );
  }

  // Slider for > 6 items
  return (
    <div className="custom-container">
      {title ? (
        <div className="text-center mb-5 md:mb-8">
          <h2 className="text-blue text-xl md:text-[30px] font-normal custom-h2 relative py-j5 md:py-5 mb-0 before:ml-j30 after:-ml-j30 after:bottom-1">{title}</h2>
        </div>
      ) : null}
      <Swiper
        className="group"
        modules={[Navigation, A11y]}
        spaceBetween={10}
        slidesPerView={5}
        navigation
        breakpoints={{
          0: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
      >
        {safeItems.map((node) => (
          <SwiperSlide key={node.id}>
            <div className="p-5 pb-1 text-center">
              <Link to={`/collections/${node.handle}`} className=''>
                <div className="flex flex-col justify-center p-5">
                  <figure className=' w-full aspect-square flex items-center justify-center'>
                    {node.image?.url ? (
                      <img src={node.image.url} alt={node.title} className="max-w-[75%] max-h-[75%]" />
                    ) : (
                      <img src="/default-image.jpg" alt="Default" className="max-w-[75%] max-h-[75%]" />
                    )}
                  </figure>
                  <h6 className="text-blue mb-0 font-medium text-sm jxl:text-lg group-hover:underline">{node.title}</h6>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}


