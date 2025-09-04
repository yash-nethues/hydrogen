import React, { useState, useEffect } from 'react';
import {useFetcher} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import Modal from '~/components/Modal';
import QuantityInput from '~/components/QuantityInput';
import {VariantAddCartBtn} from '~/components/VariantAddCartBtn';

export function ProductVariations({ images, productVariants, productVideos, productOptions, descriptionHtml, pdfObjects}) {
  // State management for filter visibility and grid/list view toggle
  const [isFilterVisible, setFilterVisible] = useState(true);
  const [isGridView, setIsGridView] = useState(true); // Default to Grid view
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [filters, setFilters] = useState({
    color: [],
    size: [],
    format: []
  });
  const [sizeFilters, setSizeFilters] = useState([]);

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
  
  // Filter handling functions
  const handleFilterChange = (filterType, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };
  
  const handleSizeFilterChange = (size, checked) => {
    setSizeFilters(prev => 
      checked 
        ? [...prev, size]
        : prev.filter(item => item !== size)
    );
  };
  
  const clearAllFilters = () => {
    setFilters({
      color: [],
      size: [],
      format: []
    });
    setSizeFilters([]);
  };
  
  const clearFilterType = (filterType) => {
    if (filterType === 'sizeButtons') {
      setSizeFilters([]);
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: []
      }));
    }
  };
  
  // Filter variants based on selected filters
  const filteredVariants = productVariants.filter(variant => {
    const color = variant.selectedOptions.find(opt => opt.name.toLowerCase() === 'color')?.value;
    const size = variant.selectedOptions.find(opt => opt.name.toLowerCase() === 'size')?.value;
    const format = variant.selectedOptions.find(opt => opt.name.toLowerCase() === 'format')?.value;
    
    // Check color filter
    if (filters.color.length > 0 && !filters.color.includes(color)) {
      return false;
    }
    
    // Check size filter
    if (filters.size.length > 0 && !filters.size.includes(size)) {
      return false;
    }
    
    // Check format filter
    if (filters.format.length > 0 && !filters.format.includes(format)) {
      return false;
    }
    
    // Check size filter (from size buttons)
    if (sizeFilters.length > 0 && !sizeFilters.includes(size)) {
      return false;
    }
    
    return true;
  });

  // Set first variant as selected by default when filtered variants change
  useEffect(() => {
    if (filteredVariants.length > 0 && !selectedVariant) {
      setSelectedVariant(filteredVariants[0]);
    } else if (filteredVariants.length > 0 && selectedVariant) {
      // Check if current selected variant is still in filtered results
      const isStillAvailable = filteredVariants.some(variant => variant.id === selectedVariant.id);
      if (!isStillAvailable) {
        setSelectedVariant(filteredVariants[0]);
      }
    } else if (filteredVariants.length === 0) {
      setSelectedVariant(null);
    }
  }, [filteredVariants, selectedVariant]);

  // const [showDetails, setShowDetails] = useState(false);
  const [expandedVariantId, setExpandedVariantId] = useState(null);

  const [quantities, setQuantities] = useState({});

  const handleOpenVideoGallery = () => {
    const galleryItems = productVideos.map((meta) => {
      const videoUrl = meta.fields.find(f => f.key === 'video_url')?.value;
      const product_name = meta.fields.find(f => f.key === 'product_name')?.value;

      const imageField = meta.fields.find(f => f.key === 'thumbnail_image');
      const thumb = imageField?.reference?.image?.url;

      return {
        src: videoUrl,
        type: "video",
        caption: product_name,
        thumb: thumb,
      };
    });

    Fancybox.show(galleryItems, {
      Thumbs: {
        autoStart: true,
      },
    });
  };
  const [isOpen, setIsOpen] = useState(false);
  const [cartPopupOpen, setCartPopupOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartMessage, setCartMessage] = useState('');
  const cartFetcher = useFetcher();
  const [cartLineByVariantId, setCartLineByVariantId] = useState({});

  // Build mapping from Variant GID -> Cart Line ID when cart data is available
  useEffect(() => {
    const data = cartFetcher?.data;
    const nodes = data?.cart?.lines?.nodes;
    if (Array.isArray(nodes)) {
      const map = {};
      for (const line of nodes) {
        const variantId = line?.merchandise?.id;
        if (variantId && line?.id) {
          map[variantId] = line.id;
        }
      }
      setCartLineByVariantId(map);
    }
  }, [cartFetcher?.data]);
  {/* qty inc - dec */}
  const [quantity, setQuantity] = useState(1);
  const increaseQty = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };
  const decreaseQty = () => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1));
  };

  // Update cart item quantity (popup +/-) and sync to real cart when possible
  const updateCartItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantity less than 1
    
    setCartItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: newQuantity
      };
      // If this variant exists in the cart already, submit a LinesUpdate for that line id
      const variantGid = updatedItems[index]?.variant?.id;
      const lineId = variantGid ? cartLineByVariantId[variantGid] : undefined;
      if (lineId) {
        const formData = new FormData();
        formData.append('action', CartForm.ACTIONS.LinesUpdate);
        formData.append('inputs', JSON.stringify({lines: [{id: lineId, quantity: newQuantity}]}));
        cartFetcher.submit(formData, {method: 'post', action: '/cart'});
      }
      return updatedItems;
    });
  };

  // Add to Cart functionality
  const addToCart = () => {
    const itemsToAdd = [];
    let hasAnyQuantity = false;

    if (isGridView) {
      // Grid view: add only selected product
      if (selectedVariant) {
        // In grid view, use the quantity state variable
        if (quantity > 0) {
          itemsToAdd.push({
            variant: selectedVariant,
            quantity: quantity
          });
          hasAnyQuantity = true;
        }
      }
    } else {
      // List view: add all products with quantity > 0
      filteredVariants.forEach(variant => {
        const variantId = variant.id.split('/').pop();
        const variantQuantity = quantities[variantId] || 0;
        
        if (variantQuantity > 0) {
          itemsToAdd.push({
            variant: variant,
            quantity: variantQuantity
          });
          hasAnyQuantity = true;
        }
      });
    }

    // Add items to cart if we have any items to add
    if (itemsToAdd.length > 0) {
      // Show popup with items
      setCartItems(itemsToAdd);
      setCartMessage(`Successfully added ${itemsToAdd.length} item${itemsToAdd.length > 1 ? 's' : ''} to cart!`);
      setCartPopupOpen(true);

      // Add to real cart in a single LinesAdd call
      const lines = itemsToAdd.map((i) => ({merchandiseId: i.variant.id, quantity: i.quantity}));
      const formData = new FormData();
      formData.append('action', CartForm.ACTIONS.LinesAdd);
      formData.append('inputs', JSON.stringify({lines}));
      cartFetcher.submit(formData, {method: 'post', action: '/cart'});
    } else if (!hasAnyQuantity) {
      // Show alert only when no products have any quantity specified
      alert('Please specify product(s) quantity!');
    }
  };

  return (
    <>
        {/* View toggle buttons */}
        <div className="group-[.childProduct]/product:hidden flex mt-10 mb-0 gap-3" id="shop-all">
          <div className="flex">
            <div className="-mr-px"> 
              <span className="uppercase">Grid</span>
              <button
                onClick={switchToGridView}
                className={`group/view ${isGridView ? 'grid' : ''} text-sm text-grey w-j70 h-j70 flex justify-center items-center border border-grey-200 bg-white [&.grid]:bg-green [&.grid]:text-white font-semibold [&.grid]:border-green bg-gray`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 383.92 384" width="20" height="20">
                  <path fill="currentColor" d="M83.76,0c6.79,2.14,11.4,6.77,12.66,13.94-1.35,21.47,2.02,45.57.1,66.72-.85,9.33-6.94,14.66-16.09,15.38-20.95,1.63-43.98-1.28-65.16-.03-8.47-1.29-13.88-6.77-14.62-15.35-1.82-21.05,1.41-44.69.04-66.02C1.44,7.06,6.44,2.29,13.39,0h70.36Z"/>
                  <path fill="currentColor" d="M227.48,0c6.79,2.14,11.4,6.77,12.66,13.94-1.35,21.47,2.02,45.57.1,66.72-.85,9.33-6.94,14.66-16.09,15.38-20.95,1.63-43.98-1.28-65.16-.03-8.47-1.29-13.88-6.77-14.62-15.35-1.82-21.05,1.41-44.69.04-66.02.77-7.58,5.76-12.34,12.72-14.63h70.36Z"/>
                  <path fill="currentColor" d="M371.2,0c6.7,2.07,10.42,6.23,12.73,12.75v70.5c-2.42,6.92-6.96,11.93-14.59,12.75-20.78,2.25-45.43-1.69-66.63,0-7.92-1.11-13.77-6.55-14.58-14.64-2.12-20.99,1.56-45.38,0-66.73.77-7.58,5.76-12.34,12.72-14.63h70.36Z"/>
                  <path fill="currentColor" d="M383.92,156.75v70.5c-2.4,6.83-6.55,11.4-13.91,12.69-21.42-1.35-45.48,2.02-66.59.1-9.38-.85-14.66-6.95-15.35-16.12-1.57-21.04,1.23-44.03.04-65.27.96-8.43,6.96-13.94,15.31-14.66,21.01-1.82,44.6,1.41,65.89.04,7.79.79,12.05,5.74,14.61,12.74Z"/>
                  <path fill="currentColor" d="M83.76,384H13.39c-6.99-2.56-11.93-6.83-12.72-14.63,1.37-21.33-1.86-44.97-.04-66.02.72-8.37,6.21-14.38,14.63-15.34,21.21,1.19,44.15-1.62,65.15-.04,9.16.69,15.24,5.98,16.09,15.38,1.92,21.15-1.45,45.25-.1,66.72-1.29,7.38-5.84,11.54-12.66,13.94Z"/>
                  <path fill="currentColor" d="M227.48,384h-70.36c-6.99-2.56-11.93-6.83-12.72-14.63,1.37-21.33-1.86-44.97-.04-66.02.72-8.37,6.21-14.38,14.63-15.34,21.21,1.19,44.15-1.62,65.15-.04,9.16.69,15.24,5.98,16.09,15.38,1.92,21.15-1.45,45.25-.1,66.72-1.29,7.38-5.84,11.54-12.66,13.94Z"/>
                  <path fill="currentColor" d="M383.92,300.75v70.5c-2.33,6.74-6.03,10.43-12.73,12.75h-70.36c-6.99-2.56-11.93-6.83-12.72-14.63-2.12-20.99,1.56-45.38,0-66.73.7-7.77,6.84-13.92,14.6-14.62,21.31,1.56,45.66-2.13,66.6,0,7.79.79,12.05,5.74,14.61,12.74Z"/>
                  <path fill="currentColor" d="M13.96,144.2c21.66,1.24,46.63-2.35,67.91-.19,8.08.82,13.5,6.68,14.61,14.61-1.46,21.27,1.93,45.08.03,66.04-.77,8.48-6.26,14.17-14.62,15.35-21.23-1.47-44.99,1.93-65.91.03-8.26-.75-14.46-6.32-15.3-14.67-2.12-20.99,1.56-45.38,0-66.73.59-7.12,6.19-13.39,13.29-14.44Z"/>
                  <path fill="currentColor" d="M157.68,144.2c21.66,1.24,46.63-2.35,67.91-.19,8.08.82,13.5,6.68,14.61,14.61-1.46,21.27,1.93,45.08.03,66.04-.77,8.48-6.26,14.17-14.62,15.35-21.23-1.47-44.99,1.93-65.91.03-8.26-.75-14.46-6.32-15.3-14.67-2.12-20.99,1.56-45.38,0-66.73.59-7.12,6.19-13.39,13.29-14.44Z"/>
                </svg>
              </button>
            </div>
            <div>
              <span className="uppercase">List</span>
              <button
                onClick={switchToListView}
                className={`group/view ${isGridView ? '' : 'list'} text-base text-grey w-j70 h-j70 flex justify-center items-center border border-grey-200 bg-white [&.list]:bg-green [&.list]:text-white font-semibold [&.list]:border-green`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 171.34 157.25" width="20" height="20">
                  <path fill="currentColor" d="M63.01,57.33l100.82-.11c3.51.02,6.34,1.81,7.17,5.3l-.16,32.91c-1.1,3.14-3.42,4.4-6.62,4.68h-100.15c-3.32-.17-6.2-2.37-6.77-5.7.72-9.9-1.08-21.43-.04-31.13.34-3.13,2.74-5.35,5.74-5.94Z"/>
                  <path fill="currentColor" d="M63.81,114.22l99.25-.13c3.59.02,6.95,1.63,7.94,5.3-.67,10.13.98,21.57.04,31.55-.28,2.96-1.9,4.93-4.76,5.76H62.02c-2.62-.63-4.35-2.77-4.71-5.42-1.28-9.4.89-21.44-.03-31.13.47-3.4,3.17-5.68,6.54-5.93Z"/>
                  <path fill="currentColor" d="M62.62.45l103.66.17c2.49.68,4.23,2.5,4.71,5.03l-.15,32.9c-.8,1.91-2.39,3.55-4.41,4.16-33.49,1.17-67.23.15-100.81.52-4.14-.28-7.25-1.21-8.32-5.7.61-9.91-.92-20.99-.05-30.76.3-3.4,1.99-5.58,5.37-6.32Z"/>
                  <path fill="currentColor" d="M6.14,57.33c9.66.53,20.79-1.06,30.28-.1,3.6.37,5.93,2.4,6.43,6.03-.66,9.81.88,20.74.01,30.4-.34,3.83-2.67,6.02-6.45,6.41-7.11.72-22.04.64-29.23.02-3.38-.29-6.37-2-6.81-5.65-1.19-9.75.89-21.92.03-31.93.75-2.93,2.74-4.74,5.73-5.18Z"/>
                  <path fill="currentColor" d="M5.74.45c9.82.64,21.47-1.17,31.08-.09,3.27.37,5.45,2.4,6.05,5.64-.68,9.94.87,21,0,30.8-.39,4.42-3.51,6.11-7.6,6.43-7.32.57-19.98.57-27.3,0-3.66-.29-6.81-1.76-7.59-5.65.96-9.94-1.27-22.28.04-31.92C.83,2.72,3.03,1.13,5.74.45Z"/>
                  <path fill="currentColor" d="M6.93,114.22c6.56-.82,22.01-.73,28.71-.1,3.15.29,5.92,1.56,6.95,4.74-.27,10.13,1.26,22.1.29,32.09-.33,3.41-2.66,5.61-6.06,6.02-9.68-.66-20.47.87-30.01.01-3.69-.33-6.1-2.3-6.43-6.04-.89-10.03.68-21.38.04-31.55.9-3.17,3.34-4.78,6.51-5.17Z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex gap-3 w-full">
            <div className="w-full">
              <span className="uppercase">FILTERS</span>
              <div className="flex gap-3">
                <div className={`toolbar-title relative bg-white border w-full p-5 pl-10 flex filterBtnSec group/filter ${isFilterVisible ? 'active' : ''} text-xl font-semibold text-brand before:text-[120%] before:absolute before:left-5 before:top-1/2 before:-translate-y-1/2  before:content-['+'] [&.active]:before:content-['-'] after:rotate-45  [&.active]:after:-scale-100  after:border-grey after:top-1/2 after:-translate-y-1/2 after:absolute  after:right-5 after:w-2.5 after:rounded-br-sm after:h-2.5 after:border-l-0 after:border-t-0 after:border-2 after:transition-all`}
                  onClick={toggleFilter}
                >Filter By</div>

                <button type="button" title="Add To Cart" onClick={addToCart} className="bg-green outline-none w-36 text-white">
                  <span>Add To Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conditionally render the filter section */}
        {isFilterVisible && (
        <div className='p-8 bg-white group-[.childProduct]/product:hidden border border-t-0 filterDataSec'>
          {productOptions.map((option) => {
            if (option.optionValues.length === 1) return null;
            return (
          <div className='border-b border-grey-200 py-5 first:pt-0 last:pb-0 last:border-b-0' key={option.name}>
            <label className='font-semibold mb-0 leading-none'>{option.name}</label>
            <div className='flex flex-wrap items-center gap-6'>
              <ul className='flex gap-4'>
                {option.optionValues.map((value) => {
                    const {
                      name,
                      handle,
                      variantUriQuery,
                      selected,
                      available,
                      exists,
                      isDifferentProduct,
                      swatch,
                    } = value;
                    if (option.name == 'Color') {
                      var colorCode = '#FFFFFF';
                      if(name == 'Black'){
                        var colorCode = '#000000';
                      }else if(name == 'Red'){
                        var colorCode = '#FF0000';
                      }else if(name == 'Blue'){
                        var colorCode = '#0076FF';
                      }else if(name == 'Yellow'){
                        var colorCode = '#FFE400';
                      }
                      
                      return (
                        <li key={name}>
                          <label className='p-0 pl-6 leading-6 relative' style={{ 'background': colorCode }}>
                              <input 
                                className='opacity-0 z-10 m-0 w-6 peer h-6 top-0 left-0 absolute' 
                                type="checkbox"  
                                value={name}
                                checked={filters.color.includes(name)}
                                onChange={(e) => handleFilterChange('color', name, e.target.checked)}
                              /> 
                              <span className='ps-j5 pe-2.5 bg-white'>{name}</span>
                              <span className='absolute w-[22px] h-[21px] opacity-0 peer-checked:opacity-100 bg-white left-px top-px after:absolute after:left-[7px] after:top-[2px] after:w-[6px] after:h-[13px] after:rotate-45 after:border-r after:border-b after:border-blue'></span>
                          </label>
                        </li>
                      )
                    }else{
                      const filterType = option.name.toLowerCase();
                      return (
                        <li key={name}>
                          <label className='p-0 pl-6 leading-6 relative'>
                            <input 
                              className='opacity-0 z-10 m-0 w-6 peer h-6 top-0 left-0 absolute' 
                              type="checkbox"  
                              value={name}
                              checked={filters[filterType]?.includes(name)}
                              onChange={(e) => handleFilterChange(filterType, name, e.target.checked)}
                            /> 
                            <span className='ps-j5 pe-2.5 bg-white'>{name}</span>
                            <span className='absolute w-6 h-6 peer-checked:bg-brand bg-white left-0 top-0 border after:absolute after:left-[7px] after:top-[2px] after:w-[6px] after:h-[13px] after:rotate-45 after:border-r after:border-b border-brand after:opacity-0 after:border-white peer-checked:after:opacity-100'></span>
                          </label>
                        </li>
                      )
                    }
                })}
              </ul>
              {option.name === 'Color' && filters.color.length > 0 && (
                <button 
                  className='border border-brand-100 px-6 py-1 text-16 font-medium text-brand-100 hover:bg-brand-100 hover:text-white transition-colors' 
                  onClick={() => clearFilterType('color')}
                >
                  Clear All
                </button>
              )}
              {option.name === 'Size' && filters.size.length > 0 && (
                <button 
                  className='border border-brand-100 px-6 py-1 text-16 font-medium text-brand-100 hover:bg-brand-100 hover:text-white transition-colors' 
                  onClick={() => clearFilterType('size')}
                >
                  Clear All
                </button>
              )}
              {option.name === 'Format' && filters.format.length > 0 && (
                <button 
                  className='border border-brand-100 px-6 py-1 text-16 font-medium text-brand-100 hover:bg-brand-100 hover:text-white transition-colors' 
                  onClick={() => clearFilterType('format')}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          );
        })}
        </div>
        )}
        <div className='flex mt-5 group-[.childProduct]/product:hidden'>
          <span className='w-24 font-bold text-lg/none'>Shop By Size</span>
          <div className='flex flex-wrap gap-2.5'>
            {Array.from({ length: 7 }, (_, index) => {
              const size = `${2*index || 1} oz`;
              const isSelected = sizeFilters.includes(size);
              return (
                <label key={index} className='relative isolate cursor-pointer'>
                  <input 
                    type="checkbox" 
                    name="filter-size" 
                    value={size} 
                    className='absolute peer left-0 top-0 opacity-0 pointer-events-none'
                    checked={isSelected}
                    onChange={(e) => handleSizeFilterChange(size, e.target.checked)}
                  />
                  <span className={`py-2 px-5 text-27 block border border-brand transition-all bg-white text-brand ${isSelected ? 'bg-brand text-white' : ''}`}>
                    {size}
                  </span>
                </label>
              );
            })}
          </div>
          {sizeFilters.length > 0 && (
            <button 
              className='border border-brand-100 px-6 py-1 text-16 font-medium text-brand-100 hover:bg-brand-100 hover:text-white transition-colors ml-4' 
              onClick={() => clearFilterType('sizeButtons')}
            >
              Clear All
            </button>
          )}
        </div>



        {/* Product Grid/List Views */}
        <div className=" variationsProList group-[.childProduct]/product:hidden mt-10">
          {isGridView ? (
            <div className="variationsGridView">
              <div className='flex flex-wrap w-full items-start'>
                <div className='w-3/5 flex-grow flex flex-wrap gap-2.5 items-start justify-between md:justify-start pe-j30'>
                  {filteredVariants.map((variant) => {
                    const color = variant.selectedOptions.find(
                      (opt) => opt.name.toLowerCase() === 'color'
                    )?.value;

                    const size = variant.selectedOptions.find(
                      (opt) => opt.name.toLowerCase() === 'size'
                    )?.value;

                    const format = variant.selectedOptions.find(
                      (opt) => opt.name.toLowerCase() === 'format'
                    )?.value;

                    const variantName = variant.metafield?.value || variant.title;
                    const variantPrice = variant.price.amount;

                    const variantId = variant.id.split('/').pop();

                    const quantity = quantities[variantId] || 0;

                    const increaseQty = () => {
                      setQuantities((prev) => ({
                        ...prev,
                        [variantId]: quantity + 1
                      }));
                    };

                    const decreaseQty = () => {
                      if (quantity > 0) {
                        setQuantities((prev) => ({
                          ...prev,
                          [variantId]: quantity - 1
                        }));
                      }
                    };
                    
                    const variantURL = '/products/' + variant.product.handle + '?Color=' + color + '&Size=' + size + '&Format=' + format;

                    return (
                      <div 
                        key={variant.id} 
                        onClick={() => setSelectedVariant(variant)} 
                        className={`relative group/gridItem [&.active]:scale-125 [&.active]:translate-y-4 hover:scale-125 hover:translate-y-4 hover:shadow-text [&.active]:-mb-9 hover:-mb-9 [&.active]:shadow-text w-[120px] hover:z-10 [&.active]:z-10 text-14/4 text-center bg-white border border-grey-200 p-j5 rounded-sm flex flex-col gap-y-1 ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                      >
                        <img src={variant.image.url} alt={variant.metafield?.value || variant.title} className="w-full aspect-square object-cover" />
                        <div className='flex flex-col'>
                          <p className="text-inherit mb-0">{variant.metafield?.value || variant.title}</p>
                          <span className='text-xs'>{size}</span>
                          <span className='text-xs text-blue flex flex-wrap justify-between group-[.active]/gridItem:flex-col group-hover/gridItem:flex-col group-[.active]/gridItem:justify-center group-hover/gridItem:justify-center'>
                            <span className='font-semibold group-[.active]/gridItem:text-[80%] group-hover/gridItem:text-[80%]'>Reg. Price</span>
                            <span className=' group-[.active]/gridItem:text-[110%] group-hover/gridItem:text-[110%]  group-[.active]/gridItem:font-semibold group-hover/gridItem:font-semibold'>${variant.price.amount}</span>
                          </span>
                          <div className='-m-j5 mt-j5 p-j5 border-t border-grey-200 hidden group-[.active]/gridItem:flex group-hover/gridItem:flex gap-x-1 items-center justify-center'>
                            <span className='text-10'>More Info &gt;</span>
                            <div className="flex flex-wrap flex-col">
                              <span className="prod-alert-label hidden">Product Badge:</span>
                              <ul className="badgesFlags flex flex-wrap gap-1">
                                <li className="alert-item w-6 group/tooltip rounded-sm tech-notes tech-specs">
                                  <svg width="14" height="14" aria-hidden="true">
                                    <use href="#icon-tech-notes" />
                                  </svg>
                                  <span className="sr-only">Tech Notes:</span>
                                  <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto  group-[&.active]/gridItem:scale-75 group-hover/gridItem:scale-75 origin-bottom">Click This Icon To See Tech Notes</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>                  
                    );
                  })}
                
                </div>
                {selectedVariant ? (
                <div className='w-2/5 flex-none md:sticky md:top-10 max-w-[430px] bg-white rounded-sm border border-grey-200 p-5'>
                  <div className='mt-4'>
                    <strong className='block'>Name</strong>
                    <span data-blink="Click Here" className="relative before:pointer-events-none before:animate-blink1 before:content-[attr(data-blink)] before:inline-block before:opacity-0  before:px-2.5 before:py-j5 before:text-white before:bg-brand before:absolute before:top-full before:text-10/3 before:uppercase after:pointer-events-none after:absolute after:left-[4px] after:top-full after:w-1.5 after:aspect-square after:bg-brand after:rotate-45 after:-translate-y-1/2 after:opacity-0 after:animate-blink1"><a href="">{selectedVariant.metafield?.value || selectedVariant.title}</a></span>
                  </div>
                  <div className="mt-4 flex gap-x-4">
                    <div className='flex w-2/3 gap-x-4'>
                      <div className='flex-grow'>
                        <strong className='block'>Size</strong>
                        <span>2 oz</span>
                      </div>
                      <div className='flex-grow'>
                        <strong className='block'>item#</strong>
                        <span>65481</span>
                      </div>
                    </div>
                    <div className='w-1/3 relative'>
                      <span className='text-green'>In Stock</span>
                      <div className='flex flex-col absolute left-0 top-full'>
                        <span className="prod-alert-label hidden">Product Badge:</span>
                        <ul className="badgesFlags flex flex-wrap gap-1">
                          <li className="alert-item w-6 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.super-sale]:!bg-green [&.super-sale]:!text-white [&.super-sale]:!shadow-none [&.prop-65]:!shadow-none [&.prop-65]:!border-0 [&.super-sale]:!border-0 lpp">
                            <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-6 group-[.prop-65]/tooltip:h-6'>
                              <use href="#icon-lpp" />
                            </svg>
                            <span className="sr-only">LPP</span>
                            <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                              Lowest Price - This item is already at the Best Lowest Price Possible and no further discounts or coupons can be applied.
                            </span>
                          </li>
                          <li className="alert-item w-6 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.super-sale]:!bg-green [&.super-sale]:!text-white [&.super-sale]:!shadow-none [&.prop-65]:!shadow-none [&.prop-65]:border-0 [&.super-sale]:!border-0 tech-notes tech-specs">
                            <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-6 group-[.prop-65]/tooltip:h-6'>
                              <use href="#icon-tech-notes" />
                            </svg>
                            <span className="sr-only">Tech Notes:</span>
                            <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">Click This Icon To See Tech Notes</span>
                            <div className="no-display tech-specs-text">
                              <p><strong>Color Name:</strong>Alizarin Crimson Hue</p>
                              <p><strong>Series:</strong>7</p>
                              <p><strong>Pigment(s):</strong> Synthetic Organic PR122, PR206, PG7</p>
                              <p><strong>Lightfastness:</strong> ASTM I, Excellent</p>
                              <p><strong>Transparency:</strong> Semi Opaque</p>
                            </div>
                          </li>                          
                          <li className="alert-item w-6 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.super-sale]:!bg-green [&.super-sale]:!text-white [&.super-sale]:!shadow-none [&.prop-65]:!shadow-none [&.prop-65]:!border-0 [&.super-sale]:!border-0 prop-65">
                            <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-6 group-[.prop-65]/tooltip:h-6'>
                              <use href="#icon-prop-65" />
                            </svg>
                            <span className="sr-only">Prop 65</span>
                            <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                              ⚠ WARNING - This product contains and can expose you to chemical(s) which are known to the State of California to cause cancer, birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.
                            </span>
                          </li>
                          <li className="alert-item w-6 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.super-sale]:!bg-green [&.super-sale]:!text-white [&.super-sale]:!shadow-none [&.prop-65]:!shadow-none [&.prop-65]:!border-0 [&.super-sale]:!border-0 super-sale">
                            <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-6 group-[.prop-65]/tooltip:h-6 group-[.super-sale]/tooltip:w-6 group-[.super-sale]/tooltip:h-6'>
                              <use href="#icon-super-sale" />
                            </svg>
                            <span className="sr-only">super-sale</span>
                            <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                              ⚠ WARNING - This product contains and can expose you to chemical(s) which are known to the State of California to cause cancer, birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.
                            </span>
                          </li>
                        </ul>
                        <div className="badges flex mt-1 flex-wrap gap-x-j5 text-xs">
                          <span className="attribute-head ">Item Notes</span>
                          <p className='text-inherit mb-0 text-[75%]'>(Tap/Hover)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-x-4">
                    <div className="flex w-2/3 gap-x-4">
                      <div className='flex-grow text-grey group/price [&.reg]:text-blue-600 [&.sale]:text-brand'>
                        <strong className="flex items-center gap-x-2">
                          <span>List</span>
                          <span className="info relative cursor-pointer group/tooltip">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 383.47 384">
                              <path d="M203.82,0c4.31,1.16,9.24,1.01,13.74,1.61,81.03,10.74,147.75,74.59,162.68,154.95l3.23,23.38v23.99l-3.23,23.38c-14.89,80.17-81.74,144.36-162.68,154.95-4.5.59-9.43.46-13.74,1.61-7.92-.34-16.06.46-23.95,0C76.75,377.81-4.35,286.63.18,183.27,4.41,86.76,83.57,5.64,179.87,0h23.95ZM181.96,22.71C49.93,30.24-23.14,181.9,54.25,290.37c67.24,94.26,207.35,94.54,274.87.43,83.13-115.88-5.76-276.16-147.16-268.09Z" fill="currentColor" />
                              <path d="M231.25,106.72c20.25,19.91,22.31,52.73,4.74,75.07-11.36,14.44-30.01,17.01-32.73,38.44-.91,7.18,1.77,18.58-2.84,24.15-5.98,7.22-18.34,3.46-19.76-5.64-2.48-15.86,1.92-35.49,11.62-48.25,11.94-15.7,31.97-17.53,33.27-41.64,2.12-39.14-53.47-49.13-65.5-13.13-2.66,7.95.08,19.46-10.1,22.12-11.14,2.9-14.93-7.19-14.15-16.42,3.92-46.38,62.03-67.56,95.45-34.7Z" fill="currentColor" />
                              <path d="M189.39,270.82c14.85-3.05,18.94,19.26,4.91,22.15-14.85,3.05-18.94-19.26-4.91-22.15Z" fill="currentColor" />
                            </svg>
                            <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                              <strong>List Price:</strong>  (Also known as Manufacturer's Suggested Retail Price, we do not set or inflate the MSRP. We report it. For our Jerry's manufactured brand products, we establish MSRP based on those of third-party vendors whose products most closely resemble ours in quality and size.)
                            </span>
                          </span>
                        </strong>
                        <span className='text-18 group-[.reg]/price:line-through'>${selectedVariant.price?.amount}</span>
                      </div>
                    </div>
                    
                  </div>
                  <div className="mt-4 text-blue-600 group/price [&.sale]:text-brand">
                    <strong className="block group-[.sale]/price:uppercase">Reg. Price</strong>
                    <strong className='text-22 '>${selectedVariant.price?.amount}</strong>
                  </div>
                  <div className="mt-4 flex md:flex-wrap xl:flex-nowrap gap-2.5">
                    <div className='flex flex-none w-full xl:w-[188px] gap-x-2.5'>
                      <div className="border relative border-grey-200 w-1/2">
                        <input
                          type="button"
                          value="-"
                          onClick={decreaseQty}
                          className="absolute left-0 cursor-pointer top-0 bottom-0 w-7"
                        />
                        <input
                          type="text"
                          maxLength="3"
                          size="3"
                          className="text-center w-full h-full px-5 text-xl font-medium"
                          value={quantity}
                          readOnly
                        />
                        <input
                          type="button"
                          value="+"
                          onClick={increaseQty}
                          className="absolute right-0 cursor-pointer top-0 bottom-0 w-7"
                        />
                        <span className='absolute top-full min-w-max left-0 mt-1.5 text-13/none text-brand'>Hurry Only 2 left</span>
                      </div>
                      <VariantAddCartBtn
                        productOptions={productOptions}
                        selectedVariant={selectedVariant}
                        quantity={quantity}
                      />             
                    </div>
                    <div className="w-full group/addList relative" role="button">
                      <span className="border border-grey-200 text-grey flex hover:text-green hover:border-green group-[.active]/addList:text-green group-[.active]/addList:border-green transition-all  items-center justify-center ps-2.5 pe-10 py-1 w-full h-full relative">
                        <span>Add To Lists</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className='absolute end-2 top-1/2 -translate-y-1/2 w-6 aspect-square group-[.active]/addList:-scale-100' viewBox="0 0 384 384">
                          <path fill="currentColor" d="M92.62,128.43c5.61-.97,10.94.03,15.17,3.94l84.3,84.33,82.97-82.46c13.06-13.06,34.24.24,26.49,17.55-30.41,34.4-64.89,65.57-96.82,98.74-5.45,5.19-12.54,7.07-19.61,3.86-34.71-31.99-67.2-66.72-100.86-99.95-7.29-8.48-3.01-24.04,8.35-26Z"/>
                        </svg>
                      </span>
                      <div className="hidden group-[.active]/addList:flex absolute top-full end-0 min-w-max flex-col bg-grey-100 border border-grey-200">
                        <button type="button" title="Add To Favorites lists" className=" text-xs ps-10 pe-2.5 py-3 text-start bg-transparent border-t border-grey-200 first:border-t-0 hover:bg-white transition-all relative">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.9 43.13" className='absolute left-2 top-1/2 -translate-y-1/2 w-6 aspect-square'>
                            <path fill="currentColor" d="M0,14.38v-2.25C.84,4.06,8.28-1.47,16.28.37c3.11.72,5.72,2.59,7.63,5.11.17.04.68-.77.83-.94,9.27-10.05,25.17-2.14,22.94,11.27-.48,2.92-1.84,5.8-3.42,8.28,4.08,3.71,4.85,9.76,1.65,14.33-3.92,5.59-12.08,6.16-16.68,1.11l-5.11,3.59h-.27c-4.54-2.91-8.89-6.23-12.77-9.98C6.27,28.49.49,21.33,0,14.38ZM23.86,10.45c-1.07-2.62-2.44-4.87-4.87-6.41C13.75.71,6.71,2.55,3.73,7.95c-5.02,9.11,4.9,19.89,11.24,25.52.98.87,8.38,6.93,9.02,6.87l3.81-2.67c-1.33-2.56-1.81-5.3-1.12-8.14,1.65-6.87,9.54-10.17,15.71-6.84,3.06-4.75,4.7-10.8,1.14-15.78-4.57-6.4-14.23-5.95-18.19.85-.46.79-.8,1.83-1.27,2.57-.06.09.01.17-.21.12ZM36.1,23.79c-3.31.32-6.28,2.99-7.12,6.18-2.09,7.96,7.24,13.97,13.54,8.7s1.98-15.69-6.43-14.88Z"/>
                            <polygon fill="currentColor" points="38.27 27.32 38.27 30.98 42.01 30.98 42.01 33.32 38.41 33.32 38.27 33.46 38.27 37.07 35.93 37.07 35.93 33.32 32.28 33.32 32.28 30.98 35.93 30.98 35.93 27.32 38.27 27.32"/>
                          </svg>
                          <span>My Favorites/Saved Lists</span>
                        </button>
                        <button type="button" title="Add To Teacher's Cart" className=" text-xs ps-10 pe-2.5 py-3 text-start bg-transparent border-t border-grey-200 first:border-t-0 hover:bg-white transition-all relative">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.44 15.81" className='absolute left-2 top-1/2 -translate-y-1/2 w-6 aspect-square'>
                            <circle fill="currentColor" cx="3.03" cy="2.98" r="2.98"/>
                            <path fill="currentColor" d="M11.17,7.41c0,.22-.1.44-.28.59l-2.97,2.46c-.12.1-.26.15-.4.16-.21.07-.46.04-.65-.1l-1.38-.97v6.26H0v-6.78c0-1.51,1.23-2.75,2.74-2.75.75,0,1.44.31,1.94.81.03.03.05.05.07.08l2.57,1.8,2.59-2.15c.33-.27.81-.22,1.08.1.12.15.18.32.18.49Z"/>
                            <path fill="currentColor" d="M23.44,1.07v13.47c0,.42-.34.76-.76.76h-13.37c-.43,0-.77-.34-.77-.76,0-.01,0-.03.01-.04-.01-.01-.01-.03-.01-.04v-2.32c0-.42.34-.76.77-.76s.76.34.76.76v1.63h11.84V1.83h-11.84v3.68c0,.42-.34.76-.76.76s-.77-.34-.77-.76V1.07c0-.43.34-.77.77-.77h13.37c.42,0,.76.34.76.77Z"/>
                            <rect fill="currentColor" x="14.84" y="4.37" width="1.53" height="6.88" rx=".76" ry=".76" transform="translate(23.41 -7.79) rotate(90)"/>
                            <rect fill="currentColor" x="15.15" y=".27" width="1.53" height="9" rx=".76" ry=".76" transform="translate(20.69 -11.14) rotate(90)"/>
                            <rect fill="currentColor" x="15.54" y="5.8" width="1.53" height="9.63" rx=".76" ry=".76" transform="translate(26.92 -5.69) rotate(90)"/>
                          </svg>
                          <span>My Teacher/Supply Lists</span>
                        </button>
                      </div>
                    </div>

                  </div>
                  <div className="w-full p-2.5 relative mt-16">
                    <ul className="text-center">
                      <li>
                        <img
                          className="w-auto inline-block aspect-square object-contain max-w-full max-h-[85%] h-auto"
                          src={selectedVariant?.image?.url}
                          alt={selectedVariant?.metafield?.value || selectedVariant?.title || 'Selected product'}
                        />
                      </li>
                    </ul>
                    <p className='text-center font-bold text-18'>More Images</p>
                    <div className='flex gap'>
                      <span></span>
                    </div>
                    <div className="absolute -top-px -left-px bg-white border cursor-pointer z-10  aspect-square w-14" > 
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" className='w-full h-full text-blue' onClick={handleOpenVideoGallery} >
                        <g fill="currentColor">
                          <path d="M215.89,455.31l-21.14,56.29h-10.69l-21.22-56.29h9.88l16.68,46.81,16.77-46.81h9.72Z"/>
                          <path d="M224.07,459.36c-1.13-1.13-1.7-2.54-1.7-4.21s.57-3.08,1.7-4.21,2.54-1.7,4.21-1.7,3,.57,4.13,1.7,1.7,2.54,1.7,4.21-.57,3.08-1.7,4.21-2.51,1.7-4.13,1.7-3.08-.57-4.21-1.7ZM232.82,466.98v44.63h-9.23v-44.63h9.23Z"/>
                          <path d="M244.68,477.18c1.86-3.46,4.4-6.14,7.61-8.06,3.21-1.92,6.79-2.88,10.73-2.88,2.92,0,5.79.64,8.63,1.9,2.83,1.27,5.09,2.96,6.76,5.06v-21.54h9.31v59.93h-9.31v-6.72c-1.51,2.16-3.6,3.94-6.28,5.35s-5.74,2.11-9.19,2.11c-3.89,0-7.44-.98-10.65-2.96-3.21-1.97-5.75-4.72-7.61-8.26-1.86-3.54-2.79-7.54-2.79-12.03s.93-8.45,2.79-11.91ZM276.51,481.23c-1.27-2.27-2.93-4-4.98-5.18-2.05-1.19-4.27-1.78-6.64-1.78s-4.59.58-6.64,1.74c-2.05,1.16-3.71,2.86-4.98,5.1-1.27,2.24-1.9,4.9-1.9,7.98s.63,5.78,1.9,8.1c1.27,2.32,2.94,4.09,5.02,5.31,2.08,1.21,4.28,1.82,6.6,1.82s4.59-.59,6.64-1.78c2.05-1.19,3.71-2.93,4.98-5.22,1.27-2.29,1.9-4.98,1.9-8.06s-.64-5.75-1.9-8.02Z"/>
                          <path d="M340.46,492.73h-34.1c.27,3.56,1.59,6.43,3.97,8.58,2.38,2.16,5.29,3.24,8.75,3.24,4.97,0,8.48-2.08,10.53-6.24h9.96c-1.35,4.1-3.79,7.47-7.33,10.08-3.54,2.62-7.92,3.93-13.16,3.93-4.27,0-8.09-.96-11.46-2.88-3.38-1.92-6.02-4.62-7.94-8.1-1.92-3.48-2.88-7.52-2.88-12.11s.93-8.62,2.79-12.11c1.86-3.48,4.48-6.17,7.86-8.06,3.37-1.89,7.25-2.83,11.62-2.83s7.96.92,11.26,2.75c3.29,1.84,5.86,4.41,7.69,7.74,1.83,3.32,2.75,7.14,2.75,11.46,0,1.67-.11,3.19-.32,4.54ZM331.14,485.28c-.05-3.4-1.27-6.13-3.65-8.18-2.38-2.05-5.32-3.08-8.83-3.08-3.19,0-5.91,1.01-8.18,3.04-2.27,2.03-3.62,4.77-4.05,8.22h24.7Z"/>
                          <path d="M357.79,509.46c-3.4-1.92-6.07-4.62-8.02-8.1-1.94-3.48-2.92-7.52-2.92-12.11s1-8.56,3-12.07c2-3.51,4.72-6.21,8.18-8.1,3.45-1.89,7.32-2.83,11.58-2.83s8.13.95,11.58,2.83c3.45,1.89,6.18,4.59,8.18,8.1,2,3.51,3,7.53,3,12.07s-1.03,8.56-3.08,12.07c-2.05,3.51-4.85,6.22-8.38,8.14-3.54,1.92-7.44,2.88-11.7,2.88s-8.02-.96-11.42-2.88ZM375.89,502.61c2.08-1.13,3.77-2.83,5.06-5.1s1.94-5.02,1.94-8.26-.62-5.98-1.86-8.22c-1.24-2.24-2.89-3.93-4.94-5.06-2.05-1.13-4.27-1.7-6.64-1.7s-4.58.57-6.6,1.7-3.63,2.82-4.82,5.06c-1.19,2.24-1.78,4.98-1.78,8.22,0,4.81,1.23,8.52,3.69,11.14,2.46,2.62,5.55,3.93,9.27,3.93,2.38,0,4.6-.57,6.68-1.7Z"/>
                          <path d="M408.29,510.43c-2.78-1.27-4.98-3-6.6-5.18-1.62-2.19-2.48-4.63-2.59-7.33h9.56c.16,1.89,1.07,3.47,2.71,4.74,1.65,1.27,3.71,1.9,6.2,1.9s4.6-.5,6.03-1.5c1.43-1,2.15-2.28,2.15-3.85,0-1.67-.8-2.92-2.39-3.73-1.59-.81-4.12-1.7-7.57-2.67-3.35-.92-6.07-1.81-8.18-2.67-2.11-.86-3.93-2.19-5.47-3.97-1.54-1.78-2.31-4.13-2.31-7.05,0-2.38.7-4.55,2.11-6.52,1.4-1.97,3.41-3.52,6.03-4.66,2.62-1.13,5.63-1.7,9.03-1.7,5.07,0,9.17,1.28,12.27,3.85,3.1,2.57,4.76,6.06,4.98,10.49h-9.23c-.16-2-.97-3.59-2.43-4.78-1.46-1.19-3.43-1.78-5.91-1.78s-4.29.46-5.59,1.38c-1.3.92-1.94,2.13-1.94,3.64,0,1.19.43,2.19,1.3,3,.86.81,1.92,1.45,3.16,1.9,1.24.46,3.08,1.04,5.51,1.74,3.24.86,5.9,1.74,7.98,2.63,2.08.89,3.87,2.2,5.39,3.93,1.51,1.73,2.29,4.02,2.35,6.88,0,2.54-.7,4.81-2.11,6.8-1.4,2-3.39,3.56-5.95,4.7-2.56,1.13-5.58,1.7-9.03,1.7s-6.66-.63-9.44-1.9Z"/>
                        </g>
                        <g>
                          <circle fill="none" stroke="currentColor" strokeMiterlimit="10" cx="300" cy="238.49" r="158.55"/>
                          <path fill="currentColor" d="M248.87,158.6c2.13-.44,4.69-.44,6.73.41l126.3,73.56c2.54,3.54,2.69,7.86.29,11.46-41.37,25.83-84.61,49.03-126.6,74.01-5.02,1.73-10.7.33-12.55-5l-.71-146c.35-3.72,2.66-7.63,6.53-8.43Z"/>
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                ) : (
                  <p>Click a variant to see details.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="variationsListView">
              <table className="bg-white w-full ">
                <thead className="bg-blue text-white sticky top-50 w-full z-10">
                  <tr className="w-full">
                    <th className="border-r border-white p-3 text-left w-21">
                      <span className="text-base !text-white uppercase" >Image</span><p className='text-11 font-normal -mt-1.5'>(Click Image)</p>
                    </th>
                    <th className="text-left p-3">
                      <span className="">Item # </span><p  className='text-11 font-normal -mt-1.5'>(Click for Details)</p>
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
                <tbody className="border border-gray-100 w-full">
                 {filteredVariants.map((variant) => {
                  const color = variant.selectedOptions.find(
                    (opt) => opt.name.toLowerCase() === 'color'
                  )?.value;

                  const size = variant.selectedOptions.find(
                    (opt) => opt.name.toLowerCase() === 'size'
                  )?.value;

                  const format = variant.selectedOptions.find(
                    (opt) => opt.name.toLowerCase() === 'format'
                  )?.value;

                  const variantId = variant.id.split('/').pop();

                  const quantity = quantities[variantId] || 0;

                  const increaseQty = () => {
                    setQuantities((prev) => ({
                      ...prev,
                      [variantId]: quantity + 1
                    }));
                  };

                  const decreaseQty = () => {
                    if (quantity > 0) {
                      setQuantities((prev) => ({
                        ...prev,
                        [variantId]: quantity - 1
                      }));
                    }
                  };

                  const variantURL = '/products/' + variant.product.handle + '?Color=' + color + '&Size=' + size + '&Format=' + format;

                  return (
                  <tr className="w-full" key={variantId}>
                    <td className="">
                      <div className="relative group/detailBox">
                        <div onClick={() => setExpandedVariantId((prevId) => (prevId === variant.id ? null : variant.id))} className="relative w-[75px] aspect-square overflow-hidden cursor-pointer before:content-['+'] before:absolute before:bottom-0 before:left-0 before:bg-brand-100 before:w-5 before:h-5 before:text-white before:text-center">
                          <img
                            src={variant.image.url}
                            alt={variant.metafield?.value || variant.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {expandedVariantId === variant.id && (
                        <>
                        <div className="absolute bg-white w-j900 z-10 top-0  left-[75px] border border-gray-100">
                          <div className="flex">
                            <div className="w-[45%] p-2.5 relative">
                              <div className="absolute -top-px -left-px bg-white border cursor-pointer z-10  aspect-square w-50" > 
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" className='w-full h-full text-blue' onClick={handleOpenVideoGallery} >
                                  <g fill="currentColor">
                                    <path d="M215.89,455.31l-21.14,56.29h-10.69l-21.22-56.29h9.88l16.68,46.81,16.77-46.81h9.72Z"/>
                                    <path d="M224.07,459.36c-1.13-1.13-1.7-2.54-1.7-4.21s.57-3.08,1.7-4.21,2.54-1.7,4.21-1.7,3,.57,4.13,1.7,1.7,2.54,1.7,4.21-.57,3.08-1.7,4.21-2.51,1.7-4.13,1.7-3.08-.57-4.21-1.7ZM232.82,466.98v44.63h-9.23v-44.63h9.23Z"/>
                                    <path d="M244.68,477.18c1.86-3.46,4.4-6.14,7.61-8.06,3.21-1.92,6.79-2.88,10.73-2.88,2.92,0,5.79.64,8.63,1.9,2.83,1.27,5.09,2.96,6.76,5.06v-21.54h9.31v59.93h-9.31v-6.72c-1.51,2.16-3.6,3.94-6.28,5.35s-5.74,2.11-9.19,2.11c-3.89,0-7.44-.98-10.65-2.96-3.21-1.97-5.75-4.72-7.61-8.26-1.86-3.54-2.79-7.54-2.79-12.03s.93-8.45,2.79-11.91ZM276.51,481.23c-1.27-2.27-2.93-4-4.98-5.18-2.05-1.19-4.27-1.78-6.64-1.78s-4.59.58-6.64,1.74c-2.05,1.16-3.71,2.86-4.98,5.1-1.27,2.24-1.9,4.9-1.9,7.98s.63,5.78,1.9,8.1c1.27,2.32,2.94,4.09,5.02,5.31,2.08,1.21,4.28,1.82,6.6,1.82s4.59-.59,6.64-1.78c2.05-1.19,3.71-2.93,4.98-5.22,1.27-2.29,1.9-4.98,1.9-8.06s-.64-5.75-1.9-8.02Z"/>
                                    <path d="M340.46,492.73h-34.1c.27,3.56,1.59,6.43,3.97,8.58,2.38,2.16,5.29,3.24,8.75,3.24,4.97,0,8.48-2.08,10.53-6.24h9.96c-1.35,4.1-3.79,7.47-7.33,10.08-3.54,2.62-7.92,3.93-13.16,3.93-4.27,0-8.09-.96-11.46-2.88-3.38-1.92-6.02-4.62-7.94-8.1-1.92-3.48-2.88-7.52-2.88-12.11s.93-8.62,2.79-12.11c1.86-3.48,4.48-6.17,7.86-8.06,3.37-1.89,7.25-2.83,11.62-2.83s7.96.92,11.26,2.75c3.29,1.84,5.86,4.41,7.69,7.74,1.83,3.32,2.75,7.14,2.75,11.46,0,1.67-.11,3.19-.32,4.54ZM331.14,485.28c-.05-3.4-1.27-6.13-3.65-8.18-2.38-2.05-5.32-3.08-8.83-3.08-3.19,0-5.91,1.01-8.18,3.04-2.27,2.03-3.62,4.77-4.05,8.22h24.7Z"/>
                                    <path d="M357.79,509.46c-3.4-1.92-6.07-4.62-8.02-8.1-1.94-3.48-2.92-7.52-2.92-12.11s1-8.56,3-12.07c2-3.51,4.72-6.21,8.18-8.1,3.45-1.89,7.32-2.83,11.58-2.83s8.13.95,11.58,2.83c3.45,1.89,6.18,4.59,8.18,8.1,2,3.51,3,7.53,3,12.07s-1.03,8.56-3.08,12.07c-2.05,3.51-4.85,6.22-8.38,8.14-3.54,1.92-7.44,2.88-11.7,2.88s-8.02-.96-11.42-2.88ZM375.89,502.61c2.08-1.13,3.77-2.83,5.06-5.1s1.94-5.02,1.94-8.26-.62-5.98-1.86-8.22c-1.24-2.24-2.89-3.93-4.94-5.06-2.05-1.13-4.27-1.7-6.64-1.7s-4.58.57-6.6,1.7-3.63,2.82-4.82,5.06c-1.19,2.24-1.78,4.98-1.78,8.22,0,4.81,1.23,8.52,3.69,11.14,2.46,2.62,5.55,3.93,9.27,3.93,2.38,0,4.6-.57,6.68-1.7Z"/>
                                    <path d="M408.29,510.43c-2.78-1.27-4.98-3-6.6-5.18-1.62-2.19-2.48-4.63-2.59-7.33h9.56c.16,1.89,1.07,3.47,2.71,4.74,1.65,1.27,3.71,1.9,6.2,1.9s4.6-.5,6.03-1.5c1.43-1,2.15-2.28,2.15-3.85,0-1.67-.8-2.92-2.39-3.73-1.59-.81-4.12-1.7-7.57-2.67-3.35-.92-6.07-1.81-8.18-2.67-2.11-.86-3.93-2.19-5.47-3.97-1.54-1.78-2.31-4.13-2.31-7.05,0-2.38.7-4.55,2.11-6.52,1.4-1.97,3.41-3.52,6.03-4.66,2.62-1.13,5.63-1.7,9.03-1.7,5.07,0,9.17,1.28,12.27,3.85,3.1,2.57,4.76,6.06,4.98,10.49h-9.23c-.16-2-.97-3.59-2.43-4.78-1.46-1.19-3.43-1.78-5.91-1.78s-4.29.46-5.59,1.38c-1.3.92-1.94,2.13-1.94,3.64,0,1.19.43,2.19,1.3,3,.86.81,1.92,1.45,3.16,1.9,1.24.46,3.08,1.04,5.51,1.74,3.24.86,5.9,1.74,7.98,2.63,2.08.89,3.87,2.2,5.39,3.93,1.51,1.73,2.29,4.02,2.35,6.88,0,2.54-.7,4.81-2.11,6.8-1.4,2-3.39,3.56-5.95,4.7-2.56,1.13-5.58,1.7-9.03,1.7s-6.66-.63-9.44-1.9Z"/>
                                  </g>
                                  <g>
                                    <circle fill="none" stroke="currentColor" strokeMiterlimit="10" cx="300" cy="238.49" r="158.55"/>
                                    <path fill="currentColor" d="M248.87,158.6c2.13-.44,4.69-.44,6.73.41l126.3,73.56c2.54,3.54,2.69,7.86.29,11.46-41.37,25.83-84.61,49.03-126.6,74.01-5.02,1.73-10.7.33-12.55-5l-.71-146c.35-3.72,2.66-7.63,6.53-8.43Z"/>
                                  </g>
                                </svg>
                              </div>
                              <ul className="text-center">
                                <li>
                                  <img
                                    className="w-auto inline-block aspect-square object-contain max-w-[85%] max-h-[85%] h-auto"
                                    src={variant.image.url}
                                    alt={variant.metafield?.value || variant.title}
                                  />
                                </li>
                              </ul>

                            </div>
                            <div className="w-[55%] bg-gray-100 p-2.5">
                              <span  onClick={() => setExpandedVariantId(null)} className="absolute top-0 right-0 bg-brand-100 text-sm flex items-center justify-center w-8 h-8 text-white text-center cursor-pointer">X</span>
                              <h2 className="text-2xl font-normal pe-8 mb-2.5"><a href="" className="hover:text-brand">{variant.metafield?.value || variant.title}</a></h2>
                              <div className="flex flex-wrap flex-col gap-y-2">
                                <div className="flex flex-wrap flex-col">
                                  <span className="prod-alert-label hidden">Product Badge:</span>
                                   <ul className="badgesFlags flex flex-wrap gap-1">
                                     
                                      <li className="alert-item w-6 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.prop-65]:!shadow-none [&.prop-65]:!border-0 lpp">
                                        <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-6 group-[.prop-65]/tooltip:h-6'>
                                          <use href="#icon-lpp" />
                                        </svg>
                                        <span className="sr-only">LPP</span>
                                        <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                                          Lowest Price - This item is already at the Best Lowest Price Possible and no further discounts or coupons can be applied.
                                        </span>
                                      </li>
                                      <li className="alert-item w-6 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.prop-65]:border-0 tech-notes tech-specs">
                                        <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-6 group-[.prop-65]/tooltip:h-6'>
                                          <use href="#icon-tech-notes" />
                                        </svg>
                                        <span className="sr-only">Tech Notes:</span>
                                        <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">Click This Icon To See Tech Notes</span>
                                        <div className="no-display tech-specs-text">
                                          <p><strong>Color Name:</strong>Alizarin Crimson Hue</p>
                                          <p><strong>Series:</strong>7</p>
                                          <p><strong>Pigment(s):</strong> Synthetic Organic PR122, PR206, PG7</p>
                                          <p><strong>Lightfastness:</strong> ASTM I, Excellent</p>
                                          <p><strong>Transparency:</strong> Semi Opaque</p>
                                        </div>
                                      </li>
                                       <li className="alert-item w-6 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.prop-65]:!shadow-none [&.prop-65]:!border-0 prop-65">
                                        <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-6 group-[.prop-65]/tooltip:h-6'>
                                          <use href="#icon-prop-65" />
                                        </svg>
                                        <span className="sr-only">Prop 65</span>
                                        <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                                          ⚠ WARNING - This product contains and can expose you to chemical(s) which are known to the State of California to cause cancer, birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.
                                        </span>
                                      </li>
                                    </ul>
                                  <div className="badges flex flex-wrap gap-x-j5 text-grey text-13">
                                    <span className="attribute-head ">Item Notes</span>
                                    <p className='text-inherit mb-0'>(Tap/Hover)</p>
                                  </div>
                                </div>
                                <div className="product-item-status">
                                  <div className="in-stock flex gap-0.5 items-center text-green text-base">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="24" height="24">
                                      <path d="M14.13,4.71c.33-.06.78.14.74.53-.05.56-.65.63-1.07.86-2.33,1.25-4.57,4.2-6.08,6.35-.3.43-.59.98-.9,1.38s-.68.32-.96-.06c-.53-.73-.78-1.49-1.57-2.08-.29-.21-.51-.24-.77-.38-.5-.27-.25-.98.35-.98.95,0,2.1,1.37,2.6,2.09.85-1.29,1.76-2.55,2.77-3.72s2.3-2.5,3.64-3.35c.26-.17.97-.6,1.25-.64Z" fill="currentColor" />
                                    </svg>
                                    <span>In Stock</span>
                                  </div>
                                </div>
                              </div>
                              <div className="price-box price-final_price flex flex-col mt-5 gap-y-3.5">
                                <div className='text-base-300'>
                                  <strong className="flex items-center gap-x-2 text-14/none font-semibold">
                                    <span>List</span>
                                    <span className="info relative cursor-pointer group/tooltip">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 383.47 384">
                                        <path d="M203.82,0c4.31,1.16,9.24,1.01,13.74,1.61,81.03,10.74,147.75,74.59,162.68,154.95l3.23,23.38v23.99l-3.23,23.38c-14.89,80.17-81.74,144.36-162.68,154.95-4.5.59-9.43.46-13.74,1.61-7.92-.34-16.06.46-23.95,0C76.75,377.81-4.35,286.63.18,183.27,4.41,86.76,83.57,5.64,179.87,0h23.95ZM181.96,22.71C49.93,30.24-23.14,181.9,54.25,290.37c67.24,94.26,207.35,94.54,274.87.43,83.13-115.88-5.76-276.16-147.16-268.09Z" fill="currentColor" />
                                        <path d="M231.25,106.72c20.25,19.91,22.31,52.73,4.74,75.07-11.36,14.44-30.01,17.01-32.73,38.44-.91,7.18,1.77,18.58-2.84,24.15-5.98,7.22-18.34,3.46-19.76-5.64-2.48-15.86,1.92-35.49,11.62-48.25,11.94-15.7,31.97-17.53,33.27-41.64,2.12-39.14-53.47-49.13-65.5-13.13-2.66,7.95.08,19.46-10.1,22.12-11.14,2.9-14.93-7.19-14.15-16.42,3.92-46.38,62.03-67.56,95.45-34.7Z" fill="currentColor" />
                                        <path d="M189.39,270.82c14.85-3.05,18.94,19.26,4.91,22.15-14.85,3.05-18.94-19.26-4.91-22.15Z" fill="currentColor" />
                                      </svg>
                                      <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                                        <strong>List Price:</strong>  (Also known as Manufacturer's Suggested Retail Price, we do not set or inflate the MSRP. We report it. For our Jerry's manufactured brand products, we establish MSRP based on those of third-party vendors whose products most closely resemble ours in quality and size.)
                                      </span>
                                    </span>
                                  </strong>
                                  <span className="block text-18 font-normal">${variant.compareAtPrice?.amount}</span>
                                </div>
                                <div className='text-blue'>
                                  <strong className="block text-14/none font-semibold">Reg. Price</strong>
                                  <span className="block text-2xl font-semibold">${variant.price?.amount}</span>
                                </div>
                              </div>  
                              <div className="flex w-full mt-j15 justify-end">
                                <div className="border relative border-grey-200 w-[30%]">
                                  <input
                                    type="button"
                                    value="-"
                                    onClick={decreaseQty}
                                    className="absolute left-0 cursor-pointer top-0 bottom-0 w-7"
                                  />
                                  <input
                                    type="text"
                                    maxLength="3"
                                    size="3"
                                    className="text-center w-full h-full px-5 text-xl font-medium"
                                    value={quantity}
                                    readOnly
                                  />
                                  <input
                                    type="button"
                                    value="+"
                                    onClick={increaseQty}
                                    className="absolute right-0 cursor-pointer top-0 bottom-0 w-7"
                                  />
                                </div>
                                <div className="pl-2 w-[70%]">
                                <VariantAddCartBtn
                                  productOptions={productOptions}
                                  selectedVariant={variant}
                                  quantity={quantity}
                                />             
                                </div>
                              </div>
                              <div className='mt-5'>
                                <a href="" className="py-j5 text-base/none inline-block px-j15 border border-brand rounded-3xl text-brand uppercase bg-[linear-gradient(to_right,#ef2456_0%,#ef2456_50%,#ffffff_50%,#ffffff_100%)] bg-[length:200%_100%] hover:text-white bg-[100%_100%] hover:bg-[0_0] transition-all bg-no-repeat">See Full Product Details &gt; </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden"></div>
                        <div className="hidden">V02397</div>
                        <div className="hidden">GOLDEN Heavy Body Acrylics - Transparent Brown Iron Oxide, 2oz Tube</div>
                        </>
                        )}
                      </div>
                    </td>
                    <td className="pr-2">
                      <div className="text-left pl-2">
                        <span>
                          <a className="text-brand pb-1 border-b border-brand-100 w-full" href={variantURL}>
                            <span className="text-center">{variant.sku}</span>
                          </a>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="text-left">
                        <span className="text-left">{variant.metafield?.value || variant.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-center">
                        <span className="text-center">{color}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-center">
                        <span className="text-center">{size}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-center">
                        <span className="text-center">{format}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-center">
                        <span className="text-center">${variant.compareAtPrice?.amount}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-center">
                        <span className="text-center">${variant.price?.amount}</span>
                      </div>
                    </td>
                    <td>
                      <div className=''>
                        <div className='flex items-center gap-1 text-13 mb-2.5 text-green'>
                          <svg width="16" height="16" aria-hidden="true" >
                            <use href="#icon-check"></use>
                          </svg>
                          <span>In Stock</span>
                        </div>
                        <div className='flex flex-col  '>
                          <span className="prod-alert-label hidden">Product Badge:</span>
                          <ul className="badgesFlags flex flex-wrap gap-1">
                            <li className="alert-item w-5 h-5 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.super-sale]:!bg-green [&.super-sale]:!text-white [&.super-sale]:!shadow-none [&.prop-65]:!shadow-none [&.prop-65]:!border-0 [&.super-sale]:!border-0 lpp">
                              <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-5 group-[.prop-65]/tooltip:h-5'>
                                <use href="#icon-lpp" />
                              </svg>
                              <span className="sr-only">LPP</span>
                              <span className="tooltip opacity-0 z-10  absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                                Lowest Price - This item is already at the Best Lowest Price Possible and no further discounts or coupons can be applied.
                              </span>
                            </li>
                            <li className="alert-item w-5 h-5 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.super-sale]:!bg-green [&.super-sale]:!text-white [&.super-sale]:!shadow-none [&.prop-65]:!shadow-none [&.prop-65]:border-0 [&.super-sale]:!border-0 tech-notes tech-specs">
                              <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-5 group-[.prop-65]/tooltip:h-5'>
                                <use href="#icon-tech-notes" />
                              </svg>
                              <span className="sr-only">Tech Notes:</span>
                              <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">Click This Icon To See Tech Notes</span>
                              <div className="no-display tech-specs-text">
                                <p><strong>Color Name:</strong>Alizarin Crimson Hue</p>
                                <p><strong>Series:</strong>7</p>
                                <p><strong>Pigment(s):</strong> Synthetic Organic PR122, PR206, PG7</p>
                                <p><strong>Lightfastness:</strong> ASTM I, Excellent</p>
                                <p><strong>Transparency:</strong> Semi Opaque</p>
                              </div>
                            </li>                          
                            <li className="alert-item w-5 h-5 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.super-sale]:!bg-green [&.super-sale]:!text-white [&.super-sale]:!shadow-none [&.prop-65]:!shadow-none [&.prop-65]:!border-0 [&.super-sale]:!border-0 prop-65">
                              <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-5 group-[.prop-65]/tooltip:h-5'>
                                <use href="#icon-prop-65" />
                              </svg>
                              <span className="sr-only">Prop 65</span>
                              <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                                ⚠ WARNING - This product contains and can expose you to chemical(s) which are known to the State of California to cause cancer, birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.
                              </span>
                            </li>
                            <li className="alert-item w-5 h-5 group/tooltip rounded-sm [&.prop-65]:!bg-[transparent] [&.super-sale]:!bg-green [&.super-sale]:!text-white [&.super-sale]:!shadow-none [&.prop-65]:!shadow-none [&.prop-65]:!border-0 [&.super-sale]:!border-0 super-sale">
                              <svg width="14" height="14" aria-hidden="true" className='group-[.prop-65]/tooltip:w-5 group-[.prop-65]/tooltip:h-5 group-[.super-sale]/tooltip:w-6 group-[.super-sale]/tooltip:h-6'>
                                <use href="#icon-super-sale" />
                              </svg>
                              <span className="sr-only">super-sale</span>
                              <span className="tooltip opacity-0 z-10 absolute bottom-3/4 mb-3 left-1/2 -translate-x-1/2 text-center p-3 rounded-sm shadow-md transition-all bg-white text-13/4 text-blue font-medium w-[215px] group-hover/tooltip:opacity-100 pointer-events-none group-hover/tooltip:bottom-full group-hover/tooltip:pointer-events-auto">
                                ⚠ WARNING - This product contains and can expose you to chemical(s) which are known to the State of California to cause cancer, birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.
                              </span>
                            </li>
                          </ul>
                          <div className="badges flex mt-1 flex-wrap gap-x-j5 text-xs">
                            <span className="attribute-head ">Item Notes</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="flex justify-end flex-wrap">
                      <div className="flex w-full justify-end">
                        <div className="border relative border-grey w-1/2">
                          <input
                            type="button"
                            value="-"
                            onClick={decreaseQty}
                            className="absolute left-0 cursor-pointer top-0 bottom-0 w-7"
                          />
                          <input
                            type="text"
                            maxLength="3"
                            size="3"
                            className="text-center w-full h-full px-5 text-xl font-medium"
                            value={quantity}
                            readOnly
                          />
                          <input
                            type="button"
                            value="+"
                            onClick={increaseQty}
                            className="absolute right-0 cursor-pointer top-0 bottom-0 w-7"
                          />
                        </div>
                        <div className="pl-2 ">
                          <VariantAddCartBtn
                            productOptions={productOptions}
                            selectedVariant={variant}
                            quantity={quantity}
                          />
                        </div>
                      </div>
                      <div className="mt-1 w-48 group/addList text-[70%] relative" role="button">
                        <span className="border border-grey-200 text-grey flex transition-all ps-2.5 pe-10 py-1 w-full h-full relative">
                          <span className='leading-snug'>Add To Lists</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className='absolute end-2 top-1/2 -translate-y-1/2 w-6 aspect-square group-[.active]/addList:-scale-100 group-hover/addList:-scale-100' viewBox="0 0 384 384">
                            <path fill="currentColor" d="M92.62,128.43c5.61-.97,10.94.03,15.17,3.94l84.3,84.33,82.97-82.46c13.06-13.06,34.24.24,26.49,17.55-30.41,34.4-64.89,65.57-96.82,98.74-5.45,5.19-12.54,7.07-19.61,3.86-34.71-31.99-67.2-66.72-100.86-99.95-7.29-8.48-3.01-24.04,8.35-26Z"/>
                          </svg>
                        </span>                        
                        <div className="hidden group-[.active]/addList:flex group-hover/addList:flex absolute top-full min-w-full z-10 end-0 min-w-max flex-col bg-grey-100 border border-grey-200">
                          <button type="button" title="Add To Favorites lists" className=" ps-10 pe-2.5 py-1.5 text-start bg-transparent border-t border-grey-200 first:border-t-0 hover:bg-white transition-all relative">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.9 43.13" className='absolute left-2 top-1/2 -translate-y-1/2 w-6 aspect-square'>
                              <path fill="currentColor" d="M0,14.38v-2.25C.84,4.06,8.28-1.47,16.28.37c3.11.72,5.72,2.59,7.63,5.11.17.04.68-.77.83-.94,9.27-10.05,25.17-2.14,22.94,11.27-.48,2.92-1.84,5.8-3.42,8.28,4.08,3.71,4.85,9.76,1.65,14.33-3.92,5.59-12.08,6.16-16.68,1.11l-5.11,3.59h-.27c-4.54-2.91-8.89-6.23-12.77-9.98C6.27,28.49.49,21.33,0,14.38ZM23.86,10.45c-1.07-2.62-2.44-4.87-4.87-6.41C13.75.71,6.71,2.55,3.73,7.95c-5.02,9.11,4.9,19.89,11.24,25.52.98.87,8.38,6.93,9.02,6.87l3.81-2.67c-1.33-2.56-1.81-5.3-1.12-8.14,1.65-6.87,9.54-10.17,15.71-6.84,3.06-4.75,4.7-10.8,1.14-15.78-4.57-6.4-14.23-5.95-18.19.85-.46.79-.8,1.83-1.27,2.57-.06.09.01.17-.21.12ZM36.1,23.79c-3.31.32-6.28,2.99-7.12,6.18-2.09,7.96,7.24,13.97,13.54,8.7s1.98-15.69-6.43-14.88Z"/>
                              <polygon fill="currentColor" points="38.27 27.32 38.27 30.98 42.01 30.98 42.01 33.32 38.41 33.32 38.27 33.46 38.27 37.07 35.93 37.07 35.93 33.32 32.28 33.32 32.28 30.98 35.93 30.98 35.93 27.32 38.27 27.32"/>
                            </svg>
                            <span>My Favorites/Saved Lists</span>
                          </button>
                          <button type="button" title="Add To Teacher's Cart" className=" ps-10 pe-2.5 py-1.5 text-start bg-transparent border-t border-grey-200 first:border-t-0 hover:bg-white transition-all relative">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.44 15.81" className='absolute left-2 top-1/2 -translate-y-1/2 w-6 aspect-square'>
                              <circle fill="currentColor" cx="3.03" cy="2.98" r="2.98"/>
                              <path fill="currentColor" d="M11.17,7.41c0,.22-.1.44-.28.59l-2.97,2.46c-.12.1-.26.15-.4.16-.21.07-.46.04-.65-.1l-1.38-.97v6.26H0v-6.78c0-1.51,1.23-2.75,2.74-2.75.75,0,1.44.31,1.94.81.03.03.05.05.07.08l2.57,1.8,2.59-2.15c.33-.27.81-.22,1.08.1.12.15.18.32.18.49Z"/>
                              <path fill="currentColor" d="M23.44,1.07v13.47c0,.42-.34.76-.76.76h-13.37c-.43,0-.77-.34-.77-.76,0-.01,0-.03.01-.04-.01-.01-.01-.03-.01-.04v-2.32c0-.42.34-.76.77-.76s.76.34.76.76v1.63h11.84V1.83h-11.84v3.68c0,.42-.34.76-.76.76s-.77-.34-.77-.76V1.07c0-.43.34-.77.77-.77h13.37c.42,0,.76.34.76.77Z"/>
                              <rect fill="currentColor" x="14.84" y="4.37" width="1.53" height="6.88" rx=".76" ry=".76" transform="translate(23.41 -7.79) rotate(90)"/>
                              <rect fill="currentColor" x="15.15" y=".27" width="1.53" height="9" rx=".76" ry=".76" transform="translate(20.69 -11.14) rotate(90)"/>
                              <rect fill="currentColor" x="15.54" y="5.8" width="1.53" height="9.63" rx=".76" ry=".76" transform="translate(26.92 -5.69) rotate(90)"/>
                            </svg>
                            <span>My Teacher/Supply Lists</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Cart Popup Modal */}
      <Modal 
        show={cartPopupOpen} 
        onClose={() => setCartPopupOpen(false)} 
        width="w-3/4 max-w-[462px]"
        footerContent={
          <div className="flex flex-wrap justify-center gap-2">
            <button className="btn w-[48%]" onClick={() => setCartPopupOpen(false)}><span>Continue</span></button>
            <button className="btn w-[48%]"><span>View Cart</span></button>
            <button className="btn btn-link w-[48%]"><span>Go to Checkout</span></button>
          </div>
        }
      >
        <div className='text-center'>
          <p className='mb-10'>{cartMessage}</p>
          {cartItems.length > 0 && (
            <>
              <a href="">
                <img 
                  src={cartItems[0].variant.image.url} 
                  width={165} 
                  height={165} 
                  className='inline-block' 
                  alt={cartItems[0].variant.metafield?.value || cartItems[0].variant.title}
                />
              </a>
              <p className='mb-2.5'>There are <span className='text-brand'>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span> in your cart.</p>
              <p className='mb-2.5'>Cart Subtotal: <span>${cartItems.reduce((sum, item) => sum + (parseFloat(item.variant.price.amount) * item.quantity), 0).toFixed(2)}</span></p>
              <ul className='mb-5'>
                {cartItems.map((item, index) => (
                  <li key={index} className='flex -mb-px items-center p-2.5 border border-grey-200'>
                    <span className='flex-auto max-w-[50%]'>Item #: {item.variant.id.split('/').pop()}</span>
                    <div className='flex-auto max-w-[50%] flex gap-2 items-center'>
                      <span className='flex-none'>Qty #:</span>
                      <div className="border relative border-grey w-20">
                        <input
                          type="button"
                          value="-"
                          onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                          className="absolute left-0 cursor-pointer top-0 bottom-0 w-5"
                        />
                        <input
                          type="text"
                          maxLength="3"
                          size="3"
                          className="text-center w-full h-full px-5 text-sm font-medium"
                          value={item.quantity}
                          readOnly
                        />
                        <input
                          type="button"
                          value="+"
                          onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                          className="absolute right-0 cursor-pointer top-0 bottom-0 w-5"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Modal>

      <Modal show={isOpen} onClose={() => setIsOpen(false)}  width="w-3/4 max-w-[462px]"
      // headerContent={<h2 className="text-xl font-bold">Size Guide</h2>}
      footerContent={
        <div className="flex flex-wrap justify-center gap-2">
          <button className="btn w-[48%]" onClick={() => setIsOpen(false)}><span>Continue</span></button>
          <button className="btn w-[48%]"><span>View Cart</span></button>
          <button className="btn btn-link w-[48%]"><span>Go to Checkout</span></button>
        </div>
      }  
      >
        <div className='text-center'>
          <p className='mb-10'>You added Golden Heavy Body Acrylic - Azo Gold, 2 oz Tube to your shopping cart.</p>
          <a href="">
            <img  src={"../image/charvin-extra-fine-professional-oil-paints-main_1.jpg"} width={165} height={165} className='inline-block' />
          </a>
          <p className='mb-2.5'>There are <span className='text-brand'>6 items</span> in your cart.</p>
          <p className='mb-2.5'>Cart Subtotal: <span>$70.92</span></p>
          <ul className='mb-5'>
            <li className='flex -mb-px items-center p-2.5 border border-grey-200'>
              <span className='flex-auto max-w-[50%]'>Item #: 65481</span>
              <div className='flex-auto max-w-[50%] flex gap-2 items-center'>
                <span className='flex-none'>Qty #:</span>
                <QuantityInput 
                  quantity={quantity}
                  onChange={setQuantity}
                  sectionClasses="max-w-[115px] gap-2"
                  btnClasses="w-6 h-j30  text-white bg-grey-700 hover:bg-grey"
                  fieldClasses="border border-gray-300 rounded"
                />
              </div>
            </li>
          </ul>
        </div>
      </Modal>
    </>
  
    
  );
}