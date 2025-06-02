import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import 'swiper/css';

export function ProductTabImage({ images }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    Fancybox.bind('[data-fancybox="gallery"]', {
      Thumbs: {
        autoStart: false,
      },
    });

    return () => {
      Fancybox.destroy();
    };
  }, []);

  if (!images || images.length === 0) {
    return <div className="product-image flex">No images available</div>;
  }

  const handleThumbnailClick = (index) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  return (
    <div className="product-image flex gap-10">
      {/* Main image slider */}
      <div className="w-3/5 relative">
        <Swiper
          modules={[Navigation, A11y]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={30}
          slidesPerView={1}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {images.map((image, i) => (
            <SwiperSlide key={i}>
              <div className="h-[650px] overflow-hidden pl-20 pr-20">
                <a
                  href={image.url}
                  data-fancybox="gallery"
                  data-caption={image.altText || `Product Image ${i + 1}`}
                >
                  <img
                    src={image.url}
                    alt={image.altText || `Product Image ${i + 1}`}
                    className="w-full h-full object-contain"
                  />
                </a>
              </div>
              <div className='flex items-center justify-center'>Exceptionally smooth, rich, buttery consistency</div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnails */}
      <div className="w-2/5 relative">
        <div className="flex flex-wrap gap-5">
          {images.map((thumb, i) => (
            <div
              key={i}
              className={`flex justify-center w-32 border ${
                activeIndex === i ? 'border-red-500' : 'border-transparent'
              } cursor-pointer`}
              onClick={() => handleThumbnailClick(i)}
            >
              <div className="relative">
                <img
                  className="w-full h-32 object-cover"
                  src={thumb.url}
                  alt={thumb.altText || `Image ${i + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
