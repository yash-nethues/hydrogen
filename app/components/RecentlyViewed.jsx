import React, {useEffect, useState} from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Money } from '@shopify/hydrogen';
import 'swiper/css';
import { useIsClient } from "~/hooks/useIsClient";

function RecentlyViewed({currentProduct}) {
  const [items, setItems] = useState([]);
  const isClient = useIsClient();

  // On mount, update localStorage with the current product and load the list
  useEffect(() => {
    try {
      const key = 'recently_viewed_products';
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      let list = [];
      if (raw) {
        try { list = JSON.parse(raw); } catch { list = []; }
      }

      // Normalize: expect items as {id, handle, title, imageUrl, price, isGroupProduct, groupPriceRange}
      const normalized = Array.isArray(list) ? list.filter(p => p && p.id && p.handle) : [];

      // Add or move current product to top in storage, but do not display it on the current page
      if (currentProduct && currentProduct.id && currentProduct.handle) {
        const filtered = normalized.filter(p => p.id !== currentProduct.id);
        const next = [{
          id: currentProduct.id,
          handle: currentProduct.handle,
          title: currentProduct.title || '',
          imageUrl: currentProduct.imageUrl || '',
          price: currentProduct.price || null,
          isGroupProduct: !!currentProduct.isGroupProduct,
          groupPriceRange: currentProduct.groupPriceRange || null,
        }, ...filtered].slice(0, 30); // cap to 30
        window.localStorage.setItem(key, JSON.stringify(next));
        // Exclude the current product from the rendered list
        setItems(filtered);
      } else {
        setItems(normalized);
      }
    } catch {
      // ignore storage errors
    }
  }, [currentProduct?.id]);

  if (!isClient || !items || items.length === 0) return null;

  const isSlider = items.length >= 6;

  const renderPrice = (p) => {
    if (p.isGroupProduct && p.groupPriceRange && typeof p.groupPriceRange.min === 'number' && typeof p.groupPriceRange.max === 'number') {
      const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: p.groupPriceRange.currencyCode || 'USD' });
      const min = fmt.format(p.groupPriceRange.min);
      const max = fmt.format(p.groupPriceRange.max);
      return (
        <>
          <span className="text-brand pl-4 font-bold">{min}</span>
          {p.groupPriceRange.max !== p.groupPriceRange.min && (
            <span className="text-brand font-bold"> - {max}</span>
          )}
        </>
      );
    }
    return <span className="text-brand pl-4 font-bold">{p.price ? <Money data={p.price} /> : null}</span>;
  };

  return (
    <div className="recently-viewed w-full relative mt-12">
      <h2 className='text-blue text-34 font-normal mb-j15'>Recently Viewed</h2>
      <div className='pr-10 pl-8'>
        {!isSlider && (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((p) => (
              <div key={p.id} className="flex flex-col min-h-full bg-white border border-grey-200 rounded-sm text-center">
                <a href={`/products/${p.handle}`}>
                  <div className="w-full aspect-square">
                    {p.imageUrl ? (
                      <img className="w-full h-full object-cover" src={p.imageUrl} alt={p.title} />
                    ) : (
                      <div className="text-xs text-gray-500 p-4 text-center">No Image</div>
                    )}
                  </div>
                </a>
                <div className='block'>
                    <span className='text-sm no-underline hover:underline'>
                        <a className="product-item-link hover:underline" href={`/products/${p.handle}`}>
                            {p.title}
                        </a>
                    </span>
                    <p className="minimal-price">
                        <span className="text-brand text-sm mt-2 block">Starting At:</span>
                        {renderPrice(p)}
                    </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSlider && (
          <>
            <Swiper
              className="mySwiper mt-5"
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={10}
              navigation={{ nextEl: '.pf_arrow-right', prevEl: '.pf_arrow-left' }}
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              slidesPerView={5}
              breakpoints={{
                1440: { slidesPerView: 5 },
                1200: { slidesPerView: 5 },
                992:  { slidesPerView: 3 },
                767:  { slidesPerView: 2 },
              }}
            >
              {items.map((p) => (
                <SwiperSlide key={p.id}>
                  <div className="flex flex-col min-h-full bg-white border border-grey-200 rounded-sm text-center">
                    <a href={`/products/${p.handle}`}>
                      <div className="w-full aspect-square">
                        {p.imageUrl ? (
                          <img className="w-full h-full object-cover" src={p.imageUrl} alt={p.title} />
                        ) : (
                          <div className="text-xs text-gray-500 p-4 text-center">No Image</div>
                        )}
                      </div>
                    </a>
                    <div className='block'>
                        <span className='text-sm no-underline hover:underline'>
                            <a className="product-item-link hover:underline" href={`/products/${p.handle}`}>
                                {p.title}
                            </a>
                        </span>
                        <p className="minimal-price">
                            <span className="text-brand text-sm mt-2 block">Starting At:</span>
                            {renderPrice(p)}
                        </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <button className="pf_arrow-left arrow swiper-button-prev"></button>
            <button className="pf_arrow-right arrow swiper-button-next mr-0 right-2"></button>
          </>
        )}
      </div>
    </div>
  );
}

export default RecentlyViewed;

export { RecentlyViewed };


