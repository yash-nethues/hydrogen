import React, {Suspense} from 'react';
import {Await, NavLink, useAsyncValue, Link} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Form, useLoaderData, useNavigate} from '@remix-run/react';
import Stricyheader from "../components/Stricyheader";
/**
 * @param {HeaderProps}
 */
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
      {/* <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
      <Stricyheader isLoggedIn={isLoggedIn} cart={cart} NavLink={NavLink}  />
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
          <li><Link class="flex items-center py-1.5 px-2 lg:px-3.5 gap-x-2.5 transition-all hover:text-brand text-0 lg:text-90 xl:text-13" href="">
              <span><img src="/image/chat.png" width="16" height="14" alt="Live Chat" /></span> Live Chat</Link></li>
           <li>
            <a class="flex items-center py-1.5 px-2 lg:px-3.5 gap-x-2.5 transition-all hover:text-brand text-0 lg:text-90 xl:text-13" href="tel:1-800-827-8478"><span><img src="/image/call.png" width="16" height="15" alt="Call" /></span> 1-800-827-8478</a></li>
           <li className='group hover:visible relative'>
            <a class="flex items-center relative py-1.5 px-2 lg:px-3.5 gap-x-2.5 transition-all hover:text-brand text-0 lg:text-90 xl:text-13 after:content-[''] after:absolute after:w-[1px] after:h-4   after:bg-black after:right-0 " href=""><span><img src="/image/help.png" width="16" height="15" alt="Call" /></span> Help</a>
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

function SearchBar() {
  return (
    <div className="flex-1 xl:pr-6 -mt-j10">
        <Form method="get" action="/search" className="w-full relative">
        <input  
          className="text-base border border-grey-300 h-10 pl-4 pr-14 rounded-sm w-full"
          name="q"
          placeholder="Search From 85,000+ Art Supplies... keyword or item#"
          type="text"
        />
        <button className="absolute right-2 top-1"><img src="/image/search-icon.png" width="30" height="31" alt="search" /></button>
      </Form>
      <div className="absolute bottom-0 pb-2.5 pointer-events-none text-center inset-x-0 hidden lg:block">
        <span className="mb-0 pointer-events-auto inline-block font-bold text-blue text-sm">Preferred Choice For Art Supplies & Framing at The Best Values!</span>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
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
    <div className="bg-white border-b border-grey-200 w-full  hidden lg:block">
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

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
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

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <div className="flex-none flex gap-x-10 -mt-4 m-j2">
      <div className="flex items-center gap-x-2.5 relative w-36">
        <button className='flex items-center gap-x-2.5' type="button"><span><img src="/image/my-account.png" width="31" height="31" alt="My Account" /></span>
        <span className="font-semibold text-base uppercase text-blue hidden lg:block">Account</span></button>
          <NavLink className="{(isLoggedIn) => (isLoggedIn ? ' hidden lg:block absolute text-xs top-full font-medium whitespace-nowrap  text-brand py-0.5 px-2.5 mt-2.5 bg-white rounded-full border border-grey-200')}" prefetch="intent" to="/account" style={activeLinkStyle}>
              <Suspense fallback="Sign in">
                <Await resolve={isLoggedIn} errorElement="Sign in">
                  {(isLoggedIn) => (isLoggedIn ? 'Hello, Sign In' : 'Account')}
                </Await>
              </Suspense>
          </NavLink>
          <div className="absolute hidden top-full  bg-white p-5 w-60 border border-b-grey-600 shadow-md  -left-2/4  -ml-8 mt-2">
            <ul className='[&>li]:p-2 [&>li>a]:text-blue'>
              <li className='text-center mb-2'><a className="" href="#" className="btn-secondary !text-white py-1.5 leading-0 rounded-sm">Log In</a></li>
              <li className='text-center'><a href="#" className='text-19 uppercase transition-all text-base-700 hover:text-brand relative before:absolute before:start-0 before:bottom-0 before:w-full before:h-px before:bg-brand before:origin-right before:scale-x-0 before:scale-y-100 hover:before:scale-x-100 before:transition-transform hover:before:origin-left'>Create Account</a></li>
              <li><a href="#" className='text-base transition-all text-base-700 hover:text-brand relative before:absolute before:start-0 before:bottom-0 before:w-full before:h-px before:bg-brand before:origin-right before:scale-x-0 before:scale-y-100 hover:before:scale-x-100 before:transition-transform hover:before:origin-left'>View/Track Orders</a></li>
              <li><a href="#" className='text-base transition-all text-base-700 hover:text-brand relative before:absolute before:start-0 before:bottom-0 before:w-full before:h-px before:bg-brand before:origin-right before:scale-x-0 before:scale-y-100 hover:before:scale-x-100 before:transition-transform hover:before:origin-left'>Buy Again/Re-Order</a></li>
              <li><a href="#" className='text-base transition-all text-base-700 hover:text-brand relative before:absolute before:start-0 before:bottom-0 before:w-full before:h-px before:bg-brand before:origin-right before:scale-x-0 before:scale-y-100 hover:before:scale-x-100 before:transition-transform hover:before:origin-left'>Recently Viewed</a></li>
              <li><a href="#" className='text-base transition-all text-base-700 hover:text-brand relative before:absolute before:start-0 before:bottom-0 before:w-full before:h-px before:bg-brand before:origin-right before:scale-x-0 before:scale-y-100 hover:before:scale-x-100 before:transition-transform hover:before:origin-left'>My Recent Favorites</a></li>
              <li><a href="#" className='text-base transition-all text-base-700 hover:text-brand relative before:absolute before:start-0 before:bottom-0 before:w-full before:h-px before:bg-brand before:origin-right before:scale-x-0 before:scale-y-100 hover:before:scale-x-100 before:transition-transform hover:before:origin-left'>Teacher List/Cart </a></li>
              <li><a href="#" className='text-base transition-all text-base-700 hover:text-brand relative before:absolute before:start-0 before:bottom-0 before:w-full before:h-px before:bg-brand before:origin-right before:scale-x-0 before:scale-y-100 hover:before:scale-x-100 before:transition-transform hover:before:origin-left'>Favorite List(s)</a></li>
              </ul>
            </div>
      </div>
      <div className="flex items-center gap-x-2.5 relative w-32">
        <CartToggle cart={cart} />
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

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <div className="flex items-center gap-x-2.5 relative min-w-lg-32">
      <span className="relative">
        <img src="/image/cart.png" width="35" height="33" alt="Cart" />
        <span className="bg-brand text-white absolute start-5 flex items-center justify-center text-sm font-semibold -top-2.5 min-w-6 h-6 rounded-full">{count === null ? <span>&nbsp;</span> : count}</span>
      </span>
      <a href="/cart"
        onClick={(e) => {
          e.preventDefault();
          open('cart');
          publish('cart_viewed', {
            cart,
            prevCart,
            shop,
            url: window.location.href || '',
          });
        }} className="font-semibold text-base uppercase text-blue hidden lg:block">Cart</a>
      <span className="text-xs absolute top-full font-medium whitespace-nowrap text-brand py-0.5 px-2.5 mt-2.5 bg-white rounded-full border border-grey-200 hidden lg:block">You saved $0.00</span>
    </div>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
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

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'text-blue',
  };
}
<Stricyheader />
/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */