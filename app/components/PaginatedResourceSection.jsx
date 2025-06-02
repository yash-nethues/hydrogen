import React from 'react';

export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) {
  const nodes = connection?.nodes || [];

  const resourcesMarkup = nodes.map((node, index) =>
    children({node, index}),
  );

  return (
    <div>
      {resourcesClassName ? (
        <div className={resourcesClassName}>{resourcesMarkup}</div>
      ) : (
        resourcesMarkup
      )}

      {/* Pagination with numbers */}
      {totalPages > 1 && (
  <div className="flex justify-center mt-8 space-x-2">
    {Array.from({length: totalPages}).map((_, idx) => {
      const pageNum = idx + 1;
      return (
        <button
          key={pageNum}
          className={`px-4 w-10 py-1 ${
            currentPage === pageNum
              ? 'btn-secondary'
              : 'btn-primary'
          }`}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      );
    })}
  </div>
)}
    </div>
  );
}
