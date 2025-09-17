import React from 'react'
import { Link } from '@remix-run/react';
import { RichTextRenderer } from '~/components/RichTextRenderer';

function CustomShop({ items }) {
    if (!Array.isArray(items) || items.length === 0) return null;
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
                  {items.slice(0, 2).map((entry, idx) => (
                    <div key={idx} className='p-j5 pb-[55px] relative sm:p-2.5 sm:pb-[55px] md:!pb-[100px] tb:p-5 sm:m-2.5 border border-grey-200 rounded-sm bg-white flex-1 max-w-[50%] sm:max-w-none'>
                        {entry.shop_title && (
                          <h3 className='text-xs bg-blue text-white mb-j5 md:text-lg jlg:text-xl jxl:text-[25px] w-full p-j5 md:p-0 text-center md:bg-transparent md:text-blue md:mb-j15 leading-tight' dangerouslySetInnerHTML={{__html: entry.shop_title}} />
                        )}
                        {entry.shop_subtitle && (
                          <h6 className='text-[11px] md:text-sm jxl:text-lg text-center text-blue mb-2.5 md:mb-j30' dangerouslySetInnerHTML={{__html: `<strong>${entry.shop_subtitle}</strong>`}} />
                        )}
                        <div className='flex flex-col md:flex-row md:gap-x-3 tb:gap-x-4 j2xl:gap-x-5'>
                            <div className='customShopImg text-center flex-none md:w-20 tb:w-32 jlg:w-20 jxl:w-32 j2xl:w-[150px]'>
                                <img src={entry.shop_image || "/image/placeholder.jpg"} alt="" className="aspect-square object-cover w-1/2 md:w-full inline-block" />
                            </div>
                            <div className='customShopList h-16 md:h-auto sm:h-24 overflow-hidden text-xs sm:text-13 tb:text-15 p-j5 md:p-0 w-full after:absolute after:inset-0 after:top-auto after:h-4/5 after:bg-gradient-to-t after:from-white after:md:hidden relative'>
                                {entry.shop_content ? (
                                  (() => {
                                    try {
                                      const json = JSON.parse(entry.shop_content);
                                      if (json && typeof json === 'object') {
                                        return <div className="mb-2.5 flex w-full leading-normal flex-col gap-1"><RichTextRenderer content={json} variant="customShop" /></div>;
                                      }
                                    } catch (_) {}
                                    return <div className="mb-2.5 flex w-full leading-normal flex-col gap-1" dangerouslySetInnerHTML={{__html: entry.shop_content}} />
                                  })()
                                ) : null}
                            </div>
                        </div>
                        {entry.shop_button && (
                          <div className='flex absolute  inset-0 md:inset-5 !top-auto p-j5 md:p-0 md:pt-5 border-t border-grey-200 justify-center '>
                              <a href={entry.button_link || "#"} className="btn-primary max-[479px]:p-2.5 max-[479px]:text-[10px] max-[479px]:leading-4 sm:text-xs md:text-15 h-auto uppercase">{entry.shop_button}</a>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
            </div>
        </div>
        </>   
    )
}

export default CustomShop
