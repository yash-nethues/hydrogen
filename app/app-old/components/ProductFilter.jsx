import React from 'react';
import {useLoaderData, Link} from '@remix-run/react';

function ProductFilter({collection, createFilterUrl, filter}) {
    return (
        <>
         {collection.products.filters.map((filter) => (
                <div key={filter.id} className="flter-link border-b border-grey-200 py-4">
                  <div className="flex justify-between text-base font-semibold uppercase">
                    {filter.label}
                    <button className="relative after:content-[''] after:w-2.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:border-b-gray-500 after:absolute after:right-3 after:top-1/2 after:transform after:-translate-y-1/2 after:rotate-45"></button>
                  </div>
                  <ul className="mt-5 [&>li]:leading-7 [&>li>a]:text-black hover:[&>li>a]:text-brand hover:[&>li>a]:underline">
                    {filter.values.map((value) => (
                      <li key={value.id}>
                        <Link
                          to={createFilterUrl(filter.id, value.input)}
                          className={filters.some(f => 
                            f.name === filter.id && 
                            f.value === value.input
                          ) ? 'font-bold text-brand' : ''}
                        >
                          {value.label} ({value.count})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
        </>
        
    )
}

export default ProductFilter
