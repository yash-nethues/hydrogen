import React, { useState } from 'react';
import { Image } from '@shopify/hydrogen'; // Assuming you are using Shopify's Image component

export function ProductTabs() {
  // Initialize state to track the active tab (default: Description)
  const [activeTab, setActiveTab] = useState('description');

  // Tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <h2 className='text-blue text-25' id="full-des"> Click Tabs For More</h2>
      {/* Tab Navigation */}
      <ul className='flex gap-2 mt-8'>
        <li
          className={`${
            activeTab === 'description' ? 'bg-blue text-white' : 'bg-white text-black'
          } text-19 font-bold pl-2 pr-10 py-2.5 border border-grey-200 inline-block relative cursor-pointer`}
          onClick={() => handleTabClick('description')}
        >
          + Description
        </li>
        <li
          className={`${
            activeTab === 'images' ? 'bg-blue text-white' : 'bg-white text-black'
          } text-19 font-bold pl-2 pr-10 py-2.5 border border-grey-200 inline-block relative cursor-pointer`}
          onClick={() => handleTabClick('images')}
        >
          + Images
        </li>
        <li
          className={`${
            activeTab === 'videos' ? 'bg-blue text-white' : 'bg-white text-black'
          } text-19 font-bold pl-2 pr-10 py-2.5 border border-grey-200 inline-block relative cursor-pointer`}
          onClick={() => handleTabClick('videos')}
        >
          + Videos
        </li>
        <li
          className={`${
            activeTab === 'reviews' ? 'bg-blue text-white' : 'bg-white text-black'
          } text-19 font-bold pl-2 pr-10 py-2.5 border border-grey-200 inline-block relative cursor-pointer`}
          onClick={() => handleTabClick('reviews')}
        >
          + Reviews
        </li>
        <li
          className={`${
            activeTab === 'msds' ? 'bg-blue text-white' : 'bg-white text-black'
          } text-19 font-bold pl-2 pr-10 py-2.5 border border-grey-200 inline-block relative cursor-pointer`}
          onClick={() => handleTabClick('msds')}
        >
          + Msds, Charts or Pdf
        </li>
      </ul>

      {/* Tab Content */}
      <div className='tab-main border border-grey-200 bg-white p-j30 mt-7'>
        {activeTab === 'description' && (
          <div className='des'>
            <h2 className='text-blue text-2xl font-semibold'>
              Golden Heavy Body Acrylic Paints - Professionally Loved Acrylics!
            </h2>
            <p>The original line of paints! GOLDEN Heavy Body acrylic paints are known to be exceptionally smooth with a thick, buttery consistency and contain the largest assortment of unique pure pigments in a 100% acrylic emulsion vehicle available to the professional artist. These colors offer excellent permanency and lightfastness. There are no fillers, extenders, opacifiers, toners, or dyes added.</p>
            <p>Each Heavy Body acrylic color is formulated differently depending on the nature of the pigment. Colors that tolerate higher pigment "loads" dry to a more opaque, matte finish. Colors that are more reactive and do not accept high pigment loading, dry to a glossy finish and tend to be more transparent. Heavy Body colors contain no additives, such as matting agents, therefore the gloss of each color will be different.</p>
            <p>C.P. Cadmiums = A grade that has a high concentration of cadmium and is considered the highest quality. The C.P. designation has been associated with both “Chemically Pure” and "Concentrated Pigment". Which translation you come across will often depend on the source and context. In terms of “(CC)”, it refers to “Concentrated Cadmium” and was adopted by the ASTM (American Society for Testing and Materials) as a way to differentiate higher quality cadmiums from lesser quality cadmium-barium pigments.</p>
            <p>All Heavy Body colors are thixotropic in nature This means that when brushing or stirring, the paints actually lose viscosity and feel much thinner. The faster the paints are moving, the thinner they feel. Returned to a state of rest, the paints gradually increase in thickness until they are again restored to their formulated viscosity.</p>
            <p>The Heavy Body line of acrylics contains no additional flattening agents, opacifiers or other solids that might interfere with the clarity of our pigments</p>
            <p><small><b>Please note:</b> The items on this page are available at the Best Lowest Price Possible and no further discounts can be applied.</small></p>

            <div className="mt-5 pt-5">
                <div className="text-brand underline">Restricted Shipping CARB States</div>
                <div className="bg-gray-100 px-4 py-3 mt-5 border text-blue font-medium text-lg">
                    <div className="close-warning hidden">X</div>
                    Certain items are subject to Shipping Restrictions due to regulations by certain states regarding VOCs. Please click on an item below to see more details.                            
                </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className='images'>
            <h2 className='text-blue text-2xl font-semibold'>Product Images</h2>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className='videos'>
            <h2 className='text-blue text-2xl font-semibold'>Product Videos</h2>
            <p>Here are some videos related to the product...</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className='reviews'>
            <h2 className='text-blue text-2xl font-semibold'>Customer Reviews</h2>
            <p>Read what our customers say about this product...</p>
          </div>
        )}

        {activeTab === 'msds' && (
          <div className='msds'>
            <h2 className='text-blue text-2xl font-semibold'>MSDS, Charts or PDFs</h2>
            <p>Here are additional documents available for download...</p>
          </div>
        )}
      </div>
    </div>
  );
}