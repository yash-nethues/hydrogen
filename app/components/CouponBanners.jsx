import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import "swiper/css";

function CouponBanners({ bannerCoupons }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setIsMobile(media.matches);
    const handler = (e) => setIsMobile(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);
  const coupons =
    bannerCoupons?.references?.edges?.map(({ node }) => {
      const fields = Object.fromEntries(
        node.fields.map(({ key, value, reference }) => [
          key,
          reference?.image?.url || value,
        ])
      );

      return {
        id: node.id,
        name: fields.coupon_name,
        link: fields.coupon_link,
        image: fields.coupon_image || "/default-placeholder.jpg",
      };
    }) || [];
  
  if (!coupons.length) return null;
  if (isMobile) {
    return (
      <div className="custom-container -order-1">
        <div className="-mx-5 px-5 relative">
          <Swiper 
            modules={[Navigation, Pagination, Scrollbar, Autoplay, A11y]}
            slidesPerView={2}
            centeredSlides={false}
            spaceBetween={10}
            loop={true}
            navigation={{ nextEl: ".cb_arrow-right", prevEl: ".cb_arrow-left" }}
            autoplay={{
               delay: 2500, 
               disableOnInteraction: false,
              }}
            >
            {coupons.map((c) => (
              <SwiperSlide key={c.id}>
                <a href={c.link}>
                  <img className="w-full" src={c.image} alt={c.name} />
                </a>
              </SwiperSlide>
            ))}
          </Swiper>          
          <button aria-label="Previous" className="cb_arrow-left arrow swiper-button-prev left-1 before:-mt-0.5"></button>
          <button aria-label="Next" className="cb_arrow-right arrow swiper-button-next right-1 before:-mt-0.5 before:-mr-j5"></button>
        </div>
      </div>
    );
  }
  return (
    <div className="custom-container md:my-2.5 jlg:my-5">
      <ul className=" flex md:border md:border-grey-200 justify-between">
        {coupons.map((c) => (
          <li key={c.id} className="w-1/3">
            <a href={c.link}>
              <img className="w-full" src={c.image} alt={c.name} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CouponBanners;