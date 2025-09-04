import React from 'react';
import {Form, useLoaderData, useNavigate} from '@remix-run/react';
function SearchBar() {
    return (
        <div className="w-full absolute top-full mt-2.5 md:top-0 md:mt-0 md:relative jlg:pt-1.5 min-[1401px]:pt-0 md:pe-11 jlg:pe-9 min-[1401px]:pe-6">
          <Form method="get" action="/search" className="w-full relative">
            <input  
              className="text-sm md:text-base border border-blue md:border-grey-300 min-h-10 px-4 md:pr-14 rounded-md  md:rounded-sm w-full"
              name="q"
              placeholder="Search From 85,000+ Art Supplies... keyword or item#"
              type="text"
            />
            <button className="absolute hidden md:block right-1.5 top-1"><img src="/image/search-icon.png" width="30" height="31" alt="search" /></button>
          </Form>
        <div className="hidden z-10 jlg:flex absolute -ml-2.5 -bottom-16 max-[1399px]:-bottom-14  min-h-11 items-center justify-center pe-9 min-[1401px]:pe-6 pointer-events-none text-base text-center inset-x-0  group-[.headerSticky]/headerSticky:!hidden">
          <span className="mb-0 pointer-events-auto inline-block font-bold text-blue text-[90%] jxl:text-sm !leading-[22px]">Preferred Choice For Art Supplies & Framing at The Best Values</span>
        </div>
    </div> 
    )
}

export default SearchBar
