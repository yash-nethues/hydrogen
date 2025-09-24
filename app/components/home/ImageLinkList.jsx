import React from 'react';

export default function ImageLinkList({ ads }) {
  if (!ads || ads.length === 0) return null;
  return (
    <div className='container md:px-10 2xl:px-[60px] mt-j30 md:mt-[50px] jlg::mt-[65px]'>
      <div className="image-link-lists -mx-2.5 md:mx-0">
        <ul className="image-catList flex flex-col md:flex-row md:flex-wrap gap-y-2.5 md:gap-y-5 tb:gap-y-10 justify-center md:-mx-2.5 tb:-mx-5">          
          {ads?.filter(ad => ad.position_?.trim().toLowerCase() === 'bottom three ads block')
            .map((ad, index) => (
              <li key={index} className='md:w-1/3  md:px-2.5 tb:px-5'>
                <a href={ad.ads_link || '#'}>
                  <img src={ad.ads_image || '/image/placeholder.jpg'} alt={`Ad ${index + 1}`} className="cat-list w-full hidden md:block" />
                  <img src={ad.mobile_image || ad.ads_image || '/image/placeholder.jpg'} alt={`Ad ${index + 1}`} className="cat-list w-full md:hidden" />
                </a>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export { loadADSData } from './AdvertisementBanner';


