import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import 'swiper/css';

export function ProductTabVideo({ images, productVideos }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="product-image flex">No images available</div>;
  }

  useEffect(() => {
    Fancybox.bind('[data-fancybox]', {
      Toolbar: {
        display: [
          { id: "counter", position: "center" },
          "zoom",
          "fullscreen",
          "download",
          "thumbs",
          "close"
        ]
      },
      Thumbs: {
        autoStart: false
      }
    });

    return () => {
      Fancybox.destroy();
    };
  }, []);

  const handleThumbnailClick = (index) => {
    swiperRef.current?.slideTo(index);
  };

  return (
    <div className="product-image flex gap-10 relative">
      {/* Main image slider */}
      <div className="w-3/5 relative">
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={30}
          slidesPerView={1}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {productVideos.map((meta, i) => {
            const videoUrl = meta.fields.find(f => f.key === 'video_url')?.value;
            const productName = meta.fields.find(f => f.key === 'product_name')?.value;

            const imageField = meta.fields.find(f => f.key === 'thumbnail_image');
            const imageUrl = imageField?.reference?.image?.url;

            if (!videoUrl || !imageUrl) return null;

            return (
              <SwiperSlide key={meta.id || i}>
                <div className="h-[650px] overflow-hidden pl-20 pr-20 cursor-pointer">
                  <a
                    href={videoUrl}
                    data-fancybox="video-gallery"
                    data-caption={productName}
                    data-type="video"
                  >
                    <img
                      src={imageUrl}
                      alt={productName}
                      className="w-full h-full object-contain"
                    />
                  </a>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Thumbnails */}
      <div className="w-2/5 relative">
        <div className="flex flex-wrap gap-5">
          {productVideos.map((meta, i) => {
            const productName = meta.fields.find(f => f.key === 'product_name')?.value;
            const imageField = meta.fields.find(f => f.key === 'thumbnail_image');
            const imageUrl = imageField?.reference?.image?.url;

            if (!imageUrl) return null;

            return (
              <div
                key={meta.id || i}
                className={`flex justify-center w-32 border ${
                  activeIndex === i ? 'border-red-500' : 'border-transparent'
                } cursor-pointer`}
                onClick={() => swiperRef.current?.slideTo(i)}
              >
                <div className="relative">
                  <img
                    className="w-full h-32 object-cover"
                    src={imageUrl}
                    alt={productName}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
