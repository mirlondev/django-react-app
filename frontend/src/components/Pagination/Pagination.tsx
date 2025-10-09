import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPageOptions?: number[];
  showItemsPerPageSelector?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  setItemsPerPage,
  itemsPerPageOptions = [5, 10, 20, 50],
  showItemsPerPageSelector = true,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = currentPage * itemsPerPage;

  const ItemsPerPageSelector = () => (
    <select
      value={itemsPerPage}
      onChange={(e) => setItemsPerPage(Number(e.target.value))}
      className="border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:bg-gray-700 dark:bg-form-input dark:text-white dark:focus:border-primary rounded-lg"
    >
      {itemsPerPageOptions.map((option) => (
        <option className="rounded-2xl border-stroke "  key={option} value={option}> 
          {option} per page
        </option>
      ))}
    </select>
  );

  // Don't render pagination if there are no items
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700 sm:flex-row">
      {/* Results Info */}
      <div className="flex items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-black dark:text-white">
            {indexOfFirstItem + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-black dark:text-white">
            {indexOfLastItem > totalItems ? totalItems : indexOfLastItem}
          </span>{" "}
          of{" "}
          <span className="font-medium text-black dark:text-white">
            {totalItems}
          </span>{" "}
          results
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-4 mt-4 sm:mt-0">
        {/* Items Per Page Selector */}
        {showItemsPerPageSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show:
            </span>
            <ItemsPerPageSelector />
          </div>
        )}

        {/* Page Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex items-center justify-center rounded border px-3 py-1.5 text-sm transition-colors ${
                    currentPage === pageNum
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-black hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;