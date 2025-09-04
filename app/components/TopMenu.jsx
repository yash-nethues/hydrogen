import { gql } from 'graphql-tag';
import { useLoaderData, Await } from '@remix-run/react';
import { Suspense } from 'react';
import { defer } from '@shopify/remix-oxygen';

/**
 * Loader function to fetch menu data.
 */
export async function loader({ context }) {
    const topMenu = await context.storefront
      .query(TOP_MENU_QUERY, { type: 'top_menus' })
      .then((response) => {
        console.log('GraphQL Response:', response);
        return response;
      })
      .catch((error) => {
        console.error('Failed to load top menu:', error);
        return null;
      });
  
    return defer({ topMenu });
  }
  

export default function TopMenu() {
  const { topMenu } = useLoaderData();

  return (
    <div className="top-menu">
      <Suspense fallback={<div>Loading menu...</div>}>
        <Await resolve={topMenu}>
          {(data) => <MenuContent menu={data} />}
        </Await>
      </Suspense>
    </div>
  );
}

/**
 * Render the menu content.
 */
function MenuContent({ menu }) {
  if (!menu || !menu.metaobjects || menu.metaobjects.edges.length === 0) {
    return <p>No menus found for type: "top_menus"</p>;
  }

  return (
    <div>
      <h2>Top Menus</h2>
      {menu.metaobjects.edges.map(({ node }) => (
        <div key={node.handle}>
          <h3>Menu: {node.handle}</h3>
          <h4>Type: {node.type}</h4>
          <ul>
            {node.fields.map((field) => (
              <li key={field.key}>
                {field.key}: {field.value}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * GraphQL query to fetch top menus by type.
 */
const TOP_MENU_QUERY = gql`
  query TopMenu($type: String!) {
    metaobjects(type: $type, first: 10) {
      edges {
        node {
          handle
          type
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  width
                  height
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
