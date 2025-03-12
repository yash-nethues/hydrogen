import React from 'react';
function CouponBanners() {
    return (
       <>
        <div className='2xl:container mt-5 mb-5'>
          <ul className='flex border border-grey-200 justify-between'>
            <li className='w-1/3'>
                <a href=""><img className='w-full' src="/image/top-0310-canvas-super-sale-soon_01-min.jpg"  alt="" /></a>
            </li>
            <li className='w-1/3'>
                <a href=""><img className='w-full' src="/image/top-0310-canvas-super-sale-soon_02-min.jpg"  alt="" /></a>
            </li>
            <li className='w-1/3'>
                <a href=""><img className='w-full' src="/image/top-0310-canvas-super-sale-soon_03-min.jpg"  alt="" /></a>
            </li>
          </ul>
        </div>
       </> 
    )
}
export default CouponBanners
