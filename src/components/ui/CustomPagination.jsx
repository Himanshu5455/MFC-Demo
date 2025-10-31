// import React from 'react';

// const CustomPagination = ({
//   currentPage,
//   totalPages,
//   startItem,
//   endItem,
//   totalItems,
//   rowsPerPage,
//   onPageChange,
//   onRowsPerPageChange,
// }) => {
//   const goToFirstPage = () => onPageChange(1);
//   const goToLastPage = () => onPageChange(totalPages);
//   const goToPrevPage = () => onPageChange(currentPage > 1 ? currentPage - 1 : 1);
//   const goToNextPage = () => onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages);

//   return (
//     <div className="flex justify-between items-center mt-4 p-4 bg-white rounded-lg shadow-sm text-gray-600 text-sm">
//       {/* Left: Rows per page */}
//       <div className="flex items-center gap-2">
//         <span>Rows per page</span>
//         <select
//           value={rowsPerPage}
//           onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
//           className="border border-gray-300 rounded-md px-2 py-1 text-sm"
//         >
//           <option value={5}>5</option>
//           <option value={6}>6</option>
//           <option value={10}>10</option>
//           <option value={20}>20</option>
//         </select>
//       </div>

//       {/* Center: Pagination buttons */}
//       <div className="flex items-center gap-2">
//         <button
//           className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
//           onClick={goToFirstPage}
//           disabled={currentPage === 1}
//         >
//           {"<<"}
//         </button>
//         <button
//           className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
//           onClick={goToPrevPage}
//           disabled={currentPage === 1}
//         >
//           {"<"}
//         </button>
//         <span>
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
//           onClick={goToNextPage}
//           disabled={currentPage === totalPages}
//         >
//           {">"}
//         </button>
//         <button
//           className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
//           onClick={goToLastPage}
//           disabled={currentPage === totalPages}
//         >
//           {">>"}
//         </button>
//       </div>

//       {/* Right: Showing items count */}
//       <div>
//         {totalItems === 0
//           ? "0-0 of 0 patients"
//           : `${startItem}-${endItem} of ${totalItems} patients`}
//       </div>
//     </div>
//   );
// };

// export default CustomPagination;

import React from 'react';

const CustomPagination = ({
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const goToFirstPage = () => onPageChange(1);
  const goToLastPage = () => onPageChange(totalPages);
  const goToPrevPage = () => onPageChange(currentPage > 1 ? currentPage - 1 : 1);
  const goToNextPage = () => onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 p-4 bg-white rounded-lg shadow-sm text-gray-600 text-sm">
      
      {/* Left: Rows per page (hidden on very small screens, shown inline on sm+) */}
      <div className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-auto justify-center sm:justify-start">
        <span className="hidden sm:inline">Rows per page</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full sm:w-auto"
        >
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Center: Pagination buttons */}
      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2 flex-1 sm:flex-initial justify-center">
        <button
          className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          {"<<"}
        </button>
        <button
          className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          {"<"}
        </button>
        <span className="px-2 text-xs sm:text-sm whitespace-nowrap">
          Page {currentPage} / {totalPages}
        </span>
        <button
          className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          {">"}
        </button>
        <button
          className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          {">>"}
        </button>
      </div>

      {/* Right: Showing items count */}
      <div className="order-3 text-xs sm:text-sm text-center sm:text-right">
        {totalItems === 0
          ? "0-0 of 0 patients"
          : `${startItem}-${endItem} of ${totalItems} patients`}
      </div>
    </div>
  );
};

export default CustomPagination;
