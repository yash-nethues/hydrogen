import React, {Suspense} from 'react';
import {Await, NavLink, useAsyncValue, Link} from '@remix-run/react';
import {Form, useLoaderData, useNavigate} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

export default function HeaderCtas({isLoggedIn, cart}) {
  return (
    <div className="flex-none items-center flex gap-x-1.5 pt-1.5 jlg:pt-0 jlg:gap-0">
      <div className="hidden md:flex  gap-x-2.5 relative w-10 jlg:w-[180px]">
        <button className='flex items-center gap-x-2.5' type="button"><span><img src="/image/my-account.png" width="31" height="31" alt="My Account" /></span>
        <span className="font-semibold text-sm jxl:text-base uppercase text-blue hidden jlg:block">Account</span></button>
          <NavLink className="{(isLoggedIn) => (isLoggedIn ? ' hidden jlg:block absolute text-xs top-full font-medium whitespace-nowrap  text-brand py-0.5 px-2.5 mt-2.5 bg-white rounded-full border border-grey-200')}" prefetch="intent" to="/account" style={activeLinkStyles}>
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
      <div className="flex ml-auto md:ml-0 items-center gap-x-2.5 relative ">
        <CartToggle cart={cart} />
      </div>
    </div>
  );
}


export function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <div className="flex items-center gap-x-2.5 relative w-9 jlg:min-w-[122px]">
      <span className="absolute w-9 left-0 top-4 jlg:top-3 -translate-y-1/2 aspect-square">
        <img src="/image/cart.png" width="35" height="33" alt="Cart" />
        <span className="bg-brand text-white absolute start-5 flex items-center justify-center text-sm/none font-semibold -top-2 jlg:-top-1 min-w-[21px] h-[21px] rounded-full">{count === null ? <span>&nbsp;</span> : count}</span>
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
        }} className="font-semibold text-0 jlg:text-sm jxl:text-base pl-[50px] min-h-[30px] uppercase text-blue">Cart</a>
      <span className="text-xs/normal absolute top-full right-0 font-medium whitespace-nowrap text-brand py-0.5 px-2.5 mt-2.5 bg-white rounded-full border border-grey-200 hidden jlg:block">You saved * $0.00</span>
    </div>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
export function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

export function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function activeLinkStyles({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'text-blue',
  };
}