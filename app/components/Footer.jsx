import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {/* <ShippingMethod /> */}
          <footer className="mt-10 pt-10 border-t border-b-50 border-t-grey-200 border-b-blue-100">
              <FooterMenu />
              <FooterSecond />
          </footer>
      </Await>
    </Suspense>
  );
}
function ShippingMethod() {
  return (
    <div className="mt-52">
        <div className="2xl:container">
            <div className="flex flex-wrap text-center -mx-3.5">
                <div className="flex-1 w-1/2 md:w-1/4 flex flex-col items-center p-3.5">
                    <img src="/image/amazing-values.png" width="100" height="90" alt="Amazing Values" />
                    <h3 className="text-sm md:text-xl text-base-100 font-semibold py-2.5">Real Materials, Better Values</h3>
                    <p className="text-xs md:text-sm">Save more everyday @ Jerry’s!</p>
                </div>
                <div className="flex-1 w-1/2 md:w-1/4 flex flex-col items-center p-3.5">
                    <img src="/image/fast-shipping.png" width="100" height="90" alt="Fast Shipping" />
                    <h3 className="text-sm md:text-xl text-base-100 font-semibold py-2.5">Free & Fast Shipping $59+*</h3>
                    <p className="text-xs md:text-sm">Orders $35+ (Flat Rate: $2.95*)</p>
                </div>
                <div className="flex-1 w-1/2 md:w-1/4 flex flex-col items-center p-3.5">
                    <img src="/image/art-supplies.png" width="100" height="90" alt="Art Supplies" />
                    <h3 className="text-sm md:text-xl text-base-100 font-semibold py-2.5">Best Fine Art Supply Selection</h3>
                    <p className="text-xs md:text-sm">Art materials curated for artists!</p>
                </div>
                <div className="flex-1 w-1/2 md:w-1/4 flex flex-col items-center p-3.5">
                    <img src="/image/expert-service.png" width="100" height="90" alt="Expert Service" />
                    <h3 className="text-sm md:text-xl text-base-100 font-semibold py-2.5">Personalized & Expert Service</h3>
                    <p className="text-xs md:text-sm">Our experts are here to help you!</p>
                </div>
            </div>
        </div>
    </div>
  );
}
/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu() {
  return (
    <div className="container 2xl:container">
      <div className="flex flex-wrap pb-10 -mx-4">
          <FooterColumn title="Need Help">
              <FooterLink label="At Your Service" />
              <FooterLink label="Contact Us" />
              <FooterLink label="Returns" />
              <FooterLink label="FAQ's" />
              <FooterLink label="Order Status" />
              <FooterLink label="Product, Healthy & Safety Details" />
              <FooterLink label="Terms Of Use" />
          </FooterColumn>
          
          <FooterColumn title="Artist Resources">
              <FooterLink label="Jerry's LIVE" />
              <FooterLink label="Teacher Class Lists" />
              <FooterLink label="Artists in the Spotlight" />
              <FooterLink label="Art Contests" />
              <FooterLink label="Testimonials" />
              <FooterLink label="How To Articles" />
          </FooterColumn>

          <FooterColumn title="More Shopping">
              <FooterLink label="Free Offers" />
              <FooterLink label="Shop by Brands" />
              <FooterLink label="Buy It, Try It Supplies" />
              <FooterLink label="Custom Stretched Canvas" />
              <FooterLink label="Custom Online Framing" />
              <FooterLink label="Best Sellers" />
              <FooterLink label="Online Listing" />
          </FooterColumn>

          <div className="flex-none w-full lg:w-2/5 xl:w-1/4 px-4">
              <h2 className="text-blue text-2xl font-medium pb-4">Email Exclusive Club</h2>
              <p className="text-base text-grey">Subscribe and receive coupon specials, great promos &amp; VIP offers!</p>
              <div className="relative pt-3 pb-5">
                <span className="ext-blue font-semibold text-sm  pb-3 block">Sign Up for Our Newsletter:</span>
                  <label className="relative bg-white border border-grey-200 rounded-full  w-full block p-4 pr-40">
                      <input
                          type="text"
                          className="  "
                          placeholder="Enter your email address"
                      />
                 
                  <button className="absolute end-1.5 inset-y-1.5 rounded-full bg-brand text-base text-white font-semibold transition-all bg-gradient-to-l from-brand-100 to-brand-200 px-6 hover:from-brand-200 hover:to-brand-200">
                      Subscribe
                  </button>
                  </label>
              </div>
              <div>
                  <h2 className="text-blue text-2xl font-medium pb-4">eGift Cards & Gift Cards</h2>
                  <div className="flex gap-x-4">
                      <FooterButton label="Send Now" />
                      <FooterButton label="Check Balance" />
                  </div>
              </div>
          </div>
      </div>
  </div>
  );
}


function FooterSecond() {
  return (
    <div>
      <div className="bg-gray-100 border-t border-t-grey-200 py-8">
        <div className="container 2xl:container">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <h2 className="text-xl text-blue font-medium">Connect With us</h2>
              <ul className="flex flex-wrap justify-center gap-x-1.5">
                <li className="border border-grey-200 flex items-center justify-center p-1.5 w-10 h-10 bg-white">
                    <img className="max-h-full" src="/image/fb.png" alt="Facebook" />
                </li>
                <li className="border border-grey-200 flex items-center justify-center p-1.5 w-10 h-10 bg-white">
                    <img className="max-h-full" src="/image/twitter.png" alt="Twitter" />
                </li>
                <li className="border border-grey-200 flex items-center justify-center p-1.5 w-10 h-10 bg-white">
                    <img className="max-h-full" src="/image/pinterest.png" alt="Pinterest" />
                </li>
                <li className="border border-grey-200 flex items-center justify-center p-1.5 w-10 h-10 bg-white">
                    <img className="max-h-full" src="/image/youtube.png" alt="YouTube" />
                </li>
                <li className="border border-grey-200 flex items-center justify-center p-1.5 w-10 h-10 bg-white">
                    <img className="max-h-full" src="/image/instagram.png" alt="Instagram" />
                </li>
                <li className="border border-grey-200 flex items-center justify-center p-1.5 w-10 h-10 bg-white">
                    <img className="max-h-full" src="/image/b.png" alt="Other" />
                </li>
              </ul>
            </div>

            <div className="text-center">
              <h2 className="text-xl text-blue font-medium">Payment Options</h2>
              <ul className="flex flex-wrap justify-center gap-x-1.5">
                <li className="border border-grey-200 p-1.5 w-16 h-10 flex items-center justify-center bg-white">
                    <img className="max-h-full" src="/image/paypal.png" alt="PayPal" />
                </li>
                <li className="border border-grey-200 p-1.5 w-16 h-10 flex items-center justify-center bg-white">
                    <img className="max-h-full" src="/image/visa.png" alt="Visa" />
                </li>
                <li className="border border-grey-200 p-1.5 w-16 h-10 flex items-center justify-center bg-white">
                    <img className="max-h-full" src="/image/mastercard.png" alt="MasterCard" />
                </li>
                <li className="border border-grey-200 p-1.5 w-16 h-10 flex items-center justify-center bg-white">
                    <img className="max-h-full" src="/image/discover.png" alt="Discover" />
                </li>
                <li className="border border-grey-200 p-1.5 w-16 h-10 flex items-center justify-center bg-white">
                    <img className="max-h-full" src="/image/american.png" alt="American Express" />
                </li>
              </ul>
            </div>

            <div className="text-center">
              <h2 className="text-xl text-blue font-medium">Secure Shopping</h2>
              <ul className="flex flex-wrap justify-center gap-x-1.5">
                <li className="border border-grey-200 p-1.5 h-10 flex items-center justify-center bg-white">
                    <img className="max-h-full" src="/image/trustedsite-icon.jpg" alt="Trusted Site" />
                </li>
                <li className="border border-grey-200 p-1.5 h-10 flex items-center justify-center bg-white">
                    <img className="max-h-full" src="/image/securetrust-assurance-card.jpg" alt="Secure Trust" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue hidden md:block border-t border-t-grey-200 py-12">
        <div className="container 2xl:container py-6">
          <div className="flex flex-wrap text-center -mx-4">
            <div className="flex-none flex flex-col items-center w-1/5">
                <img src="/image/footer-logo.webp" alt="Footer Logo" className="pb-4"/>
                <p className="text-base text-blue-200 pb-4">Proudly Serving Artists For Over 50 Years</p>
                <a href="" className="text-xs text-blue-300 underline hover:text-white transition-all">About Jerry's</a>
            </div>

            <div className="flex-none w-3/5">
                <h2 className="text-2xl text-blue-200 pb-8 font-semibold">Where Artists Shop Online For The Best Quality, Prices and Service!</h2>
                <p className="text-base text-blue-200 pb-4">We are dedicated to you, the artist - Buy direct & shop from our online store for bigger savings!</p>
                <p className="text-base text-blue-200 pb-4">JerrysArtarama.com I Corporate: 6104 Maddry Oaks CT. Raleigh, NC 27616-9997</p>
                <p className="text-base text-blue-200 pb-4">© 1989-2023 Jerry's Artarama All Rights Reserved.</p>
                <p className="text-base text-blue-200 pb-4">TEL: 1-800-U-ARTIST (827-8478)</p>
                <p className="text-blue-200">
                    <a href="" className="text-xs underline  text-blue-400  my-2.5 mx-5 hover:text-white transition-all pt-2 pb-2 pl-5 pr-5">Privacy Policy</a> |
                    <a href="" className="text-xs underline text-blue-400 my-2.5 mx-5 inline-block hover:text-white transition-all pt-2 pb-2 pl-5 pr-5">Terms Of Use </a> |
                    <a href="" className="text-xs underline text-blue-400 my-2.5 mx-5 inline-block hover:text-white transition-all pt-2 pb-2 pl-5 pr-5">Accessibility Statement</a><br />
                    <a href="" className="text-xs underline text-blue-400 my-2.5 mx-5 inline-flex items-center gap-x-1.5 hover:text-white transition-all pt-2 pb-2 pl-5 pr-5">
                        <img src="/image/optout-icon-transparent.svg" width="30" height="14" alt="Opt Out" />
                        Your Privacy Choices
                    </a>|
                    <a href="" className="text-xs underline text-blue-400 my-2.5 mx-5 inline-block hover:text-white transition-all pt-2 pb-2 pl-5 pr-5 ">California Privacy Notice</a> |
                    <a href="" className="text-xs underline text-blue-400 my-2.5 mx-5 inline-block hover:text-white transition-all pt-2 pb-2 pl-5 pr-5">Site Map</a>
                </p>
            </div>

            <div className="flex-none flex flex-col items-center w-1/5">
                <img src="/image/footer-stars.webp" alt="Footer Stars" className="pb-4" />
                <p className="text-base text-blue-200 pb-4">Highly Rated By Our Valued Customers</p>
                <a href="" className="text-xs text-blue-300 underline hover:text-white transition-all">Customer Reviews</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FooterColumn = ({ title, children }) => (
  <div className="flex-none w-full md:w-1/3 lg:w-1/5 xl:w-1/4 px-4">
      <h2 className="text-blue text-2xl font-medium pb-4">{title}</h2>
      <ul>
          {children}
      </ul>
  </div>
);

const FooterLink = ({ label }) => (
  <li className="pt-2.5">
      <a href="" className="text-base transition-all text-base-700 hover:text-brand relative before:absolute before:start-0 before:bottom-0 before:w-full before:h-px before:bg-brand before:origin-right before:scale-x-0 before:scale-y-100 hover:before:scale-x-100 before:transition-transform hover:before:origin-left">
          {label}
      </a>
  </li>
);

const FooterButton = ({ label }) => (
  <a href="" className="flex-1 flex items-center justify-center text-base text-brand font-medium h-12 border-2 rounded-sm border-brand">
      {label}
  </a>
);

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
