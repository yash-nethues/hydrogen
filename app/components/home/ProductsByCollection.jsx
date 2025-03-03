import React from "react";
import { useQuery, gql } from "@apollo/client";

const GET_PRODUCTS_BY_COLLECTION = gql`
  query getProductsByCollection($collectionId: ID!) {
    collection(id: $collectionId) {
      title
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

const ProductsByCollection = ({ collectionId }) => {
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_COLLECTION, {
    variables: { collectionId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching products.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.collection.products.edges.map(({ node }) => (
        <div key={node.id} className="swiper-slide h-auto">
          <div className="flex flex-col min-h-full">
            <a href={`/products/${node.handle}`} className="grow-0">
              <div className="w-full aspect-square">
                <img
                  src={node.featuredImage?.url}
                  alt={node.featuredImage?.altText || node.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </a>
            <div className="flex-grow flex flex-col p-2">
              <div className="text-brand pb-2.5">
                <span className="text-xs md:text-sm lg:text-15 leading-none">
                  Now Only From
                </span>
                <p className="block font-bold text-lg md:text-xl lg:text-2xl leading-none">
                  <span>
                    ${node.priceRange.minVariantPrice.amount}
                  </span>
                  <span> - ${node.priceRange.maxVariantPrice.amount}</span>
                </p>
              </div>
              <a className="text-xs text-base-200 min-h-10" href={`/products/${node.handle}`}>
                {node.title}
              </a>
              <div className="mt-auto">
                <button className="btn-primary">Shop Now</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsByCollection;
