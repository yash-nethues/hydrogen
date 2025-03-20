import React from "react";
function CouponBanners({ bannerCoupons }) {
  return (
    <div className="container 2xl:container mt-5 mb-5">
      <ul className="flex border border-grey-200 justify-between">
        {bannerCoupons.references.edges.map(({ node }) => {
          const fields = Object.fromEntries(node.fields.map(({ key, value, reference }) => [
            key,
            reference?.image?.url || value // Extract image URL if available
          ]));

          return (
            <li key={node.id} className="w-1/3">
              <a href={fields.coupon_link}>
                <img
                  className="w-full"
                  src={fields.coupon_image || "/default-placeholder.jpg"} // Use extracted image URL
                  alt={fields.coupon_name}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CouponBanners;