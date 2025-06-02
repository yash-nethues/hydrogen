import React, { useState } from 'react';
import { Image } from '@shopify/hydrogen'; // Assuming you are using Shopify's Image component
import {ProductTabImage} from '~/components/ProductTabImage';
import {ProductTabVideo} from '~/components/ProductTabVideo';
import ProductTabImageGallery from '~/components/ProductTabImageGallery';
import {ProductTabReviewSection} from '~/components/ProductTabReviewSection';

export function PdfLinks({ pdfObjects }) {
  if (!Array.isArray(pdfObjects) || pdfObjects.length === 0) return null;

  return (
    <ul>
      {pdfObjects.map((pdfObject, index) => {
        if (!pdfObject?.fields) return null;

        const fileField = pdfObject.fields.find(f => f.key === 'chart_pdf_file');
        const titleField = pdfObject.fields.find(f => f.key === 'chart_pdf_title');

        const fileUrl = fileField?.value || fileField?.reference?.url;
        const linkText = titleField?.value || fileField?.reference?.filename;

        if (!fileUrl) return null;

        return (
          <li key={index}>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {linkText}
            </a>
          </li>
        );
      })}
    </ul>
  );
}


export function ProductTabs({ images, productVideos, descriptionHtml, pdfObjects }) {
  // Initialize state to track the active tab (default: Description)
  const [activeTab, setActiveTab] = useState('');

  // Tab click handler
  const handleTabClick = (tab) => {
    //setActiveTab(tab);
    setActiveTab((prevTab) => (prevTab === tab ? null : tab));
  };

  const reviews = []

  return (
    <div>
      <p className='text-blue flex flex-wrap gap-2 items-center group-[.parrentProduct]/product:hidden'>
        <span>Item # 39153 Overview</span>
        <span className='group/tooltip relative'>| Brand <a href="" className='font-bold text-base-100 hover:underline underline-offset-2'><span className='text-[200%]/none h-5 inline-block align-text-top'>®</span> Golden Artist Colors  &gt;</a>
          <div className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  group-[&.active]/gridItem:scale-75 group-hover/gridItem:scale-75 origin-bottom">
            <span>Click to see all supplies & full collection for Brand: ® GOLDEN ARTIST COLORS</span>
            <span className=' block mt-1 text-[80%] text-brand '>(this will take you away from this page)</span>
          </div>
        </span>
        <div className='flex gap-2 items-center'>
          <span className='font-medium'>Product Notes:</span>
          <ul className="badgesFlags flex flex-wrap gap-1">
            <li className="alert-item w-7 group/tooltip rounded-sm tech-notes tech-specs">
              <svg width="18" height="18" aria-hidden="true">
                <use href="#icon-tech-notes" />
              </svg>
              <span className="sr-only">Tech Notes:</span>
              <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  group-[&.active]/gridItem:scale-75 group-hover/gridItem:scale-75 origin-bottom">Click This Icon To See Tech Notes</span>
            </li>
            <li className="alert-item w-7 group/tooltip rounded-sm lpp">
              <svg width="18" height="18" aria-hidden="true">
                <use href="#icon-lpp" />
              </svg>
              <span className="sr-only">LPP</span>
              <span className="tooltip opacity-0 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  group-[&.active]/gridItem:scale-75 group-hover/gridItem:scale-75 origin-bottom">Lowest Price - This item is already at the Best Lowest Price Possible and no further discounts or coupons can be applied.</span>
            </li>
          </ul>
        </div>
      </p>
      <h2 className='text-blue text-25 group-[.childProduct]/product:hidden' id="fd"> Click Tabs For More</h2>
      {/* Tab Navigation */}
      <ul className='flex gap-2 mt-8' role="tablist">
        <li role="tab" id="tab-description" className={`${
            activeTab === 'description' ? 'bg-blue text-white before:content-["-"] after:border-white after:rotate-45 after:top-1/3' : 'bg-white text-black before:content-["+"] hover:bg-blue hover:text-white after:-rotate-45 after:border-blue hover:after:border-white after:top-1/2 after:-translate-y-1/2'
          } fullDetails text-19 font-bold pl-8 pr-10 py-3 border border-grey-200 inline-block relative cursor-pointer transition-all before:absolute before:left-3 before:text-[120%] after:absolute  after:right-5 after:w-2.5 after:rounded-br-sm after:h-2.5 after:border-l-0 after:border-t-0 after:border-2 after:transition-all`}
          onClick={() => handleTabClick('description')}
        >
          Description
        </li>
        <li role="tab" className={`${
            activeTab === 'moreInfo' ? 'bg-blue text-white before:content-["-"] after:border-white after:rotate-45 after:top-1/3' : 'bg-white text-black before:content-["+"] hover:bg-blue hover:text-white after:-rotate-45 after:border-blue hover:after:border-white after:top-1/2 after:-translate-y-1/2'
          } text-19 font-bold pl-8 pr-10 group-[.parrentProduct]/product:hidden py-3 border border-grey-200 inline-block relative cursor-pointer transition-all before:absolute before:left-3 before:text-[120%] after:absolute  after:right-5 after:w-2.5 after:rounded-br-sm after:h-2.5 after:border-l-0 after:border-t-0 after:border-2 after:transition-all`}
          onClick={() => handleTabClick('moreInfo')}
        >
          More Information
        </li>
        <li role="tab" className={`${
            activeTab === 'images' ? 'bg-blue text-white before:content-["-"] after:border-white after:rotate-45 after:top-1/3' : 'bg-white text-black before:content-["+"] hover:bg-blue hover:text-white after:-rotate-45 after:border-blue hover:after:border-white after:top-1/2 after:-translate-y-1/2'
          } text-19 font-bold pl-8 pr-10 py-3 border border-grey-200 inline-block relative cursor-pointer transition-all before:absolute before:left-3 before:text-[120%] after:absolute  after:right-5 after:w-2.5 after:rounded-br-sm after:h-2.5 after:border-l-0 after:border-t-0 after:border-2 after:transition-all`}
          onClick={() => handleTabClick('images')}
        >
          Images
        </li>
        <li role="tab" className={`${
            activeTab === 'videos' ? 'bg-blue text-white before:content-["-"] after:border-white after:rotate-45 after:top-1/3' : 'bg-white text-black before:content-["+"] hover:bg-blue hover:text-white after:-rotate-45 after:border-blue hover:after:border-white after:top-1/2 after:-translate-y-1/2'
          } text-19 font-bold pl-8 pr-10 py-3 border border-grey-200 inline-block relative cursor-pointer transition-all before:absolute before:left-3 before:text-[120%] after:absolute  after:right-5 after:w-2.5 after:rounded-br-sm after:h-2.5 after:border-l-0 after:border-t-0 after:border-2 after:transition-all`}
          onClick={() => handleTabClick('videos')}
        >
          Videos
        </li>
        <li role="tab" className={`${
            activeTab === 'reviews' ? 'bg-blue text-white before:content-["-"] after:border-white after:rotate-45 after:top-1/3' : 'bg-white text-black before:content-["+"] hover:bg-blue hover:text-white after:-rotate-45 after:border-blue hover:after:border-white after:top-1/2 after:-translate-y-1/2'
          } text-19 font-bold pl-8 pr-10 py-3 border border-grey-200 inline-block relative cursor-pointer transition-all before:absolute before:left-3 before:text-[120%] after:absolute  after:right-5 after:w-2.5 after:rounded-br-sm after:h-2.5 after:border-l-0 after:border-t-0 after:border-2 after:transition-all`}
          onClick={() => handleTabClick('reviews')}
        >
          Reviews
        </li>
        <li role="tab" className={`${
            activeTab === 'msds' ? 'bg-blue text-white before:content-["-"] after:border-white after:rotate-45 after:top-1/3' : 'bg-white text-black before:content-["+"] hover:bg-blue hover:text-white after:-rotate-45 after:border-blue hover:after:border-white after:top-1/2 after:-translate-y-1/2'
          } text-19 font-bold pl-8 pr-10 py-3 border border-grey-200 inline-block relative cursor-pointer transition-all before:absolute before:left-3 before:text-[120%] after:absolute  after:right-5 after:w-2.5 after:rounded-br-sm after:h-2.5 after:border-l-0 after:border-t-0 after:border-2 after:transition-all`}
          onClick={() => handleTabClick('msds')}
        >
          Msds, Charts or Pdf
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab && (
        <div className='tab-main border border-grey-200 bg-white p-j30 mt-5 font-medium'>
          {activeTab === 'description' && (
            <div className='des' role="tabpanel" dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          )}
          {activeTab === 'moreInfo' && (
            <div className='moreInfo group-[.parrentProduct]/product:hidden' role="tabpanel">
              <table className="table-auto border border-grey-200 text-left text-gray-900">
                <tbody>
                  <tr className='even:bg-base-400'>
                    <th className='border border-grey-200 p-2.5 font-semibold'>Series</th>
                    <td className="border border-grey-200 p-2.5" data-th="Series">Artist</td>
                  </tr>
                  <tr className='even:bg-base-400'>
                    <th className='border border-grey-200 p-2.5 font-semibold'>Shape</th>
                    <td className="border border-grey-200 p-2.5" data-th="Shape">Round</td>
                  </tr>
                  <tr className='even:bg-base-400'>
                    <th className='border border-grey-200 p-2.5 font-semibold'>Hair Type	</th>
                    <td className="border border-grey-200 p-2.5" data-th="Hair Type	">Sable</td>
                  </tr>
                  <tr className='even:bg-base-400'>
                    <th className='border border-grey-200 p-2.5 font-semibold'>Ferrule</th>
                    <td className="border border-grey-200 p-2.5" data-th="Ferrule">Brass Plated</td>
                  </tr>
                  <tr className='even:bg-base-400'>
                    <th className='border border-grey-200 p-2.5 font-semibold'>Handle</th>
                    <td className="border border-grey-200 p-2.5" data-th="Handle">Short Handle</td>
                  </tr>
                  <tr className='even:bg-base-400'>
                    <th className='border border-grey-200 p-2.5 font-semibold'>Length</th>
                    <td className="border border-grey-200 p-2.5" data-th="Length">23/64"</td>
                  </tr>
                  <tr className='even:bg-base-400'>
                    <th className='border border-grey-200 p-2.5 font-semibold'>Width</th>
                    <td className="border border-grey-200 p-2.5" data-th="Width">3/64"</td>
                  </tr>
                  <tr className='even:bg-base-400'>
                    <th className='border border-grey-200 p-2.5 font-semibold'>Size</th>
                    <td className="border border-grey-200 p-2.5" data-th="Series"># 2x0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'images' && (
            <div className='images' role="tabpanel">
              <ProductTabImage images={images} />
            </div>
          )}

          {activeTab === 'videos' && (
            <div className='videos' role="tabpanel">
              <ProductTabVideo images={images} productVideos={productVideos} />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className='reviews' role="tabpanel">
              <ProductTabReviewSection reviews={reviews} />
            </div>
          )}

          {activeTab === 'msds' && (
            <div className='msds' role="tabpanel">
              <div className="w-1/2 m-[1%] p-2.5 bg-grey-100 border border-grey-200">
                <h5 className='bg-green text-white -translate-y-1/2 p-2.5 inline-block font-medium text-xl'>Downloads: MSDS/Size/Charts PDF's</h5>
                <ul className="">
                  <PdfLinks pdfObjects={pdfObjects} />
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}