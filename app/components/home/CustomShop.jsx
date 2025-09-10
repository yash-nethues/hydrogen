import React from 'react'
import {Await, useLoaderData, Link} from '@remix-run/react';

function CustomShop() {
    return (
        <>
        <div className="container md:px-10 2xl:px-[60px] mt-j30 md:mt-[50px] jlg:mt-[65px]">
            <div className="flex flex-col jlg:flex-row -mx-5 md:mx-0">
                <div className="flex items-center justify-center p-5 relative w-full jlg:w-30 text-center text-white bg-blue before:absolute before:w-[14px] before:h-[14px] before:sm:w-[21px] before:sm:h-[21px] before:rotate-45 before:left-1/2 before:top-full before:jlg:top-1/2 before:jlg:left-full before:-translate-x-1/2 before:-translate-y-1/2 before:bg-blue">
                    <div className='[&_br]:hidden [&_br]:jlg:block'>
                        <h2 className="text-white block text-3xl jlg:text-40 mb-2.5 jlg:mb-10">Custom Shop <span className="mt-j5 text-[50%] sm:text-[55%] block "> Professionally Made <br />Canvas and Frames</span>
                        </h2>
                        <p className="!text-white !leading-snug text-15 sm:text-base jlg:text-xl block"> Trust Jerry’s Skilled Craftsman <br />To Custom Make <br />Canvases &amp; Framing
                            <span className="text-[70%] block mt-2.5">Made Here in The USA</span>
                        </p>                        
                    </div>
                </div>
                <div className="w-full p-j5 pt-j15 md:p-j15 tb:p-j30 jlg:w-70 bg-white sm:bg-grey-100 sm:border sm:border-grey-200 flex sm:flex-wrap">
                    <div className='p-j5 pb-[55px] relative sm:p-2.5 sm:pb-[55px] md:!pb-[100px] tb:p-5 sm:m-2.5 border border-grey-200 rounded-sm bg-white flex-1 max-w-[50%] sm:max-w-none'>
                        <h3 className='text-xs bg-blue text-white mb-j5 md:text-lg jlg:text-xl jxl:text-[25px] w-full p-j5 md:p-0 text-center md:bg-transparent md:text-blue md:mb-j15 leading-tight'>Jerry's Custom Stretched <br/> Canvas Department</h3>
                        <h6 className='text-[11px] md:text-sm jxl:text-lg text-center text-blue mb-2.5 md:mb-j30'><strong>Create Your Professional Custom Canvas Today</strong></h6>
                        <div className='flex flex-col md:flex-row md:gap-x-3 tb:gap-x-4 j2xl:gap-x-5'>
                            <div className='customShopImg text-center flex-none md:w-20 tb:w-32 jlg:w-20 jxl:w-32 j2xl:w-[150px]'>
                                <img src="/image/golden-open-40off-sale-free-brush.jpg" alt="" className="aspect-square object-cover w-1/2 md:w-full inline-block" />
                            </div>
                            <div className='customShopList h-16 md:h-auto sm:h-24 overflow-hidden text-xs sm:text-13 tb:text-15 p-j5 md:p-0 w-full after:absolute after:inset-0 after:top-auto after:h-4/5 after:bg-gradient-to-t after:from-white after:md:hidden relative'>
                                <ul className=" mb-2.5 flex w-full leading-normal flex-col gap-1">
                                    <li className="flex gap-x-2">
                                        <svg  className='flex-none w-3 h-3 tb:w-3.5 tb:h-3.5 mt-px sm:mt-0.5 tb:mt-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.45 8.66">
                                            <line fill="none" stroke="#343434" stroke-miterlimit="10" y1="4.34" x2="13" y2="4.34"/>
                                            <polyline fill="none" stroke="#343434" stroke-miterlimit="10" points="9.77 8.3 13.74 4.33 9.77 0.35"/>
                                        </svg>
                                        <span>74 Types of Canvas (cotton/linen)</span>
                                    </li>
                                    <li className="flex gap-x-2">
                                        <svg  className='flex-none w-3 h-3 tb:w-3.5 tb:h-3.5 mt-px sm:mt-0.5 tb:mt-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.45 8.66">
                                            <line fill="none" stroke="#343434" stroke-miterlimit="10" y1="4.34" x2="13" y2="4.34"/>
                                            <polyline fill="none" stroke="#343434" stroke-miterlimit="10" points="9.77 8.3 13.74 4.33 9.77 0.35"/>
                                        </svg>
                                        <span>9 Stretcher Bar</span>
                                    </li>
                                    <li className="flex gap-x-2">
                                        <svg  className='flex-none w-3 h-3 tb:w-3.5 tb:h-3.5 mt-px sm:mt-0.5 tb:mt-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.45 8.66">
                                            <line fill="none" stroke="#343434" stroke-miterlimit="10" y1="4.34" x2="13" y2="4.34"/>
                                            <polyline fill="none" stroke="#343434" stroke-miterlimit="10" points="9.77 8.3 13.74 4.33 9.77 0.35"/>
                                        </svg>
                                        <span>100's of Custom Configurations</span>
                                    </li>
                                    <li className="flex gap-x-2">
                                        <svg  className='flex-none w-3 h-3 tb:w-3.5 tb:h-3.5 mt-px sm:mt-0.5 tb:mt-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.45 8.66">
                                            <line fill="none" stroke="#343434" stroke-miterlimit="10" y1="4.34" x2="13" y2="4.34"/>
                                            <polyline fill="none" stroke="#343434" stroke-miterlimit="10" points="9.77 8.3 13.74 4.33 9.77 0.35"/>
                                        </svg>
                                        <span>4 Easy Steps</span>
                                    </li>
                                    <li className="flex gap-x-2">
                                        <svg  className='flex-none w-3 h-3 tb:w-3.5 tb:h-3.5 mt-px sm:mt-0.5 tb:mt-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.45 8.66">
                                            <line fill="none" stroke="#343434" stroke-miterlimit="10" y1="4.34" x2="13" y2="4.34"/>
                                            <polyline fill="none" stroke="#343434" stroke-miterlimit="10" points="9.77 8.3 13.74 4.33 9.77 0.35"/>
                                        </svg>
                                        <span>Expert Craftmanship backed by 125 years of Industry Experience</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className='flex absolute  inset-0 md:inset-5 !top-auto p-j5 md:p-0 md:pt-5 border-t border-grey-200 justify-center '>
                            <Link to="" className="btn-primary max-[479px]:p-2.5 max-[479px]:text-[10px] max-[479px]:leading-4 sm:text-xs md:text-15 h-auto uppercase">Custom Stretched Canvas</Link>
                        </div>
                    </div>
                    <div className='p-j5 pb-[55px] relative sm:p-2.5 sm:pb-[55px] md:!pb-[100px] tb:p-5 sm:m-2.5 border border-grey-200 rounded-sm bg-white flex-1 max-w-[50%] sm:max-w-none'>
                        <h3 className='text-xs bg-blue text-white mb-j5 md:text-lg jlg:text-xl jxl:text-[25px] w-full p-j5 md:p-0 text-center md:bg-transparent md:text-blue md:mb-j15 leading-tight'>Jerry's Custom Framing - <br/> Expert Frames </h3>
                        <h6 className='text-[11px] md:text-sm jxl:text-lg text-center text-blue mb-2.5 md:mb-j30'><b>Large Selection of Custom Frames Online</b></h6>
                        <div className='flex flex-col md:flex-row  md:gap-x-3 tb:gap-x-4 j2xl:gap-x-5'>
                            <div className='customShopImg text-center flex-none md:w-20 tb:w-32 jlg:w-20 jxl:w-32 j2xl:w-[150px]'>
                                <img src="/image/golden-open-40off-sale-free-brush.jpg" alt="" className="aspect-square object-cover w-1/2 md:w-full inline-block" />
                            </div>
                            <div className='customShopList [&_p]:mb-2.5 leading-normal h-16 md:h-auto sm:h-24 overflow-hidden text-xs sm:text-13 tb:text-15 p-j5 md:p-0 w-full after:absolute after:inset-0 after:top-auto after:h-4/5 after:bg-gradient-to-t after:from-white after:md:hidden relative'>
                                <p>Shop a large selection of custom frames in wood or metal. Shop many styles, colors and create you very own custom frame with our online frame making tools. Expertly made here in our warehouse by our in-house frame specialists. Expert Craftmanship backed by 125 years of Industry Experience!</p>
                            </div>
                        </div>
                        <div className='flex absolute  inset-0 md:inset-5 !top-auto p-j5 md:p-0 md:pt-5 border-t border-grey-200 justify-center '>
                            <Link to="" className="btn-primary max-[479px]:p-2.5 max-[479px]:text-[10px] max-[479px]:leading-4 sm:text-xs md:text-15 h-auto uppercase">Custom Frames Online</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>   
    )
}

export default CustomShop
