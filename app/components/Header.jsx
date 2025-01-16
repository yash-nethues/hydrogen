import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/**
 * @param {HeaderProps}
 */

export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        <strong>{shop.name}</strong>
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderTop({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;

  return (
    <div className={className}>
      {/* Top Bar with Navigation */}
      <div className="2xl:container flex items-center justify-between">
        <span>
          <a tabIndex="0" href="" className="text-brand text-15 font-bold">Free Shipping $59+</a>
        </span>
        <div>
          <ul className="flex text-xs -mx-3.5">
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand" href="">
                <span><img src="images/chat.png" width="16" height="14" alt="Live Chat" /></span> Live Chat
              </a>
            </li>
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand" href="tel:1-800-827-8478">
                <span><img src="images/call.png" width="16" height="15" alt="Call" /></span> 1-800-827-8478
              </a>
            </li>
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand relative after:absolute after:w-px after:inset-y-2 after:end-0 after:bg-grey" href="#" role="button">
                <span><img src="images/help.png" width="17" height="17" alt="Help" /></span> Help
              </a>
            </li>
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand" rel="nofollow" href="">
                <span><img src="images/order-status.png" width="19" height="18" alt="Order Status" /></span> Order Status
              </a>
            </li>
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand" rel="nofollow" href="">
                <span><img src="images/tag.png" width="16" height="16" alt="Quick Shop" /></span> Quick Shop
              </a>
            </li>
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand" href="">
                <span><img src="images/giftcard.png" width="19" height="13" alt="Gift Cards" /></span> Gift Cards
              </a>
            </li>
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand" href="">
                <span><img src="images/email.png" width="18" height="13" alt="Email Sign Up" /></span> Email Sign Up
              </a>
            </li>
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand" href="">
                <span><img src="images/all-brand.png" width="16" height="16" alt="All Brands" /></span> All Brands
              </a>
            </li>
            <li>
              <a className="flex items-center py-1.5 px-3.5 gap-x-2.5 transition-all hover:text-brand" href="">
                <span><img src="images/bag.png" width="16" height="16" alt="Retail Stores" /></span> Retail Stores
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Header Section */}
      <div className="bg-gray-100 pt-8 pb-12 border-y relative border-grey-200">
        <div className="2xl:container">
          <div className="flex items-center gap-x-10">
            <a href="" className="flex-none">
              <img src="images/logo-red.svg" width="420" height="50" alt="Jerry's Art Supplies, Artist Materials & Framing" aria-label="store logo" />
            </a>
            <div className="flex-1">
              <input className="text-base border border-grey-300 h-10 pl-4 pr-14 rounded-sm w-full" placeholder="Search From 85,000+ Art Supplies... keyword or item#" type="text" />
            </div>
            <div className="flex-none flex gap-x-10">
              <div className="flex items-center gap-x-2.5 relative min-w-32">
                <span><img src="images/my-account.png" width="31" height="31" alt="My Account" /></span>
                <span className="font-semibold text-base uppercase text-blue">Account</span>
                <span className="text-xs absolute top-full font-medium whitespace-nowrap text-brand py-0.5 px-2.5 mt-2.5 bg-white rounded-full border border-grey-200">Hello, Sign In</span>
              </div>
              <div className="flex items-center gap-x-2.5 relative min-w-32">
                <span className="relative">
                  <img src="images/cart.png" width="35" height="33" alt="Cart" />
                  <span className="bg-brand text-white absolute start-5 flex items-center justify-center text-sm font-semibold -top-2.5 min-w-6 h-6 rounded-full">0</span>
                </span>
                <span className="font-semibold text-base uppercase text-blue">Cart</span>
                <span className="text-xs absolute top-full font-medium whitespace-nowrap end-0 text-brand py-0.5 px-2.5 mt-2.5 bg-white rounded-full border border-grey-200">You saved $0.00</span>
              </div>
            </div>
          </div>

          {/* Footer Bar with Links */}
          <div className="absolute start-0 end-0 bottom-0">
            <div className="2xl:container w-full">
              <ul className="font-bold uppercase text-xs flex">
                <li><a href="" className="block rounded-full bg-white text-brand border border-grey-200 hover:bg-brand hover:text-white hover:border-brand transition-all py-0.5 ps-4 pe-6">Special Buys</a></li>
                <li><a href="" className="block rounded-full bg-white text-brand border border-grey-200 hover:bg-brand hover:text-white hover:border-brand transition-all py-0.5 -ms-4 ps-4 pe-6">Free Offers</a></li>
                <li><a href="" className="block rounded-full bg-white text-brand border border-grey-200 hover:bg-brand hover:text-white hover:border-brand transition-all py-0.5 -ms-4 ps-4 pe-6">Big Paints Sale</a></li>
                <li><a href="" className="block rounded-full bg-white text-brand border border-grey-200 hover:bg-brand hover:text-white hover:border-brand transition-all py-0.5 -ms-4 px-4">Exclusives</a></li>
              </ul>
              <div className="absolute bottom-0 pb-2.5 pointer-events-none text-center inset-x-0">
                <span className="mb-0 pointer-events-auto inline-block font-bold text-blue text-sm">Preferred Choice For Art Supplies & Framing at The Best Values!</span>
              </div>
            </div>
          </div>
        </div>
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
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  const menuItems = [
    "Canvases & Painting Surfaces",
    "Paints & Mediums",
    "Brushes",
    "Frames & Matting",
    "Papers & Surfaces",
    "Drawing & Illustration",
    "Art Easels",
    "Artist Studio & Furniture",
    "Resources",
    "NEW",
    "SALE",
    "More"
  ];

  return (
    
    <div className="bg-white border-b border-grey-200">
      <div className="2xl:container 2xl:px-5">
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
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
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
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
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
    color: isPending ? 'grey' : 'black',
  };
}

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
