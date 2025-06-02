import React, { useState } from 'react';

const ProductTabImageGallery = ({ images, initialCount = 10 }) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {images.slice(0, visibleCount).map((img, i) => (
          <img key={i} src={img.url} alt={img.altText || `Image ${i}`} className="w-auto h-200" />
        ))}
      </div>
      {visibleCount < images.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 8)}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Show more photos
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductTabImageGallery;
