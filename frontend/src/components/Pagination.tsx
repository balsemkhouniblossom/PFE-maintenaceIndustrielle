'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  className = '',
}: PaginationProps) {
  const safePage = Number.isFinite(page) ? page : 1;
  const safeLimit = Number.isFinite(limit) ? limit : 10;
  const safeTotalItems = Number.isFinite(totalItems) ? totalItems : 0;
  const safeTotalPages = Number.isFinite(totalPages) ? totalPages : 1;

  const start =
    safeTotalItems === 0
      ? 0
      : (safePage - 1) * safeLimit + 1;

  const end = Math.min(safePage * safeLimit, safeTotalItems);

  const pages: number[] = [];
  for (let current = Math.max(1, page - 2); current <= Math.min(totalPages, page + 2); current += 1) {
    pages.push(current);
  }

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{start}</span> to{' '}
        <span className="font-semibold text-slate-900">{end}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalItems}</span> items
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {pages[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="h-10 min-w-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                1
              </button>
              {pages[0] > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}

          {pages.map((currentPage) => (
            <button
              key={currentPage}
              type="button"
              onClick={() => onPageChange(currentPage)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-medium transition ${currentPage === page
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {currentPage}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="h-10 min-w-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
