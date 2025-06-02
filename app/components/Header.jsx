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
      <div className='contianer lg:custom-container pt-j3 pb-j3'>
      <div className="flex items-center justify-between ps-lg-48">
        <span>
          <Link tabIndex="0" href="" className="text-brand text-sm xl:text-15 font-bold outline-none">Free Shipping $69+</Link>
        </span>
        <div>
          <ul className="flex text-xs -mx-3.5">
          <li><Link className="flex items-center py-1.5 px-2 lg:px-3.5 gap-x-2.5 transition-all hover:text-brand text-0 lg:text-90 xl:text-13" href="">
              <span><img src="/image/chat.png" width="16" height="14" alt="Live Chat" /></span> Live Chat</Link></li>
           <li>
            <a className="flex items-center py-1.5 px-2 lg:px-3.5 gap-x-2.5 transition-all hover:text-brand text-0 lg:text-90 xl:text-13" href="tel:1-800-827-8478"><span><img src="/image/call.png" width="16" height="15" alt="Call" /></span> 1-800-827-8478</a></li>
           <li className='group hover:visible relative'>
            <a className="flex items-center relative py-1.5 px-2 lg:px-3.5 gap-x-2.5 transition-all hover:text-brand text-0 lg:text-90 xl:text-13 after:content-[''] after:absolute after:w-[1px] after:h-4   after:bg-black after:right-0 " href=""><span><img src="/image/help.png" width="16" height="15" alt="Call" /></span> Help</a>
            <ul id="help-content" className='invisible absolute w-48 right-0 top-full bg-grey-100 border border-grey-200 group-hover:visible z-20 
             [&>li>a]:p-j10 [&>li>a]:pl-5 hover:[&>li>a]:pl-6 
            [&>li>a]:block [&>li>a]:border-b border-grey-200 [&>li>a]:text-sm hover:[&>li>a]:text-brand
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
            
                 {topMenus?.slice().map((menu, index) => (
                  <li key={index}>
                  <Link
                    className="flex items-center py-1.5 px-2 lg:px-3 gap-x-2 tracking-[0.5px]
     transition-all hover:text-brand text-0 lg:text-90 xl:text-97"
                    href={menu.link}
                  >
                    {menu.icon && (
                      <span>
                        <img src={menu.icon} width="16" height="14" alt={menu.menu} />
                      </span>
                    )}
                    {menu.menu}
                  </Link>
                </li>
              ))}        
          </ul>
        </div>
      </div>
      </div>

      {/* Main Header Section */}
      <div className="bg-grey-100 pt-8 pb-12 border-y relative border-grey-200 ">
        <div className="custom-container">
          <div className="flex items-center gap-x-10">
            <Link href="/" className="flex-none -mt-j2">
               <img src="/image/logo-red.svg" className='w-44 sm:w-56 lg:w-72 xl:w-420'  alt="Jerry's Art Supplies, Artist Materials & Framing" aria-label="store logo" />
            </Link>
            <SearchBar />
            <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
         
          </div>
         
          {/* Footer Bar with Links */}
          <div className="absolute start-0 end-0 bottom-0 custom-container">
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
    <div className="bg-white border-b border-grey-200 w-full hidden lg:block">
      <div className=" 3xl:px-5 m-auto custom-container">
        <ul className="flex text-base font-semibold justify-between">
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
            return (
         
              <li key={count}>
                <NavLink className=
                  {`${count === 9 || count === 10 ? 'font-bold p-2 2xl:p-2.5 xl:p-2 2xl:text-lg xl:text-sm md:text-xs block transition-all !text-blue hover:bg-blue min-h-14 flex items-center hover:!text-white' : 'p-2 2xl:p-2.5 xl:p-2 2xl:text-base xl:text-sm md:text-xs block transition-all !text-blue hover:bg-blue min-h-14 flex items-center hover:!text-white'}`}
                  end
                  key={item.id}
                  onClick={closeAside}
                  prefetch="intent"
                  to={url}
                 >
                  {item.title}
                </NavLink>
              </li>
            );
          })}
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
               <a href="#" className="p-2.5 block transition-all text-blue hover:bg-blue min-h-14 flex items-center hover:text-white">
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