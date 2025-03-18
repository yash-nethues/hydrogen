import React, { useState, useRef } from "react";
import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';


function HomeBlog({posts, title}) {
const [activeTab, setActiveTab] = useState(0);
const tabs = [
    title,
    '',
    'Free Video Art Lessons  <span className="block w-full text-60% mt-2.5">Over 12,000 hours of Art Instruction!</span>'
  ];

const tabRefs = useRef([]); 
const tabContent = [
  {
    content: (
      <>
        <Suspense fallback={<div>Loading blog posts...</div>}>
          <Await resolve={posts}>
            {(response) => (
              <div className="flex flex-col sm:flex-row gap-y-5 gap-x-0.5">
                {response.blog.articles.nodes.map((article) => (
                  <div key={article.id} className="bg-white min-h-full flex flex-col sm:w-1/3 p-5">
                    <div className="w-full aspect-[22/9]">
                      <img
                        src={article.image?.url || "/image/default-blog.jpg"}
                        alt={article.image?.altText || "Blog post image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-semibold text-blue text-center my-5 pt-5 pb-5">{article.title}</p>
                    <p className="text-sm text-justify mb-3 pb-3">
                      {article.content.length > 250 ? `${article.content.substring(0, 250)}...` : article.content}
                    </p>
                    <div className="mt-auto text-center">
                      <Link to={`/blogs/news/${article.handle}`}>
                        <button className="bg-blue text-white min-h-9 py-1.5 px-5 rounded-sm">Read More</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </> 
    ),
  },
  {  
    content: (
      <>

      </> 
    ),
  },
  {
    content: (
      <>
        <div className="flex flex-col lg:flex-row gap-5">
            <div className="w-full lg:w-70 aspect-video">
                <iframe className="w-full h-full " src="https://www.youtube.com/embed/U1spGWjF8Rc" title="Acrylic Painting with Soho Acrylics by Dan Nelson Free Art Lesson - Jerry&#39;s Artarama" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                        </div>
                        <div className="w-full lg:w-30 bg-white">
                        <div className=''>
                            </div>
                        </div>
                    </div>

      </> 
    ),
  },
];
    return (
        <>       
        <div className="container 2xl:container mt-16 mt-50">
            <div className="flex flex-col xl:flex-row">
                <div className="w-full lg:w-30 w flex items-center bg-blue p-5 xl:p-10">
                    <ul className="flex flex-col sm:flex-row xl:flex-col w-full gap-y-5 text-center">
                        {tabs.map((tab, index) => (
                        <li className="" key={index}>
                            <button
                            ref={(el) => (tabRefs.current[index] = el)}
                            onClick={() => setActiveTab(index)} 
                            className={`flex-1 border w-100 w-full border-white py-5 px-2.5  text-white text-base/none md:text-22/none md:rounded-sm hover:bg-white hover:text-blue  transition-all relative before:transition-all before:absolute before:bottom-0 xl:before:bottom-[initial] xl:before:right-0 before:border-15 before:border-b-0 xl:before:border-b-15 xl:before:border-r-0 before:border-transparent  hover:before:border-t-white  hover:xl:before:border-t-transparent hover:xl:before:border-l-white  before:left-1/2 xl:before:left-[initial] xl:before:top-1/2 before:-translate-x-1/2  xl:before:translate-x-full before:translate-y-full xl:before:-translate-y-1/2 before:w-0 before:h-0 data-[state=active]:bg-white data-[state=active]:text-blue data-[state=active]:before:border-t-white data-[state=active]:xl:before:border-t-transparent data-[state=active]:xl:before:border-l-white ${
                                activeTab === index
                                ? "bg-blue rounded-3xl text-white font-semibold"
                                : "hover:bg-blue rounded-3xl hover:text-white"
                            }`}
                            >
                           <span dangerouslySetInnerHTML={{ __html: tab }} /> 

                            </button>
                        </li>
                        ))}                     
                    </ul>
                </div>
                <div className="w-full lg:w-70 bg-grey-100 p-5">
                <div className="tab-container">
                    {tabContent[activeTab].content}
                    </div>   
                </div>
            </div>
    </div>
        </>
        
    )
}

export default HomeBlog;
