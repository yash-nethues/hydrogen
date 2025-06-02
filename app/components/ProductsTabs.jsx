import React, { useState, useRef } from "react";
import ProductSlider from "~/components/ProductSlider";
import NewArrivalSilder from "~/components/NewArrivalSilder";
import ArtistCollection from "~/components/ArtistCollection";

const ProductsTabs = ({arrivals,professional,artist}) => {
const [activeTab, setActiveTab] = useState(0);
const tabs = ["New Arrivals", "Professional", "Artist Value"];
const tabRefs = useRef([]); 
console.log('arrivals',arrivals);
const tabContent = [
  {
    content: (
      <>
      <NewArrivalSilder arrivalsCollection={arrivals}/>
      </> 
    ),
  },
  {  
    content: (
      <>
      <ProductSlider professionalCollection={professional}/>
      </> 
    ),
  },
  {
    content: (
      <>
     <ArtistCollection artistCollection={artist}/>
      </> 
    ),
  },
];
  return (
    <div className="container 2xl:container pt-5">
    <div className="w-full mx-auto mt-10 justify-center">
      <div className="flex border-b border-gray-200 justify-center pb-5">
        <ul className="flex justify-center rounded-5xl border border-blue-900 mb-50 home-page-tab">
            {tabs.map((tab, index) => (
              <li key={index}>
                <button
                  ref={(el) => (tabRefs.current[index] = el)}
                  onClick={() => setActiveTab(index)} // set active tab to the clicked one
                  className={`flex-1 text-center py-3 uppercase px-8 text-s font-bold text-blue ${
                    activeTab === index
                      ? "bg-blue rounded-3xl text-white font-semibold"
                      : "hover:underline rounded-3xl "
                  }`}
                >
                  {tab}
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div className="tab-container">
             {tabContent[activeTab].content}
        </div>
    </div>
    </div>
  );
};
export default ProductsTabs;
