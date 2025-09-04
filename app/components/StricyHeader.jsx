import React, { useState, useEffect, Suspense } from 'react';
import {useIsClient} from '~/hooks/useIsClient';
import {Await, NavLink, useAsyncValue, Link} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {Form, useLoaderData, useNavigate} from '@remix-run/react';
import {useAside} from '~/components/Aside';
import SearchBar from "./SearchBar";
import StricyMenu from "./StricyMenu";

function Stricyheader({isLoggedIn, cart, CartBadge}) {
const [stricyMenu, setstricyMenu] = useState(false); 
const handleToggleMenu = () => {
  setstricyMenu(!stricyMenu); // Toggle the menu state
};
const [scrollPosition, setScrollPosition] = useState(0);
const [isVisible, setIsVisible] = useState(false); 
const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 300) {
        setIsVisible(true); 
     
      } else {
        setIsVisible(false); 
        setstricyMenu(false); 
      }

      lastScrollY = currentScrollY;
      setScrollPosition(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    }
  }, [isClient]);



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
       {/* <span className="text-xs absolute top-full font-medium whitespace-nowrap text-brand py-0.5 px-2.5 mt-2.5 bg-white rounded-full border border-grey-200 hidden lg:block">You saved $0.00</span>*/}
      </div>
    );
  }

  function CartBanner() {
    const originalCart = useAsyncValue();
    const cart = useOptimisticCart(originalCart);
    return <CartBadge count={cart?.totalQuantity ?? 0} />;
  }

  function CartToggle({cart}) {
    return (
      <Suspense fallback={<CartBadge count={null} />}>
        <Await resolve={cart}>
          <CartBanner />
        </Await>
      </Suspense>
    );
  }


  function activeLinkStyle({isActive, isPending}) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'text-blue',
    };
  }

  function HeaderCtas({isLoggedIn, cart}) {
    return (
      <div className="flex-none flex gap-x-10 -mt-4 m-j2">
        <div className="flex items-center gap-x-2.5 relative">
          <button className='flex items-center gap-x-2.5' type="button"><span><img src="/image/my-account.png" width="31" height="31" alt="My Account" /></span>
          <span className="font-semibold text-base uppercase text-blue hidden lg:block">Account</span></button>
             {/* <NavLink className="{(isLoggedIn) => (isLoggedIn ? ' hidden lg:block absolute text-xs top-full font-medium whitespace-nowrap  text-brand py-0.5 px-2.5 mt-2.5 bg-white rounded-full border border-grey-200')}" prefetch="intent" to="/account" >
                <Suspense fallback="Sign in">
                  <Await resolve={isLoggedIn} errorElement="Sign in">
                    {(isLoggedIn) => (isLoggedIn ? 'Hello, Sign In' : 'Account')}
                  </Await>
                </Suspense>
            </NavLink> */}
            <div className="absolute hidden top-full  bg-white p-5 w-60 border border-b-grey-600 shadow-md  -left-2/4  -ml-8 mt-2">
              <ul className='[&>li]:p-2 [&>li>a]:text-blue'>
                <li className='text-center mb-2'><a  href="#" className="btn-secondary !text-white py-1.5 leading-0 rounded-sm">Log In</a></li>
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
        <div className="flex items-center gap-x-2.5 relative">
           <CartToggle cart={cart} />  
        </div>
      </div>
    );
  }

  return (
    <div className={`headerSticky group/headerSticky hidden md:fixed inset-x-0 bg-white py-2.5 h-14 -top-16 [&.fixed-header]:top-0 transition-all z-[105] shadow-text ${isClient && isVisible ? 'fixed-header' : ''}`} >
      <div className='container 2xl:container'>
        <div className='flex justify-between gap-8'>
          <div className='flex gap-5  align-middle items-center -top-1 relative '>
            <img className='w-11 relative' src="../image/small_logo.webp" alt="" title="" />
            <span onClick={handleToggleMenu}  className='text-blue cursor-pointer font-medium leading-none mr-8 pr-4 relative text-base
            after:absolute after:content-[""] after:w-2 after:h-2 after:border-b-2 after:-right-[3px] after:rotate-45 after:top-[2px] after:border-r-2  after:border-blue 
            before:left-[-12px] before:top-[5px]'>Shop&nbsp;Departments </span>
          </div>
            <div className='w-full'>
                <SearchBar />
            </div>
          <div className='flex items-center pt-4 w-420'>
            <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
          </div>
        </div>
      </div>

      {stricyMenu && (
         <StricyMenu /> 
      )}
    </div>
  );
}
export default Stricyheader;