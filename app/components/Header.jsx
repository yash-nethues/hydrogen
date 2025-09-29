import React, {Suspense} from 'react';
import {Await, NavLink, useAsyncValue, Link} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Form, useLoaderData, useNavigate} from '@remix-run/react';
import StricyHeader from "./StricyHeader";
import SearchBar from '../components/SearchBar';
import HeaderCtas from '../components/HeaderTop';
import { useRef, useEffect, useState } from 'react';
import * as FaIcons from 'react-icons/fa';
const { FaBars, FaChevronRight, FaChevronLeft } = FaIcons;

// Generate grid-row CSS for up to 30 rows dynamically
const gridRowsCSS = Array.from({ length: 80 }, (_, i) => 
  `.grid-row-${i + 1} { grid-row: span ${i + 1} / span ${i + 1}; }`
).join(" ");
const gridColsJlgCss = Array.from({ length: 4 }, (_, i) => 
  `.grid-col-jlg-${i + 1} { grid-column-start: ${i + 1}; }`
).join(" ");
const gridColsMdCss = Array.from({ length: 3 }, (_, i) => 
  `.grid-col-md-${i + 1} { grid-column-start: ${i + 1}; }`
).join(" ");
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  


  return (
    <>
      <header className="header flex-wrap pr-0 pl-0">
        <HeaderMainMenus
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
        <StricyHeader isLoggedIn={isLoggedIn} cart={cart} NavLink={NavLink}  />
      </header>

      {/* Dynamic grid-row styles */}
      <style>
        {`
          ${gridRowsCSS}
          @media (min-width: 768px) {
            ${gridColsMdCss}
          }
          @media (min-width: 1200px) {
            ${gridColsJlgCss}
          }
        `}
      </style>
    </>
  );
}

export function HeaderTop({isLoggedIn, cart}) {
  const dataMenu = useLoaderData();
  const topMenus = Array.isArray(dataMenu) ? dataMenu : dataMenu?.topMenus; 

  return (
    <div>
      <div className='max-[479px]:px-2.5 custom-container tb:py-[2px]'>
        <div className="flex items-center justify-between ps-lg-48">
          <span  className='text-xs 2xl:text-13'>
            <Link tabIndex="0" href="" className="text-brand text-[70%] sm:text-[115%] font-bold outline-none">Free Shipping $69+</Link>
          </span>
          <div>
            <ul className="flex 2xl:gap-x-2.5 text-xs -me-2.5 md:-me-3.5 [&>li>a]:min-h-full [&>li]:flex [&>li>a>span]:tracking-normal [&>li.retail-stores]:hidden [&>li.retail-stores]:md:block [&>li.email-sign-up]:hidden [&>li.email-sign-up]:md:block [&>li:nth-last-child(2)>a]:jlg:!gap-x-[9px] [&>li:last-child>a]:jlg:!gap-x-[9px] [&>li:nth-last-child(2)>a]:jlg:!text-xs [&>li:last-child>a]:jlg:!text-xs [&>li:nth-last-child(2)>a]:2xl:!text-13 [&>li:last-child>a]:2xl:!text-13">
              <li className='block md:!hidden relative me-2.5  after:top-1/2 after:-translate-y-1/2 after:absolute after:w-[1px] after:h-4 after:bg-black after:right-0'><Link href="" className="flex items-center py-1.5 pe-[13px]"><img src="/image/my-account.png" width="18" height="18" alt="My Account" /></Link></li>
              <li><Link className="flex items-center py-1.5 pe-[13px] md:pe-[18px] jlg:pe-3.5 jlg:gap-x-[9px] transition-all hover:text-brand jxl:text-xs 2xl:text-13" href="">
                <img src="/image/chat.png" width="16" height="14" alt="Live Chat" /> <span className='hidden jlg:block'>Live Chat</span></Link></li>
              <li><a className="flex items-center py-1.5 pe-[13px] md:pe-[18px] jlg:pe-3.5 jlg:gap-x-[9px] transition-all hover:text-brand jxl:text-xs 2xl:text-13" href="tel:1-800-827-8478">
                <img src="/image/call.png" width="16" height="15" alt="Call" /><span className='hidden jlg:block'>1-800-827-8478</span></a></li>
              <li className="group hover:visible relative me-j15 2xl:me-1 after:content-[''] after:top-1/2 after:-translate-y-1/2 after:absolute after:w-[1px] after:h-4   after:bg-black after:right-0">
                <a className="hidden md:flex items-center relative py-1.5 pe-[13px] md:pe-[18px] jlg:pe-3.5 jlg:gap-x-[9px] transition-all hover:text-brand jxl:text-xs 2xl:text-13 " href="">
                  <img src="/image/help.png" width="16" height="16" alt="Call" /><span className='hidden jlg:block'>Help</span></a>
                <ul id="help-content" className='opacity-0 absolute w-48 right-0 top-full border transition-all translate-y-3 group-hover:translate-y-0 bg-grey-100 border-grey-200 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-20 
                [&>li>a]:p-j10 [&>li>a]:transition-all [&>li>a]:pl-5 hover:[&>li>a]:pl-6 
                [&>li>a]:block [&>li>a]:border-b [&>li>a]:text-sm hover:[&>li>a]:text-brand
                [&>li>a]:relative [&>li>a]:before:transition-all [&>li>a]:before:duration-300 ease-linear [&>li>a]:before:delay-0 [&>li>a]:before:z-[-1]
                [&>li>a]:before:content-[""] [&>li>a]:before:absolute [&>li>a]:before:bg-white [&>li>a]:before:w-0 [&>li>a]:before:h-full
                [&>li>a]:before:left-0 [&>li>a]:before:top-0 hover:[&>li>a]:before:w-full
                '>
                  <li><a href="#">At Your Service</a></li>
                  <li><a href="#">Shipping Info</a></li>
                  <li><a href="#">Contact Us</a></li>
                  <li><a href="#">FAQ's</a></li>
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Product Icon Details</a></li>
                </ul>
              </li>
              
              {topMenus?.slice().map((menu, index) => {
                const menuClass = (menu.menu || "").toLowerCase().replace(/\s+/g, "-");
                  return (
                  <li className={`${menuClass}`}  key={index}>
                    <Link className="flex items-center py-1.5 pe-[13px] md:pe-[18px] jlg:pe-3.5 jlg:gap-x-[7px] tracking-[0.5px] transition-all hover:text-brand jlg:text-11 2xl:text-xs"  href={menu.link} >
                      {menu.icon && (
                        <img src={menu.icon} width="19" height="16" className='w-auto h-auto' alt={menu.menu} />
                      )}
                      <span className='hidden jlg:block'>{menu.menu}</span>
                    </Link>
                  </li>
                  );
                })}        
            </ul>
          </div>
        </div>
      </div>

      {/* Main Header Section */}
      <div className="bg-grey-100 py-4 min-h-[115px] md:pt-8 md:pb-[50px] border-b j2xl:border-t relative border-grey-200 ">
        <div className="custom-container">
          <div className="flex items-center relative lg:items-start -mt-j2 gap-x-5 min-[1401px]:gap-x-10 ">
            <HeaderMenuMobileToggle />
            <Link href="/" className="flex-auto max-w-64 md:flex-none md:w-[31.5%] jlg:w-420 -translate-y-px">
               <img src="/image/logo-red.svg" className='w-full'  alt="Jerry's Art Supplies, Artist Materials & Framing" aria-label="store logo" />
            </Link>
            <SearchBar />
            <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
         
          </div>
         
          {/* Footer Bar with Links */}
          <div className="absolute start-0 end-0 -bottom-px hidden md:block custom-container">
            <div className="">
              <ul className="font-bold uppercase text-xs flex">
                <li><Link href="" className="block rounded-full bg-white text-brand border border-grey-200 hover:bg-brand hover:text-white hover:border-brand transition-all py-0.5 ps-4 pe-6 leading-j18">Special Sale</Link></li>
                <li><Link href="" className="block rounded-full bg-white text-brand border border-grey-200 hover:bg-brand hover:text-white hover:border-brand transition-all py-0.5 -ms-4 ps-4 pe-6 leading-j18">Enter Contest</Link></li>
                <li><Link href="" className="block rounded-full bg-white text-brand border border-grey-200 hover:bg-brand hover:text-white hover:border-brand transition-all py-0.5 -ms-4 ps-4 pe-6 leading-j18">Deals/offers</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
}

export function HeaderMainMenus({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
const className = `header-menu-${viewport}`;
function closeAside(event) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    <>
    <div className={`bg-white border-b border-grey-200 w-full hidden md:block`}>
      <div className=" m-auto custom-container">
        <ul className="flex j2xl:-mx-7 justify-around relative">
          {/* Read mega menu mapping from root loader */}
          {(() => {
            const data = useLoaderData();
            // Support both direct object and nested under root data
            var megaMenus = Array.isArray(data) ? undefined : data?.megaMenus;
            // Fallback to empty object if not present
            megaMenus = megaMenus || {};
            
            return (
              <>
                {viewport === 'mobile' && (
                  <NavLink
                    end
                    onClick={closeAside}
                    prefetch="intent"
                    style={activeLinkStyle}
                    to="/">
                    Home
                  </NavLink>
                )}
                {(menu || FALLBACK_HEADER_MENU).items.map((item, count) => {
                  if (!item.url) return null;
                  // if the url is internal, we strip the domain
                  const url =
                    item.url.includes('myshopify.com') ||
                    item.url.includes(publicStoreDomain) ||
                    item.url.includes(primaryDomainUrl)
                      ? new URL(item.url).pathname
                      : item.url;
                  const navMenuClass = (item.title || '')
                        .toLowerCase()
                        .replace(/\s+/g, '-');
                  const mega = megaMenus[item.title] || megaMenus[item.title?.trim()] || [];
                  const megaObj = Array.isArray(mega) ? {sections: mega} : mega;
                  const submenuSections = megaObj.sections || [];
                  return (
                    <li className={`flex group ${submenuSections.length ? 'has-mega' : ''}`} key={count}>
                      <NavLink className=
                        {`${count === 9 || count === 10 ? 'font-semibold py-2.5 px-j5 lg:p-2.5 text-[1.4vw] lg:text-[.99vw] min-[1800px]:text-lg [&.new]:hover:bg-blue-800  [&.sale]:font-bold [&.new]:font-bold [&.sale]:hover:bg-onsale-300  transition-all !text-blue hover:!text-white hover:bg-blue group-hover:bg-blue group-hover:!text-white min-h-[55px] flex items-center  ' : 'font-semibold py-2.5 px-j5 lg:p-2.5 text-[1.2vw] lg:text-[.88vw]  min-[1800px]:text-base transition-all !text-blue hover:bg-blue group-hover:bg-blue hover:!text-white group-hover:!text-white min-h-[55px] flex items-center '} ${navMenuClass} leading-tight` }
                        end
                        key={item.id}
                        onClick={closeAside}
                        prefetch="intent"
                        to={url}
                      >
                        {item.title}
                      </NavLink>
                      {submenuSections.length > 0 && (
                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 absolute left-0 right-0 top-full z-30 w-full  isolate before:absolute before:inset-0 before:-z-10 before:bg-black/20 ">
                          <div className="custom-container p-2.5 bg-white border border-grey-200 border-t-2 border-t-blue shadow-md">
                            <div className="grid grid-cols-12 p-2.5 gap-x-5 gap-y-j15 md:max-h-[calc(100vh-255px)] overflow-auto">
                              <div className='col-span-12 jlg:col-span-8 grid grid-cols-3 jlg:grid-cols-4 grid-flow-row-dense auto-rows-[10px] items-start gap-x-[18px]'>
                                {submenuSections.map((section, sIdx) => (
                                  <SubmenuSection key={sIdx} section={section} />
                                ))}
                              </div>
                            {(megaObj.featureImage || megaObj.featureImageSecond) && (
                              <div className="hidden jlg:col-span-4 jlg:col-start-9 jlg:flex items-end gap-2.5 flex-col">
                                {megaObj.featureImage && (
                                  <Link to={megaObj.featureImageLink || '#'} prefetch="intent" className="inline-block px-j15">
                                    <img src={megaObj.featureImage} alt="" className="" />
                                  </Link>
                                )}
                                {megaObj.featureImageSecond && (
                                  <Link to={megaObj.featureImageSecondLink || '#'} prefetch="intent" className="inline-block px-j15">
                                    <img src={megaObj.featureImageSecond} alt="" className="" />
                                  </Link>
                                )}
                              </div>
                            )}
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </>
            );
          })()}
        </ul>
      </div>      
    </div>
  </>
  );
}

// Component to handle submenu section with dynamic row-span
function SubmenuSection({ section }) {
  const ref = useRef(null);
  const [rowSpan, setRowSpan] = useState(1);

  // Define row height (should match your CSS grid-auto-rows)
  const ROW_HEIGHT = 10; 

  useEffect(() => {
    if (!ref.current) return;
    const calculateRowSpan = () => {
      const height = ref.current.offsetHeight;
      const span = Math.ceil(height / ROW_HEIGHT);
      setRowSpan(span);
    };
    // Run initially
    calculateRowSpan();

    // Observe element size changes
    const observer = new ResizeObserver(calculateRowSpan);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const DEFAULT_ICON = FaIcons.FaArrowRight;       // default main icon
  const DEFAULT_HOVER_ICON = FaIcons.FaArrowCircleRight; // default hover icon
  const Icon = section.menuIcon && FaIcons[section.menuIcon] ? FaIcons[section.menuIcon] : DEFAULT_ICON;
  const IconHover = section.menuIconHover && FaIcons[section.menuIconHover] ? FaIcons[section.menuIconHover] : DEFAULT_HOVER_ICON;



    return (
    <div ref={ref} className={`grid-row-${rowSpan} group/subMenuItem ${section.menuClass}`}>
      <div className='w-full h-full pb-2.5'>
        {(section.menuTitle || section.menuTitleLink) && (
          
          <div className="font-semibold flex">
            {section.menuTitleLink ? (
              <Link to={section.menuTitleLink} prefetch="intent" className={`uppercase group/link text-blue bg-[#f6f6f6] text-15/[1.3] px-3.5  py-1.5 flex-1 flex flex-wrap items-center gap-1 hover:text-brand  group-[.brand-color]/subMenuItem:!text-brand group-[.no-bg]/subMenuItem:!bg-transparent group-[.icon-left]/subMenuItem:flex-row-reverse group-[.icon-left]/subMenuItem:justify-end group-[.border-bottom]/subMenuItem:border-b` }>
                <span className='flex flex-col'>
                  <span>{section.menuTitle || 'View'}</span>                
                    {section.menuSubtitle ? (
                      <span className="text-11/3 font-normal text-grey-500 -mt-1">{section.menuSubtitle}</span>
                    ) : null
                  }
                </span>
                <span className=' flex-none group-hover/link:text-brand'>
                  {Icon && (<Icon className="w-4 group-hover/subMenuItem:hidden group-[.hover-icon]/subMenuItem:hidden" />)}
                  {IconHover && (<IconHover className="hidden group-hover/subMenuItem:block group-[.hover-icon]/subMenuItem:block w-4" />)}
                </span>
                    
              </Link>
            ) : (
              <div className={`uppercase group/link text-blue bg-[#f6f6f6] text-15/[1.3] px-3.5  py-1.5 flex-1 flex flex-wrap items-center gap-1 hover:text-brand  group-[.brand-color]/subMenuItem:!text-brand group-[.no-bg]/subMenuItem:!bg-transparent group-[.icon-left]/subMenuItem:flex-row-reverse group-[.icon-left]/subMenuItem:justify-end group-[.border-bottom]/subMenuItem:border-b` }>
                <span className='flex flex-col'>
                  <span>{section.menuTitle}</span>
                  {section.menuSubtitle ? (
                      <span className="text-11/3 font-normal text-grey-500 mt-0.5">{section.menuSubtitle}</span>
                    ) : null
                  }
                </span>
                <span className=' flex-none group-hover/link:text-brand'>
                  {Icon && (<Icon className="w-4 group-hover/subMenuItem:hidden group-[.hover-icon]/subMenuItem:hidden" />)}
                  {IconHover && (<IconHover className="hidden group-hover/subMenuItem:block group-[.hover-icon]/subMenuItem:block w-4" />)}
                </span>
              </div>
            )}
            
          </div>
        )}
        {section.items && section.items.length > 0 && (
          <ul className="font-medium">
            {(section.items || []).map((sub, idx) => (
              <li key={idx} className="">
                <Link to={sub.link || '#'} prefetch="intent" className="text-sm/[1.3] px-j15 py-1.5 block hover:text-brand">
                  {sub.title || 'Untitled'}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
export default SubmenuSection;

export function HeaderMenu({
   menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const menuItems = [];
  const className = `header-menu-${viewport}`;
  function closeAside(event) {
      if (viewport === 'mobile') {
        event.preventDefault();
        window.location.href = event.currentTarget.href;
      }
    }
  return (
    <div className={`bg-grey-50 -m-4 overflow-clip ${className} flex`}>        
        <ul className="flex flex-col relative bg-white h-[calc(100svh-64px)] overflow-y-auto overflow-x-hidden">
          {/* Read mega menu mapping from root loader */}
          {(() => {
            const data = useLoaderData();
            // Support both direct object and nested under root data
            var megaMenus = Array.isArray(data) ? undefined : data?.megaMenus;
            // Fallback to empty object if not present
            megaMenus = megaMenus || {};
            
            return (
              <>
                {(menu || FALLBACK_HEADER_MENU).items.map((item, count) => {
                  if (!item.url) return null;
                  // if the url is internal, we strip the domain
                  const url =
                    item.url.includes('myshopify.com') ||
                    item.url.includes(publicStoreDomain) ||
                    item.url.includes(primaryDomainUrl)
                      ? new URL(item.url).pathname
                      : item.url;
                  const navMenuClass = (item.title || '')
                        .toLowerCase()
                        .replace(/\s+/g, '-');
                  const mega = megaMenus[item.title] || megaMenus[item.title?.trim()] || [];
                  const megaObj = Array.isArray(mega) ? {sections: mega} : mega;
                  const submenuSections = megaObj.sections || [];
                  return (
                    <li className={`flex group border-b border-blue/10 ${submenuSections.length ? 'has-mega' : ''}`} key={count}>
                      <NavLink className=
                        {`font-medium [&.new]:hover:bg-blue-800 p-4 [&.sale]:hover:bg-onsale-300 flex-auto transition-all !text-blue group-hover:!text-white group-hover:bg-blue flex leading-tight` }
                        end
                        key={item.id}
                        onClick={closeAside}
                        prefetch="intent"
                        to={url}
                      >
                        {item.title}
                      </NavLink>                      
                      {submenuSections.length > 0 && (
                        <>
                          <span className='flex-none w-[50px] border-l border-blue/10 flex aspect-square  transition-all !text-blue group-hover:!text-white group-hover:bg-blue group-hover:border-white/10'>
                            <FaChevronRight className="w-3 m-auto h-3" />
                          </span>

                          <div className=" transition-all bg-white duration-300 absolute flex flex-col gap-y-3 overflow-y-auto inset-0 z-10 ">
                            <ul className='flex flex-col bg-white'>
                              <li className='flex group border-b bg-blue text-white border-blue/10'>
                                <span className='flex-none w-[50px] border-r border-blue/10 flex aspect-square  transition-all text-white'>
                                  <FaChevronLeft className="w-3 m-auto h-3" />
                                </span>
                                <span className='text-white p-4 font-semibold uppercase'>{item.title}</span>
                              </li>
                              {submenuSections.map((section, sIdx) => (
                                <MobileSubmenu key={sIdx} section={section} />
                              ))}
                            </ul>
                            {(megaObj.featureImage || megaObj.featureImageSecond) && (
                              <div className="flex gap-2.5 flex-col">
                                {megaObj.featureImage && (
                                  <Link to={megaObj.featureImageLink || '#'} prefetch="intent" className=" w-full px-j15">
                                    <img src={megaObj.featureImage} alt="" className=" w-full " />
                                  </Link>
                                )}
                                {megaObj.featureImageSecond && (
                                  <Link to={megaObj.featureImageSecondLink || '#'} prefetch="intent" className=" w-full px-j15">
                                    <img src={megaObj.featureImageSecond} alt="" className=" w-full " />
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </>
            );
          })()}
        </ul>
    </div>
  );
}

export function MobileSubmenu({ section, onOpenSubmenu }) {
  const DEFAULT_ICON = FaIcons.FaArrowRight;

  const Icon = section.menuIcon && FaIcons[section.menuIcon] ? FaIcons[section.menuIcon] : DEFAULT_ICON;

  return (
    <li className={`flex group/submenu border-b border-blue/10 `}>
        {section.menuTitleLink ? (
          <Link to={section.menuTitleLink} prefetch="intent" className="font-medium flex-auto transition-all p-4 !text-blue group-hover/submenu:!text-white group-hover/submenu:bg-blue flex leading-tight">
            {section.menuTitle}
          </Link>
        ) : (
          <span className="font-medium flex-auto transition-all p-4 !text-blue group-hover/submenu:!text-white group-hover/submenu:bg-blue flex leading-tight">{section.menuTitle}</span>
        )}

        {section.items && section.items.length > 0 && (
          <span onClick={() => onOpenSubmenu(section)} className='flex-none w-[50px] border-l border-blue/10 flex aspect-square  transition-all !text-blue group-hover/submenu:!text-white group-hover/submenu:bg-blue group-hover/submenu:border-white/10'>
            <FaChevronRight className="w-3 m-auto h-3" />
          </span>
        )}

      {section.items && section.items.length > 0 && !section.menuTitleLink && (

        <ul className="pl-4">
          {section.items.map((sub, idx) => (
            <li key={idx} className="py-2 border-b border-grey-100">
              <Link to={sub.link || '#'} className="text-sm text-blue hover:text-brand">
                {sub.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}


function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <FaBars className="w-6 h-6 text-blue" />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'text-blue',
  };
}

<StricyHeader />