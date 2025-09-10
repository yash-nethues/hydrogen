import {Swiper, SwiperSlide} from 'swiper/react';
import {gql} from '@shopify/hydrogen';
import {Navigation, Pagination, Scrollbar, A11y} from 'swiper/modules';
import 'swiper/css';

export function RelatedProducts({products}) {
  if (!products?.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-blue text-34 font-normal mb-5">Related Products</h2>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={10}
        slidesPerView={4}
        navigation
        pagination={{clickable: true}}
        breakpoints={{
          1440: {slidesPerView: 4},
          1200: {slidesPerView: 4},
          992: {slidesPerView: 3},
          767: {slidesPerView: 2},
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <a href={`/products/${product.handle}`} className="block border p-4 text-center">
              <img
                src={product.featuredImage?.url}
                alt={product.featuredImage?.altText || product.title}
                className="w-auto max-w-full h-60 object-contain mx-auto"
              />
              <div className="mt-3">
                <h3 className="text-sm font-semibold">{product.title}</h3>
                <span className="text-brand font-bold block mt-1">
                  ${product.priceRange.minVariantPrice.amount}
                </span>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const RELATED_PRODUCTS_QUERY = `#graphql
  query RelatedProducts($query: String!, $excludeHandle: String!) {
    products(first: 10, query: $query) {
      nodes {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
          }
        }
      }
    }
  }
`;
