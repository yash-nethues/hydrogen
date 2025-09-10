import React, { useState, useRef, Suspense } from "react";
import { Await } from "@remix-run/react";
import ProductSlider from "~/components/ProductSlider";
import NewArrivalSilder from "~/components/NewArrivalSilder";
import ArtistCollection from "~/components/ArtistCollection";

const ProductsTabs = ({products}) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["New Arrivals", "Professional", "Artist Value"];
  const tabRefs = useRef([]); 
  
  // Filter products based on jtab metafield values
  const filterProductsByJtab = (products, jtabValue) => {
    if (!products?.products?.nodes) return [];
    
    const filteredProducts = products.products.nodes.filter((product) => {
      if (!product.metafields || !Array.isArray(product.metafields)) {
        return false;
      }
      
      const jtabMetafield = product.metafields.find(metafield => 
        metafield && metafield.key === 'jtab'
      );
      
      if (!jtabMetafield) {
        return false;
      }
      
      // Handle JSON array format
      let jtabValues = [];
      try {
        // Try to parse as JSON array
        jtabValues = JSON.parse(jtabMetafield.value);
      } catch (e) {
        // If not JSON, treat as single string
        jtabValues = [jtabMetafield.value];
      }
      
      const matches = jtabValues.includes(jtabValue);
      return matches;
    });
    
    // Limit products to 12 for ProductsTabs
    return filteredProducts.slice(0, 12);
  };

  const tabContent = [
    {
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={products}>
            {(response) => {
              const filteredProducts = filterProductsByJtab(response, "New Arrivals");
              return <NewArrivalSilder filteredProducts={filteredProducts}/>;
            }}
          </Await>
        </Suspense>
      ),
    },
    {  
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={products}>
            {(response) => {
              const filteredProducts = filterProductsByJtab(response, "Professional");
              return <ProductSlider filteredProducts={filteredProducts}/>;
            }}
          </Await>
        </Suspense>
      ),
    },
    {
      content: (
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={products}>
            {(response) => {
              const filteredProducts = filterProductsByJtab(response, "Artist Value");
              return <ArtistCollection filteredProducts={filteredProducts}/>;
            }}
          </Await>
        </Suspense>
      ),
    },
  ];
  return (
    <div className="container mt-j30 md:mt-[50px] jlg:mt-[65px] md:px-10 2xl:px-[60px]">
    <div className="-mx-5 md:mx-auto justify-center ">
      <div className="flex flex-col items-center justify-center">
        <span className="md:hidden text-lg font-medium text-blue mb-2.5">SHOP More By</span>
        <ul className="flex justify-center border  rounded-sm md:rounded-full border-blue bg-blue md:bg-white home-page-tab">
            {tabs.map((tab, index) => (
              <li key={index}>
                <button
                  ref={(el) => (tabRefs.current[index] = el)}
                  onClick={() => setActiveTab(index)} // set active tab to the clicked one
                  role="tab"
                  className={`flex-1 text-center py-j5 px-[7px] md:py-j15 md:uppercase md:px-[25px] text-sm/[21px]  hover:underline jlg:font-bold md:text-blue ${
                    activeTab === index
                      ? "bg-white text-blue md:bg-blue md:rounded-full md:text-white"
                      : "text-white "
                  }`}
                >
                  {tab}
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div className="tab-container px-5 md:px-0 mt-j30 md:mt-[50px]">
        {tabContent[activeTab].content}
      </div>
    </div>
    </div>
  );
};
export default ProductsTabs;
