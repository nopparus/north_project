import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [jumpTo, setJumpTo] = useState(currentPage.toString());
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    setJumpTo(currentPage.toString());
  }, [currentPage]);

  const handleJumpTo = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(jumpTo);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setJumpTo(currentPage.toString());
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800 bg-slate-900 text-sm text-slate-300">
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
          }}
          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-teal-500"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={totalItems > 0 ? totalItems : 1000}>All</option>
        </select>
        <span className="ml-2 text-slate-500">
          Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-4">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="First Page"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Last Page"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJumpTo} className="flex items-center gap-2">
          <span>Go to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpTo}
            onChange={(e) => setJumpTo(e.target.value)}
            className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:border-teal-500"
          />
        </form>
      </div>
    </div>
  );
};
