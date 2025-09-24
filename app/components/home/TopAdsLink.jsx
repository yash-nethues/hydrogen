import React from 'react';

export default function TopAdsLink({ ads }) {
  if (!ads || ads.length === 0) return null;
  return (
    <div className="container mt-j30 md:mt-[50px] px-0 md:px-10 2xl:px-[60px]  -order-1 md:order-none">
      <ul className="flex">
        {ads
          ?.filter((ad) => ad.position_?.trim().toLowerCase() === 'top hero banner ad')
          .map((ad, index) => (
            <li key={index} data-position={ad.position_}>
              <a href={ad.ads_link || '#'}>
                {/* desktop image */}
                <img
                  src={ad.ads_image || '/image/placeholder.jpg'}
                  alt={`Ad ${index + 1}`}
                  className="cat-list inline-block hidden md:block"
                />
                {/* mobile image */}
                <img
                  src={ad.mobile_image || ad.ads_image || '/image/placeholder.jpg'}
                  alt={`Ad ${index + 1}`}
                  className="cat-list inline-block md:hidden"
                />
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}



