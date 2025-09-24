import React, {Suspense} from 'react';
import {Await, NavLink, useAsyncValue, Link} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Form, useLoaderData, useNavigate} from '@remix-run/react';
import StricyHeader from "./StricyHeader";
import SearchBar from '../components/SearchBar';
import HeaderCtas from '../components/HeaderTop';

export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  return (
    <header className="header flex-wrap pr-0 pl-0">
      <HeaderMainMenus
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <StricyHeader isLoggedIn={isLoggedIn} cart={cart} NavLink={NavLink}  />
    </header>
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
                <ul id="help-content" className='invisible absolute w-48 right-0 top-full border border-grey-200 group-hover:visible z-20 
                [&>li>a]:p-j10 [&>li>a]:pl-5 hover:[&>li>a]:pl-6 
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
          <div className="flex items-center relative lg:items-start -mt-j2 gap-x-j30 min-[1401px]:gap-x-10 ">
            <Link href="/" className="flex-none w-64 md:w-[31.5%] jlg:w-420 -translate-y-px">
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
    <div className="bg-white border-b border-grey-200 w-full hidden md:block relative">
      <div className="  m-auto custom-container">
        <ul className="flex j2xl:-mx-7 font-semibold justify-around">
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
                  {`${count === 9 || count === 10 ? 'font-bold py-2.5 px-j5 lg:p-2.5 text-[1.4vw] lg:text-[.99vw] min-[1800px]:text-lg [&.new]:hover:bg-blue-800 [&.new]:hover:text-white [&.sale]:hover:bg-onsale-300 [&.sale]:hover:text-white transition-all !text-blue hover:bg-blue min-h-[55px] flex items-center hover:!text-white ' : 'font-bold py-2.5 px-j5 lg:p-2.5 text-[1.2vw] lg:text-[.88vw]  min-[1800px]:text-base transition-all !text-blue hover:bg-blue min-h-[55px] flex items-center hover:!text-white'} ${navMenuClass} leading-tight` }
                  end
                  key={item.id}
                  onClick={closeAside}
                  prefetch="intent"
                  to={url}
                 >
                  {item.title}
                </NavLink>
                {submenuSections.length > 0 && (
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 absolute left-0 right-0 top-full z-30 w-full bg-white border border-grey-200 shadow-md">
                    <div className="custom-container p-4">
                      <div className="flex flex-wrap items-start gap-6">
                      {submenuSections.map((section, sIdx) => (
                        <div key={sIdx} className="min-w-[220px] basis-[220px] grow">
                          {(section.menuTitle || section.menuTitleLink) && (
                            <div className="mb-2">
                              {section.menuTitleLink ? (
                                <Link to={section.menuTitleLink} prefetch="intent" className="font-semibold hover:text-brand">
                                  {section.menuTitle || 'View'}
                                </Link>
                              ) : (
                                <div className="font-semibold">{section.menuTitle}</div>
                              )}
                              {section.menuSubtitle ? (
                                <div className="text-xs text-grey-500 mt-0.5">{section.menuSubtitle}</div>
                              ) : null}
                            </div>
                          )}
                          <ul className="space-y-1">
                            {(section.items || []).map((sub, idx) => (
                              <li key={idx} className="whitespace-nowrap">
                                <Link to={sub.link || '#'} prefetch="intent" className="text-sm hover:text-brand">
                                  {sub.title || 'Untitled'}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {(megaObj.featureImage || megaObj.featureImageSecond) && (
                        <div className="min-w-[260px] basis-[260px] flex flex-col gap-4">
                          {megaObj.featureImage && (
                            <Link to={megaObj.featureImageLink || '#'} prefetch="intent" className="block">
                              <img src={megaObj.featureImage} alt="" className="max-w-full h-auto" />
                            </Link>
                          )}
                          {megaObj.featureImageSecond && (
                            <Link to={megaObj.featureImageSecondLink || '#'} prefetch="intent" className="block">
                              <img src={megaObj.featureImageSecond} alt="" className="max-w-full h-auto" />
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

export function HeaderMenu() {
  const menuItems = [];
  return (
    <div className="bg-white border-b border-grey-200 w-full">
      <div className="container file:2xl:container 3xl:px-5 m-auto">
        <ul className="flex text-base font-semibold justify-between">
          {menuItems.map((item, index) => (
            <li key={index}>
               <a href="#" className="p-2.5 transition-all text-blue hover:bg-blue min-h-14 flex items-center hover:text-white">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
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