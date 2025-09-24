import React, { useState, useRef, Suspense } from "react";
import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';


function HomeBlog({posts, title}) {
const [activeTab, setActiveTab] = useState(0);
const tabs = [
    title,
    'Free Video Art Lessons <br/>  <div class="block w-full text-sm mt-2.5">Over 12,000 hours of Art Instruction!</div>'
  ];

const tabRefs = useRef([]); 
const tabContent = [
  {
    content: (
      <>
        <Suspense fallback={<div>Loading blog posts...</div>}>
          <Await resolve={posts}>
            {(response) => (              
              <div className="flex flex-col md:flex-row gap-y-5 gap-x-0.5">
                {response.blog.articles.nodes.map((article) => (
                  <div key={article.id} className="bg-white min-h-full flex flex-col md:w-1/3 p-5">
                    <div className="w-full aspect-[395/160]">
                      <img
                        src={article.image?.url || "/image/default-blog.jpg"}
                        alt={article.image?.altText || "Blog post image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-semibold text-sm text-blue text-center my-5 ">{article.title}</p>
                    <div className="text-13 text-justify mb-3 pb-3">
                      {article.content.length > 250 ? `${article.content.substring(0, 250)}...` : article.content}
                    </div>
                    <div className="mt-auto text-center">
                      <Link className="btn-primary min-h-[38px] px-5 rounded-sm" to={`/blogs/news/${article.handle}`}>
                        <span>Read More</span>
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
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-70 aspect-video">
              <iframe className="w-full h-full " src="https://www.youtube.com/embed/U1spGWjF8Rc" title="Acrylic Painting with Soho Acrylics by Dan Nelson Free Art Lesson - Jerry&#39;s Artarama" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>
          <div className="w-full lg:w-30 bg-white px-[25px]">
            <Suspense fallback={<div>Loading blog posts...</div>}>
              <Await resolve={posts}>
                {(response) => (
                  <div className=" relative">
                    <Swiper
                      modules={[Navigation, Pagination, Scrollbar, A11y]}
                      spaceBetween={10}
                      navigation={{ nextEl: ".bp_arrow-right", prevEl: ".bp_arrow-left" }}
                      pagination={{ clickable: true }}
                      scrollbar={{ draggable: true }}
                      slidesPerView={1}
                      >
                      {response.blog.articles.nodes.map((article) => (
                        <SwiperSlide key={article.id} className='h-auto'>
                          <div className="flex tb:flex-col">
                            <Link className="flex-1" to={`/blogs/news/${article.handle}`}>
                              <div className="w-full h-full aspect-[270/148]">
                                <img
                                  src={article.image?.url || "/image/default-blog.jpg"}
                                  alt={article.image?.altText || "Blog post image"}
                                  className="w-full h-full object-cover" loading="lazy"
                                />
                              </div>
                            </Link>
                            <div className="flex-1 p-2.5 text-center">
                              <Link to={`/blogs/news/${article.handle}`} className="font-semibold text-sm hover:text-brand transition-all">{article.title}</Link>
                              <div className="text-sm my-2.5 hidden sm:block">
                                {article.content.length > 100 ? `${article.content.substring(0, 100)}...` : article.content}
                              </div>
                              <div className="mt-auto text-center">
                                <Link className="btn-primary min-h-[38px] w-full px-5 rounded-sm" to={`/blogs/news/${article.handle}`}>
                                  <span>Watch Now</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                        
                      ))}
                    </Swiper>
                    <button className="bp_arrow-left tb:top-0 tb:translate-y-0 h-[50px] before:-mt-1 before:w-j15 before:h-j15 -left-[25px] bg-white arrow swiper-button-prev before:ml-2"></button>
                    <button className="bp_arrow-right tb:top-0 tb:translate-y-0 h-[50px] before:-mt-1 before:w-j15 before:h-j15 -right-[25px]  bg-white arrow swiper-button-next before:mr-0.5"></button>
                  </div>
                )}                          
              </Await>
            </Suspense>
          </div>
        </div>
      </> 
    ),
  },
];
    return (
        <>       
        <div className="container mt-j30 md:mt-[50px] jlg:mt-[65px] md:px-10 2xl:px-[60px]">
            <div className="flex flex-col jlg:flex-row -mx-5 md:mx-0">
                <div className="w-full jlg:w-30 w flex items-center bg-blue p-px sm:p-5 tb:p-10">
                    <ul className="flex flex-col sm:flex-row jlg:flex-col w-full md:gap-y-5 text-center">
                        {tabs.map((tab, index) => (
                        <li className="flex-1" key={index}>
                            <button
                            ref={(el) => (tabRefs.current[index] = el)}
                            onClick={() => setActiveTab(index)} 
                            className={`flex-1 border w-100 w-full 
                              border-white py-5 px-2.5 text-base/none [&>div>div]:!text-[60%]/none md:text-22/none md:rounded-sm hover:bg-white hover:text-blue transition-all relative before:absolute before:w-[21px] before:h-[21px] before:bg-blue before:rotate-45 before:top-full before:transition-all before:left-1/2 before:-translate-x-1/2 before:-z-10 before:-translate-y-1/2 before:jlg:top-1/2 before:jlg:left-full
                              
                              ${
                                activeTab === index
                                ? "bg-white text-blue before:bg-white before:z-10"
                                : "hover:bg-blue  text-white hover:before:bg-white hover:before:z-10"
                            }`}
                            >
                              <div dangerouslySetInnerHTML={{ __html: tab }} /> 

                            </button>
                        </li>
                        ))}                     
                    </ul>
                </div>
                <div className="w-full jlg:w-70 bg-grey-100 border border-grey-200 p-5">
                  {tabContent[activeTab].content}
                </div>
            </div>
          </div>
        </>
        
    )
}

export default HomeBlog;
