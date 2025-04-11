import React, { useState } from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */
export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
}) {

  console.log('connection', connection.products);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = 8; //connection.pageSize;
  const totalCount = 10; //connection.totalCount;

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = async (pageNum) => {
    if (loading) return;

    setLoading(true);
    setCurrentPage(pageNum);
    const cursor = getCursorForPage(pageNum);
    await fetchPageData(cursor);
    setLoading(false);
  };

  const getCursorForPage = (pageNum) => {
    return pageNum;
  };

  const fetchPageData = async (cursor) => {
    console.log("Fetching data for cursor:", cursor);
  };

  return (
    <Pagination connection={connection}>
      {({
        nodes,
        isLoading,
        PreviousLink,
        NextLink,
        hasPreviousPage,
        hasNextPage,
        startCursor,
        endCursor,
      }) => {
        const resourcesMarkup = nodes.map((node, index) => children({ node, index }));

        return (
          <div>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}

            {/* <div className="flex flex-wrap justify-center mt-12">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`btn-secondary px-4 py-2 ${
                        pageNum === currentPage ? 'bg-blue-500' : ''
                      }`}
                      disabled={isLoading || loading}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            </div> */ }
          </div>
        );
      }}
    </Pagination>
  );
}
