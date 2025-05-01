import React, { useState } from 'react';
import {ProductTabs} from '~/components/ProductTabs';

export function ProductVariations() {
  // State management for filter visibility and grid/list view toggle
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isGridView, setIsGridView] = useState(true); // Default to Grid view

  // Toggle filter section visibility
  const toggleFilter = () => {
    setFilterVisible((prev) => !prev);
  };

  // Switch to list view
  const switchToListView = () => {
    setIsGridView(false);
  };

  // Switch to grid view
  const switchToGridView = () => {
    setIsGridView(true);
  };

  return (
    <div className="bg-gray-100 border-t border-t-grey-200 pt-5 pb-8 mt-20">
      <div className="container 2xl:container">
        {/* Product Tabs */}
        <ProductTabs />

        {/* View toggle buttons */}
        <div className="flex mt-10 mb-0 gap-3" id="shop-all">
          <div> 
            <span className="uppercase">Grid</span>
            <button
              onClick={switchToGridView}
              className="text-sm text-grey w-j70 h-j70 flex justify-center items-center border border-grey-200 hover:bg-green hover:text-white font-semibold hover:border-green bg-gray bg-white"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 17 17"
                height="1.5em"
                width="1.5em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g></g>
                <path d="M0 0h7v7h-7v-7zM9 0v7h7v-7h-7zM0 16h7v-7h-7v7zM9 16h7v-7h-7v7z"></path>
              </svg>
            </button>
          </div>
          <div>
            <span className="uppercase">List</span>
            <button
              onClick={switchToListView}
              className="text-base text-grey w-j70 h-j70 font-semibold flex justify-center items-center border border-grey-200 hover:bg-green hover:text-white font-semibold hover:border-green bg-white"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="1.5em"
                width="1.5em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M80 368H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm0-320H16A16 16 0 0 0 0 64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 160H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm416 176H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path>
              </svg>
            </button>
          </div>
        

        {/* Filter Section */}
        <div className="flex gap-3 w-full">
          <div className="w-full">
            <span className="uppercase">FILTERS</span>
            <div className="flex gap-3">
              <div
                className="toolbar-title bg-white border w-full block p-5 flex justify-between filterBtnSec"
                onClick={toggleFilter}
              >
                <span className="text-xl font-semibold text-brand">- Filter By</span>
                <span className="arrow w-5 h-5 cursor-pointer block relative"></span>
              </div>

              <button type="button" title="Add To Cart" className="bg-green outline-none w-36 text-white">
                <span>Add To Cart</span>
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Conditionally render the filter section */}
        {isFilterVisible && (
          <div className='p-8 bg-white border border-t-0 filterDataSec'>
          <div className='border-b border-grey-200 pb-5'>
            <label>Color</label>
            <div className='flex flex-wrap items-center mt-4 gap-6'>
            <ul className='flex gap-4'>
              <li>
                <label>
                    <input className='bg-black w-5 h-5 className=""' type="checkbox"  value="black" /> Black
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Blue
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Brown
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Fluorescent
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Green
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Grey
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Iridescent
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Red 
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Violet
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> White
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Yellow
                </label>
              </li>
            </ul>
                <button className='border border-brand-100 px-6 py-1 text-16 font-medium text-brand-100'>Clear All</button>
            </div>
          </div>
  
          <div className='pt-5'>
            <label>Format</label>
            <div className='flex flex-wrap items-center mt-4 gap-6'>
            <ul className='flex gap-4'>
              <li>
                <label>
                    <input className='bg-black w-5 h-5 color-checkbox' type="checkbox"  value="black" /> Bucket
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Jar
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Tub
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" className="color-checkbox" value="black" /> Tube
                </label>
              </li>
            </ul>
            <button className='border border-brand-100 px-6 py-1 text-16 font-medium text-brand-100'>Clear All</button>
            </div>
          </div>
        </div>
        )}

        {/* Product Grid/List Views */}
        <div className=" variationsProList">
          {isGridView ? (
            <div className="variationsGridView">
              Grid Data View
            </div>
          ) : (
            <div className="variationsListView">
              <table className="bg-white mt-10 w-full">
                <thead className="bg-blue text-white sticky top-50">
                    <tr className="">
                    <th className="border-r border-white p-3 text-left w-21">
                        <span className="text-base !text-white uppercase" >Image</span><p className='text-11 font-normal'>(Click Image)</p>
                    </th>
                    <th className="text-left p-3">
                        <span className="">Item # </span><p  className='text-11 font-normal'>(Click for Details)</p>
                    </th>
                    <th className="text-left">
                        <span className="uppercase">Name</span>
                    </th>
                    <th className="">
                        <span className="uppercase">Color</span>
                    </th>
                    <th className="">
                        <span className="uppercase">Size</span>
                        <div className="hidden">
                        <input className="" type="checkbox" name="size_unit" />
                        <span className=""></span>
                        </div>																	                  	
                    </th>
                    <th className="">
                        <span className="uppercase">Format</span>
                    </th>
                    <th className="">
                        <span className="uppercase">List</span>
                        <span className=""></span>
                        <span className="hidden"> <span>List Price:</span> (Also known as Manufacturer's Suggested Retail Price, we do not set or inflate the MSRP. We report it. For our Jerry's manufactured brand products, we establish MSRP based on those of third-party vendors whose products most closely resemble ours in quality and size.)</span>
                    </th>
                    <th className="">
                        <span className="uppercase">Reg.</span>
                    </th>   
                    <th className="">
                        <span className="uppercase">Status</span>
                    </th>
                    <th className="w-60">
                        <span className="attribute-head uppercase">Add qty to cart</span>
                    </th>
                    </tr>
                </thead>
                <tbody className="border border-gray-100">
                    <tr className="">
                    <td className="" rowspan="2">
                        
                        <div className="relative">
                        <div className="relative">
                            <img src="https://cdn.shopify.com/s/files/1/0908/2657/2073/files/handbags.jpg?v=1742899894&width=100&height=100&crop=center" alt="GOLDEN Heavy Body Acrylics - Transparent Brown Iron Oxide, 2oz Tube" className="" />  
                            <span className='absolute bottom-0 left-0 bg-brand-100 w-5 h-5 text-white text-center cursor-pointer'>+</span>
                        </div>
                        <div className="absolute bg-white w-j900 z-10  top-0 border border-gray-100 hidden">
                            <div className="flex gap-2">
                                <div className="w-2/4">
                                    <ul>
                                    <li><img className="w-auto max-w-full h-auto" src="../image/mezzo-artist-organizer-storage-racks.jpg"  /> </li>
                                    </ul>
                                </div>
                            <div className="w-2/4">
                            <div className="p-5 relative bg-gray-100 h-full">
                            <span className='absolute top-0 right-0 bg-brand-100 text-sm flex items-center justify-center w-8 h-8 text-white text-center cursor-pointer'>X</span>
                            <span className="">
                                <h2 className='text-2xl'>GOLDEN Heavy Body Acrylics - Alizarin Crimson Hue, 2oz Tube</h2>
                                <div className="grid-item-status">
                                <div className="product-item-status">
                                <span className="in-stock">In Stock</span>
                                </div>
                                <div cclassName="product-item-badges">
                                    <span className="prod-alert-label">Product Badge:</span>
                                    <ul className="badgesFlags">
                                        <li className="alert-item lpp">
                                            <span className="sr-only">LPP</span>
                                            <span className="tooltip long">Lowest Price - This item is already at the Best Lowest Price Possible and no further discounts or coupons can be applied.</span>
                                        </li>
                                        <li className="alert-item tech-notes tech-specs">
                                            <span className="sr-only">Tech Notes:</span>
                                            <span className="tooltip long">Click This Icon To See Tech Notes</span>
                                            <div className="no-display tech-specs-text">
                                                <p><strong>Color Name:</strong>Alizarin Crimson Hue</p>
                                                <p><strong>Series:</strong>7</p>
                                                <p><strong>Pigment(s):</strong> Synthetic Organic PR122, PR206, PG7</p>
                                                <p><strong>Lightfastness: </strong>ASTM I, Excellent</p>
                                                <p><strong>Transparency:</strong>Semi Opaque</p>
                                            </div>
                                        </li>
                                    </ul>
                                    <div class="badges">
                                        <span class="attribute-head">  Item Notes	</span>
                                        <p>(Tap/Hover)</p>
                                    </div>
                                </div>
                                </div>
                                <span className="">
                                <span className="block">List</span>
                                <span className=""></span>
                                <span className="hidden"> <span>List Price:</span> (Also known as Manufacturer's Suggested Retail Price, we do not set or inflate the MSRP. We report it. For our Jerry's manufactured brand products, we establish MSRP based on those of third-party vendors whose products most closely resemble ours in quality and size.)</span>
                                <span className="">
                                <span className="block">$14.39</span>                
                                </span>
                                </span>
                            </span>
                            <span className="">
                                <span className="">
                                <span className="block">Reg. Price</span>
                                <span className="">
                                    <span className="block">$10.07</span>                
                                </span>
                                </span>
                            </span>
                            </div>
                            </div>			 
                            </div>                       	
                        </div>
                        <div className="hidden"></div>
                        <div className="hidden">V02397</div>
                        <div className="hidden">GOLDEN Heavy Body Acrylics - Transparent Brown Iron Oxide, 2oz Tube</div>
                        </div>
                    </td>
                    <td className="pr-2 " rowspan="2">
                        <div className="text-left pl-2 ">
                        <span>
                            <span className="hidden">V02397</span>
                            <a className="text-brand pb-1 border-b border-brand-100 w-full" href="#">
                            <span className="text-center">V02397</span>
                            </a>  
                        </span>
                        </div>
                    </td>
                    <td className="" rowspan="2">
                        <div className="text-left">
                        <span className="text-left">Heavy Body Acrylic Tube</span>
                        
                        </div>
                    </td>
                    <td className="" rowspan="2">
                        <div className="text-center">
                        <span className="text-center">Brown Iron Oxide</span>
                        
                        </div>
                    </td>
                    <td className="" rowspan="2">
                        <div className="text-center">
                        <span className="text-center">2 oz	</span>
                        
                        </div>
                    </td>
                    <td className="" rowspan="2">
                        <div className="text-center">
                        <span className="text-center">Tube</span>
                        
                        </div>
                    </td>
                    <td className="">
                        <div className="text-center">
                        
                        <span className="text-center">$14.39</span>
                        </div>
                    </td>
                    <td className="">
                        <div className="text-center">
                        <span className="text-center">$10.07</span>
                        </div>
                    </td>
                    <td className="" rowspan="2">
                        <div className="text-center">
                        <span className="text-center"></span>
                        <span className="text-center">In Stock</span>
                        </div>
                        <div className="hidden">
                        <span className="">Product Badge:</span>
                        <ul className="">
                            <li className="">
                            <span className="">Prop 65</span>
                            <span className="">⚠ WARNING - This product contains and can expose you to chemical(s) which are known to the State of California to cause cancer, birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.</span>
                            </li>

                            <li className="">
                            <span className="">LPP</span>
                            <span className="">Lowest Price - This item is already at the Best Lowest Price Possible and no further discounts or coupons can be applied.</span>
                            </li>

                            <li className="">
                            <span className="">Tech Notes:</span>
                            <span className="">Click This Icon To See Tech Notes</span>
                            <div className="">
                                <p><strong>Color Name:</strong>Transparent Brown Iron Oxide</p>
                                <p><strong>Series:</strong>3</p>
                                <p><strong>Pigment(s):</strong>Inorganic PR 101, PBk 7</p>
                                <p><strong>Opacity: </strong>Semi Transparent</p>
                                <p><strong>Lightfastness: </strong>(ASTM) I, Excellent </p>
                                <p><strong>Transparency:</strong>Opaque</p><p>This product contains material known to the state of California to cause cancer. Even if these products contain only trace levels of harmful chemicals, a warning is required by the State of California. The State of California requires clear and reasonable warnings on products and/or storage containers containing chemicals that have been shown to cause cancer, birth defects, or other </p>
                            </div>
                            </li>
                        </ul>
            
                        <div className="">
                            <span className="">Item Notes</span>
                            <p>(Tap/Hover)</p>
                        </div>
                        </div>			                  
                    </td>
                    <td className="flex justify-end  flex-wrap" rowspan="2">
                        <div className="flex w-full block justify-end pr-3">
                        <div className="">
                            <div className="border border-grey p-2">
                            <input type="button" value="-" className="" />
                            <input type="text"  maxlength="3" size="3" name="" className="" value="0" />
                            <input type="button" value="+" className="" />
                            </div>
                        </div>
                        <div className="ml-2">
                            <div className=" bg-green outline-none px-10 py-2 text-white text-center">
                                <button type="button" title="Add" className="">
                                    <span>Add</span>
                                </button>
                            </div>
                        </div>
                        </div>						                            
                        <div className="pr-4 mt-1 w-48" role="button">
                        <a href="#" className="border border-grey px-3 py-1  w-full block text-sm ">Add To Lists</a>
                        <div className="hidden">
                            <button type="button" title="Add To Favorites lists" className="">
                                <span>My Favorites/Saved Lists</span>
                            </button>

                            <button type="button" title="Add To Teacher's Cart" className="">
                                <span>My Teacher/Supply Lists</span>
                            </button>
                        </div>
                        </div>
                    </td>
                    </tr> 
                
                </tbody>
                </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
