import {useNonce, getShopAnalytics, Analytics} from '@shopify/hydrogen';
import {defer} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
  useRouteLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
} from '@remix-run/react';
import favicon from '~/assets/favicon.svg';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwind from "~/tailwind.css?url";
import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  return false;
};

export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com'
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},

    {
      rel: 'preconnect',
      href: 'http://fonts.googleapis.com',
      referrerPolicy: 'origin'
    },

    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
      crossOrigin: 'anonymous',
      referrerPolicy: 'origin'
    },
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: appStyles},
    {rel: 'stylesheet', href: tailwind},
   
   ];
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = await loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const topMenus = await loadTopMenuData(args); 
  const {storefront, env} = args.context;
  return defer(
    {
      ...deferredData,
      ...criticalData,
      topMenus,
      publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
      shop: getShopAnalytics({
        storefront,
        publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
      }),
      consent: {
        checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
        storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      },
    },
    {
      headers: {
        'Set-Cookie': await args.context.session.commit(),
      },
    },
  );
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    header,
  };
}

async function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  const footer_help_menus = await Promise.all([
    storefront.query(FOOTER_QUERY, {
        cache: storefront.CacheLong(),
        variables: {
          footerMenuHandle: 'footer', 
        },
      })
]);

    const footer_resources_menus = await Promise.all([storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'resources-footer-menu', 
      },
    })
  ]);

    const footer_shopping_menus = await Promise.all([storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'shopping-footer-menu', 
      },
    })
    ]);

  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer_help_menus,
    footer_resources_menus,
    footer_shopping_menus
  };
}


/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
async function loadTopMenuData({ context }, type = "top_menus") {
  try {
    // Fetch Metaobjects (Top Menu Items)
    const metaobjectData = await context.storefront.query(GET_METAOBJECT_QUERY, {
      variables: { type }
    });

    //console.log("Metaobject Response:", metaobjectData);

    const menuItems = metaobjectData?.metaobjects?.edges || [];

    // Transform menu data
    let topMenus = menuItems.map(edge => {
      const item = edge.node.fields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});

      // Ensure menu item has required fields
      return {
        link: item.link || "#",
        icon: item.icon || "", // Will be updated later if needed
        menu: item.menu || "Unnamed Menu"
      };
    });

    //console.log("Processed Menus (Before Fetching Icons):", topMenus);

    // Extract MediaImage IDs for icons
    const mediaImageIds = topMenus
      .filter(item => item.icon?.startsWith("gid://shopify/MediaImage/"))
      .map(item => item.icon);

    //console.log("MediaImage IDs:", mediaImageIds);

    // Fetch image URLs for icons
    if (mediaImageIds.length > 0) {
      const mediaResponse = await context.storefront.query(GET_MEDIA_IMAGES_QUERY, {
        variables: { ids: mediaImageIds }
      });

      //console.log("Media Response:", mediaResponse);

      // Ensure response has nodes and map the image URLs
      const imageUrlMap = (mediaResponse?.nodes || []).reduce((acc, node) => {
        if (node?.id && node?.image?.url) {
          acc[node.id] = node.image.url;
        }
        return acc;
      }, {});

      //console.log("Image URL Map:", imageUrlMap);

      // Replace icon ID with actual image URL
      topMenus = topMenus.map(item => ({
        ...item,
        icon: item.icon.startsWith("gid://shopify/MediaImage/")
          ? imageUrlMap[item.icon] || "/image/placeholder.jpg"
          : item.icon
      }));
    }

    //console.log("Processed Menus (After Fetching Icons):", topMenus);

    return topMenus;
  } catch (error) {
    console.error("Error fetching top menu data:", error);
    return [];
  }
}

/**
 * @param {{children?: React.ReactNode}}
 */
function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />   
        <Meta />
        <Links />
        {/* <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        </style> */}
      </head>
      <body>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout {...data}>{children}</PageLayout>
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <Layout>
      <div className="route-error">
        <h1>Oops</h1>
        <h2>{errorStatus}</h2>
        {errorMessage && (
          <fieldset>
            <pre>{errorMessage}</pre>
          </fieldset>
        )}
      </div>
    </Layout>
  );
}



const GET_MEDIA_IMAGES_QUERY = `#graphql
  query GetMediaImages($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on MediaImage {
        id
        image {
          url
        }
      }
    }
  }
`;

const GET_METAOBJECT_QUERY = `#graphql
  query GetMetaobject($type: String!) {
    metaobjects(type: $type, first: 10) {
      edges {
        node {
          handle
          type
          fields {
            key
            value
          }
        }
      }
    }
  }
`;


/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@remix-run/react').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */