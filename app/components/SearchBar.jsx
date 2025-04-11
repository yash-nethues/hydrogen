import React from 'react';
import {Form, useLoaderData, useNavigate} from '@remix-run/react';
function SearchBar() {
    return (
        <div className="w-full">
        <Form method="get" action="/search" className="w-full relative">
        <input  
          className="text-base border border-grey-300 h-9 pl-4 pr-14 rounded-sm w-full"
          name="q"
          placeholder="Search From 85,000+ Art Supplies... keyword or item#"
          type="text"
        />
        <button className="absolute right-2 top-1"><img src="/image/search-icon.png" width="30" height="31" alt="search" /></button>
      </Form>
    </div> 
    )
}

export default SearchBar
