import React, { useState } from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

/**
 * @param {{
 *   images: { id: string, url: string, altText: string }[];
 * }}
 */
export function ProductImage({ images }) {
  if (!images || images.length === 0) {
    return <div className="product-image flex">No images available</div>;
  }

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [remainingCount, setRemainingCount] = useState(images.length - 4);

  // Handle thumbnail click
  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
  };

  // Handle Swiper next/prev click
  const handleNext = () => {
    setRemainingCount(remainingCount - 1);
  };

  const handlePrev = () => {
    setRemainingCount(remainingCount + 1);
  };

  return (
    <div className="product-image flex gap-10">
      {/* Thumbnail Slider */}
      <div className="w-1/5 relative">
        <Swiper
          direction="vertical"
          className="mySwiper mt-5 h-[610px]"
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          spaceBetween={10}
          navigation={{
            nextEl: '.pv_arrow-right',
            prevEl: '.pv_arrow-left',
          }}
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
          slidesPerView={4}
          breakpoints={{
            1440: { slidesPerView: 4 },
            1200: { slidesPerView: 4 },
            992: { slidesPerView: 3 },
            767: { slidesPerView: 2 },
          }}
        >
          {images.map((thumb, i) => (
            <SwiperSlide key={thumb.id}>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    className="w-auto max-w-full h-auto cursor-pointer"
                    src={thumb.url}
                    alt={thumb.altText || `Image ${i + 1}`}
                    onClick={() => handleThumbnailClick(thumb)}
                  />
                  {/* Show remaining count only on 4th thumbnail */}
                  {i === 3 && remainingCount > 0 && (
                    <span className="absolute top-0 right-0 bg-black text-white text-xs p-1 rounded-full">
                      {remainingCount} Left
                    </span>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button className="pv_arrow-left arrow swiperv-button-prev" onClick={handlePrev}></button>
        <button className="pv_arrow-right arrow swiperv-button-next" onClick={handleNext}></button>
      </div>

      {/* Main Image with Magnify Effect on Hover */}
      <div className="w-4/5 relative">
        <div className="magnify-container">
          <img
            src={selectedImage.url}
            alt={selectedImage.altText || 'Product Image'}
            className="main-image"
          />
        </div>
      </div>

      <style jsx>{`
        .main-image {
          width: 100%;
          height: auto;
          transition: transform 0.3s ease-out;
          cursor: zoom-in;
        }

        .magnify-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Magnify effect */
        .magnify-container:hover .main-image {
          transform: scale(1.5); /* Zoom in */
          transform-origin: center center; /* Zoom from the center */
        }

        /* Adding zoomed-in view on hover */
        .magnify-container:hover {
          background-image: url(${selectedImage.url});
          background-size: 200%; /* Enlarge the background */
          background-position: center;
          position: relative;
        }

        /* Add overlay effect */
        .magnify-container:hover:after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}