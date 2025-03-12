import React from 'react'
function SliderItem() {
    return (
        <>
       <div className="swiper-slide h-auto">
           <div className="flex flex-col min-h-full">
                <a href="" className="grow-0">
                    <div className="w-full aspect-square">
                        <img src="/image/tusc-pine-oils-main-group.jpg" alt="" className="w-full h-full object-cover" />
                     </div>
                                        </a>
                                        <div className="flex-grow flex flex-col">
                                            <div className="text-brand p   b-2.5">
                                                <span className="text-xs md:text-sm lg:text-15 leading-none">Now Only From</span>
                                                <p className="block font-bold text-lg md:text-xl lg:text-2xl leading-none">
                                                    <span>$8.98</span>
                                                    <span>- $1,579.99</span>
                                                </p>
                                            </div>
                                            <a className="text-xs text-base-200  min-h-10" href="">Tusc &amp; Pine Artists' Oil Paints</a>
                                            <div className="mt-auto">
                                                <button className="btn-primary">Shop Now</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
        </>
        
    )
}

export default SliderItem;
