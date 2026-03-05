/**
 * Pagination Component
 * Reusable pagination component with navigation controls
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Pagination component with navigation controls
 * @param {object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {function} props.onPageChange - Function called when page changes
 * @param {boolean} [props.showItemCount=true] - Whether to show item count
 * @param {boolean} [props.showPageNumbers=true] - Whether to show page numbers
 * @param {number} [props.maxVisiblePages=5] - Maximum number of visible page buttons
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element|null} Pagination component or null if not needed
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemCount = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = '',
}) => {
  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  /**
   * Generate page numbers to display
   * @returns {Array} Array of page numbers and separators
   */
  const generatePageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    // Calculate start and end pages
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  /**
   * Handle page change
   * @param {number} page - Page number to navigate to
   */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Calculate item range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Page number buttons
  const pageNumbers = generatePageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 ${className}`}>
      {/* Item count */}
      {showItemCount && (
        <div className="text-sm text-neutral-600">
          Affichage de {startItem} à {endItem} sur {totalItems} éléments
        </div>
      )}

      {/* Pagination controls */}
      {showPageNumbers && (
        <div className="flex items-center space-x-1">
          {/* Previous button */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-l-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            aria-label="Page précédente"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Précédent
          </button>

          {/* Page numbers */}
          <div className="hidden sm:flex">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300">
                    ...
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      page === currentPage
                        ? 'text-primary-600 bg-primary-50 border-primary-500 z-10'
                        : 'text-neutral-700 bg-white border-neutral-300 hover:bg-neutral-50'
                    } border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    aria-current={page === currentPage ? 'page' : undefined}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile page info */}
          <div className="sm:hidden">
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300">
              Page {currentPage} sur {totalPages}
            </span>
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-r-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            aria-label="Page suivante"
          >
            Suivant
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showItemCount: PropTypes.bool,
  showPageNumbers: PropTypes.bool,
  maxVisiblePages: PropTypes.number,
  className: PropTypes.string,
};

/**
 * Simple pagination component with only next/prev buttons
 */
export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-between ${className}`}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        ← Précédent
      </button>
      
      <span className="text-sm text-neutral-600 self-center">
        Page {currentPage} sur {totalPages}
      </span>
      
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Suivant →
      </button>
    </div>
  );
};

SimplePagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

/**
 * Load more pagination component
 */
export const LoadMorePagination = ({
  currentPage,
  totalPages,
  onLoadMore,
  isLoading = false,
  className = '',
}) => {
  if (currentPage >= totalPages) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Chargement...
          </>
        ) : (
          'Charger plus'
        )}
      </button>
    </div>
  );
};

LoadMorePagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

export default Pagination;
