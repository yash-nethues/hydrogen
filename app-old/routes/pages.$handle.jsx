import { defer } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({ data }) => {
  return [{ title: `Hydrogen | ${data?.page.title ?? ''}` }];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({ ...deferredData, ...criticalData });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({ context, params }) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{ page }] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', { status: 404 });
  }

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({ context }) {
  return {};
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const { page } = useLoaderData();
  console.log('listCollection',page.listCollections)
  return (
    <div className="page">
      <header className="custom-container" style={page.bannerImage?.reference?.image?.url
        ? { backgroundImage: `url(${page.bannerImage.reference.image.url})` }
        : {}}>

        <h1>{page.title}</h1>
        {page.bannerContent?.value && <p>{page.bannerContent.value}</p>}

        <a href="#">...Read More+</a>

      </header>

        <div className="breadcrumb">
          <ul className="custom-container flex">
            <li><a href="/">Home</a></li>
            <li>/</li>
            <li className="active">{page.title}</li>
          </ul>
        </div>
        
        
        {page.listCollections?.references?.edges?.length > 0 && (
            <div className="page-list-collections">
              <div className="text-center pb-20">
                <h2 className="text-blue text-48 font-bold custom-h2 relative pb-8">
                  {page.title} by Category
                </h2>
              </div>

              <div className="collection-lists flex custom-container">
              {page.listCollections.references.edges.map(({ node }) => (
                  <div key={node.id} className="sub-category">
                    <a href={`/collections/${node.handle}`}>
                      <div className="sub-category-thumb">
                        {node.image?.url ? (
                          <img src={node.image.url} alt={node.title} className="image-thumb" />
                        ) : (
                          <img src="/default-image.jpg" alt="Default" className="image-thumb" />
                        )}
                        <h6 className="subcategory-name">{node.title}</h6>
                      </div>
                    </a>
                  </div>
                ))}
                </div>

            </div>
        )}



{page.listBrands?.references?.edges?.length > 0 && (
            <div className="page-list-collections">
              <div className="text-center pb-20">
                <h2 className="text-blue text-48 font-bold custom-h2 relative pb-8">
                  {page.title} by Brands
                </h2>
              </div>

              <div className="collection-lists flex custom-container">
              {page.listBrands.references.edges.map(({ node }) => (
                  <div key={node.id} className="sub-category">
                    <a href={`/collections/${node.handle}`}>
                      <div className="sub-category-thumb">
                        {node.image?.url ? (
                          <img src={node.image.url} alt={node.title} className="image-thumb" />
                        ) : (
                          <img src="/default-image.jpg" alt="Default" className="image-thumb" />
                        )}
                        <h6 className="subcategory-name">{node.title}</h6>
                      </div>
                    </a>
                  </div>
                ))}
                </div>

            </div>
        )}

<div className="faqs custom-container pt-8">
  <h2>{page.title}</h2>
  <div dangerouslySetInnerHTML={{ __html: page.body }} />
</div>


      {/* <main className={page.handle} dangerouslySetInnerHTML={{ __html: page.body }} /> */}

    </div>
  );
}

const PAGE_QUERY = `#graphql
query Page(
  $language: LanguageCode
  $country: CountryCode
  $handle: String!
) @inContext(language: $language, country: $country) {
  page(handle: $handle) {
    id
    title
    body
    handle
    seo {
      description
      title
    }
    bannerContent: metafield(namespace: "custom", key: "banner_content") { value }
    bannerImage: metafield(namespace: "custom", key: "banner_image") {
      reference {
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
    }
    listCollections: metafield(namespace: "custom", key: "list_collections") {
      references(first: 10) {
        edges {
          node {
            ... on Collection {
              id
              title
              handle
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
    listBrands: metafield(namespace: "custom", key: "list_brands") {
      references(first: 10) {
        edges {
          node {
            ... on Collection {
              id
              title
              handle
              
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
}

`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
