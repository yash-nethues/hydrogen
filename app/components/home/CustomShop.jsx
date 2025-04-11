import React from 'react'
import {Await, useLoaderData, Link} from '@remix-run/react';

function CustomShop() {
    return (
        <>
         <div className="container 2xl:container mt-16 mt-50 ">
        <div className="flex flex-wrap">
            <div className="relative w-full lg:w-30 text-center text-white items-center bg-blue xl:p-10 before:content-[''] before:absolute before:right-[-16px] before:top-1/2 before:translate-y-[-50%] before:w-0 before:h-0 before:border-t-[25px] before:border-t-transparent before:border-r-[25px] before:border-r-[#334f67] before:border-l-[25px] before:border-l-transparent before:rotate-[-45deg] flex items-center justify-center">
            <div className='p-5'>
            <h2 className="text-white block text-40 font-bold">Custom Shop</h2>
            <span className="text-22 font-bold block pb-10"> Professionally Made <br />Canvas and Frames</span>
            <span className="text-xl block pb-4"> Trust Jerry’s Skilled Craftsman <br />To Custom Make <br />Canvases &amp; Framing</span>
            <span className="text-sm">Made Here in The USA</span>
            </div>
        </div>
            <div className="w-full lg:w-70 bg-grey-100  flex">
                    <div className='p-5 flex gap-4'>
                    <div className='p-5 w-full flex'>
                    <div className='p-5 w-2/4 bg-white w-full text-center pb-4 relative h-full'>
                        <h3 className='text-25 text-blue pb-4 font-medium leading-tight'>Jerry's Custom Stretched <br/> Canvas Department</h3>
                        <h6 className='text-lg text-blue pb-8'><strong>Create Your Professional Custom Canvas Today</strong></h6>
                        <div className='flex pb-28'>
                            <div className='customShopImg w-2/6'>
                                <img src="/image/golden-open-40off-sale-free-brush.jpg" alt="" className="w-full" />
                            </div>
                            <div className="custom-shop-heading relative before:content-[''] before:absolute before:left-full before:top-1/2 before:-translate-y-1/2 before:border-transparent before:border-l-[15px] before:border-l-[#334f67] before:border-t-transparent before:border-b-transparent before:mr-[-15px]"></div>
                            <div className='customShopList  w-3/4 text-left pl-5'>
                            <ul className="">
                            <li className="grid grid-cols-[13px_auto] gap-y-[5px] gap-x-[25px]">
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
  <path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/>
</svg>
                                        74 Types of Canvas (cotton/linen)</li>
                                        <li className="grid grid-cols-[13px_auto] gap-y-[5px] gap-x-[25px]">
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
  <path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/>
</svg> 9 Stretcher Bar</li>
<li className="grid grid-cols-[13px_auto] gap-y-[5px] gap-x-[25px]">
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
  <path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/>
</svg>100's of Custom Configurations</li>
<li className="grid grid-cols-[13px_auto] gap-y-[5px] gap-x-[25px]">
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
  <path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/>
</svg>4 Easy Steps</li>
<li className="grid grid-cols-[13px_auto] gap-y-[5px] gap-x-[25px]">
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
  <path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/>
</svg> Expert Craftmanship backed by 125 years of Industry Experience</li>
                                    </ul>
                            </div>
                        </div>
                        <div className='flex w-full-m-10 text-center absolute bottom-5 pt-5 border-t border-grey-200 justify-center '>
                        <Link to="" className="btn-primary uppercase">Custom Stretched Canvas</Link>
                        </div>
                    </div>
                    </div>
                    <div className='p-5 w-full'>
                    <div className='p-5 w-2/4 bg-white w-full text-center relative h-full'>
                        <h3 className='text-25 text-blue pb-4 font-medium leading-tight'>Jerry's Custom Framing - <br/> Expert Frames </h3>
                        <h6 className='text-lg text-blue pb-8'><b>Large Selection of Custom Frames Online</b></h6>
                        <div className='flex pb-28'>
                            <div className='customShopImg w-2/6'>
                                     <img src="/image/golden-open-40off-sale-free-brush.jpg" alt="" className="w-full" />
                            </div>
                            <div className='customShopList   w-3/4 text-left pl-5 '>
                                <p>Shop a large selection of custom frames in wood or metal. Shop many styles, colors and create you very own custom frame with our online frame making tools. Expertly made here in our warehouse by our in-house frame specialists. Expert Craftmanship backed by 125 years of Industry Experience!</p>
                            </div>
                        </div>
                        <div className='flex w-full-m-10 text-center absolute bottom-5 pt-5 border-t border-grey-200 justify-center'>
                          <Link to="" className="btn-primary uppercase">Custom Frames Online</Link>
                        </div>
                    </div>
                    </div>
                    </div>
            </div>
        </div>
    </div>
        </>   
    )
}

export default CustomShop
