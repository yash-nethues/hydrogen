import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Fancybox } from '@fancyapps/ui';
import VideoTooltip from "./VideoTooltip";
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import 'swiper/css';

/**
 * @param {{
 *   images: { id: string, url: string, altText: string }[];
 *   productVideos?: any[];
 * }}
 */
export function ProductImage({ images, productVideos }) {
  if (!images || images.length === 0) {
    return <div className="product-image flex">No images available</div>;
  }

  useEffect(() => {
    return () => {
      Fancybox.destroy();
    };
  }, []);

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
  };

  const getVisibleCount = () => {
    const swiper = swiperRef.current;
    if (!swiper) return 4; // Fallback
    const currentBreakpoint = swiper.currentBreakpoint;
    const breakpointParams = swiper.params.breakpoints?.[currentBreakpoint];
    return breakpointParams?.slidesPerView || swiper.params.slidesPerView || 4;
  };

  const visibleCount = getVisibleCount();
  const remainingCount = images.length - (activeIndex + visibleCount);

  const handleOpenVideoGallery = () => {
    const galleryItems = productVideos.map((meta) => {
      const videoUrl = meta.fields.find((f) => f.key === 'video_url')?.value;
      const product_name = meta.fields.find((f) => f.key === 'product_name')?.value;
      const imageField = meta.fields.find((f) => f.key === 'thumbnail_image');
      const thumb = imageField?.reference?.image?.url;

      return {
        src: videoUrl,
        type: 'video',
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

  return (
    <div className="product-image w-[55%] flex-none flex flex-col tb:pt-10">
      {/* Thumbnail Slider */}
      <div className='flex gap-j30'>
        <div className="w-24 flex-none">
          <div className="mt-12 mb-10 relative">
            <Swiper
              direction="vertical"
              className="mySwiper h-[524px]"
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={10}
              navigation={{
                nextEl: '.pv_arrow-right',
                prevEl: '.pv_arrow-left',
              }}
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              slidesPerView={5}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              breakpoints={{
                1440: { slidesPerView: 5 },
                1200: { slidesPerView: 4 },
                992: { slidesPerView: 3 },
                767: { slidesPerView: 2 },
              }}
            >
              {images.map((thumb, i) => {
                const showRemaining = i === activeIndex + visibleCount - 1 && remainingCount > 0;

                if (showRemaining) {
                  return (
                    <SwiperSlide
                      className="border border-grey-200 hover:border-brand transition-all"
                      key={thumb.id}
                    >
                      <div className="relative">
                        <a
                          href={thumb.url}
                          onClick={(e) => {
                            e.preventDefault();
                            Fancybox.show(
                              images.map((img, index) => ({
                                src: img.url,
                                caption: img.altText || `Image ${index + 1}`,
                                type: 'image',
                              })),
                              {
                                startIndex: i,
                                Thumbs: { autoStart: false },
                              }
                            );
                          }}
                        >
                          <img
                            className="w-full aspect-square object-cover h-auto cursor-pointer"
                            src={thumb.url}
                            alt={thumb.altText || `Image ${i + 1}`}
                          />
                          <span className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50 text-white text-2xl font-semibold z-10">
                            + {remainingCount}
                          </span>
                        </a>
                      </div>
                    </SwiperSlide>
                  );
                }

                return (
                  <SwiperSlide
                    className="border border-grey-200 hover:border-brand transition-all"
                    key={thumb.id}
                  >
                    <div className="relative">
                      <img
                        className="w-full aspect-square object-cover h-auto cursor-pointer"
                        src={thumb.url}
                        alt={thumb.altText || `Image ${i + 1}`}
                        onClick={() => handleThumbnailClick(thumb)}
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <button className="pv_arrow-left arrow swiperv-button-prev w-6 h-6 before:w-4 before:h-4 -top-6 m-0  left-1/2 -translate-x-1/2 before:left-1/4 before:top-1/2 before:-translate-x-1/4 before:rotate-45 before:border-gray"></button>
            <button className="pv_arrow-right arrow swiperv-button-next w-6 h-6 before:w-4 before:h-4 top-auto -bottom-6 m-0 left-1/2 -translate-x-1/2 before:left-1/4 before:top-1/2 before:-translate-x-1/4 before:-mt-j5 before:rotate-45 before:border-gray"></button>
          </div>
          <img
            src="/image/product-video.webp"
            width="99"
            height="99"
            alt="video"
            onClick={handleOpenVideoGallery}
          />
        </div>

        {/* Main Image with Hover Zoom and Pan */}
        <div className="flex-auto relative">
          <div
            className="magnify-container group"
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - left) / width) * 100;
              const y = ((e.clientY - top) / height) * 100;

              const img = e.currentTarget.querySelector('img');
              if (img) {
                img.style.transformOrigin = `${x}% ${y}%`;
              }
            }}
            onMouseLeave={(e) => {
              const img = e.currentTarget.querySelector('img');
              if (img) {
                img.style.transformOrigin = `center center`;
              }
            }}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.altText || 'Product Image'}
              className="main-image group-hover:scale-150"
            />
          </div>
        </div>

        {/* Zoom + Pan Styling */}
        <style>{`
          .main-image {
            width: 100%;
            height: auto;
            transition: transform 0.3s ease-out, transform-origin 0.3s ease-out;
            will-change: transform;
            cursor: zoom-in;
          }

          .magnify-container {
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;
          }

          .group-hover\\:scale-150:hover {
            transform: scale(1.5);
          }
        `}</style>
      </div>
      <div className='width-[calc(100% - 270px)] mt-5 relative'>
        <h5 className='text-blue font-semibold'>Short Highlight Videos <span>(Tap To Watch)</span></h5>
        <ul className='width-[calc(100% + 260px)] flex flex-wrap gap-y-j5'>
          <VideoTooltip src="/videos/SO1-Tusc-Pine-Oils-How%20Its-Made-UnbelievableBlendability-%20Luminosity_1.mp4" title="Show Demo Video" />
        </ul>
      </div>
    </div>
  );
}
