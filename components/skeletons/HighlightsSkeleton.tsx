import React from 'react'
import { Skeleton } from '../ui/skeleton'

/**
 * HighlightsSkeleton — mirrors the Highlights page layout exactly.
 *
 * Sections:
 * 1. PageHeader (title + subtitle + Manage Tags button)
 * 2. Toolbar (search + 4 filter dropdowns + sort button)
 * 3. Table (sticky header + 10 body rows)
 * 4. Pagination footer
 */
export function HighlightsSkeleton() {
  return (
    <div className="space-y-md relative h-full flex flex-col w-full px-md sm:px-lg">
      {/* PageHeader area */}
      <div className="flex items-start justify-between pt-lg pb-xs">
        <div className="space-y-xs">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-72" />
        </div>
        {/* Manage Tags button placeholder */}
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-background py-xs -mx-xs px-xs border-b border-transparent">
        <div className="flex flex-wrap items-center gap-xs bg-card p-xs rounded-xl border border-border shadow-sm">
          {/* Search input */}
          <Skeleton className="h-8 flex-1 min-w-[200px] rounded-md" />
          {/* Book filter */}
          <Skeleton className="h-8 w-40 rounded-md" />
          {/* Tag filter */}
          <Skeleton className="h-8 w-36 rounded-md" />
          {/* Status filter */}
          <Skeleton className="h-8 w-32 rounded-md" />
          {/* Sort button */}
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Table container */}
      <div className="flex-1 overflow-auto border border-border rounded-xl bg-card shadow-sm">
        <table className="w-full text-left text-caption">
          {/* Table header */}
          <thead className="bg-muted sticky top-0 z-10 border-b border-border">
            <tr>
              {/* Checkbox col */}
              <th className="px-md py-sm w-[40px]">
                <Skeleton className="h-4 w-4 rounded" />
              </th>
              {/* Book col */}
              <th className="px-md py-sm w-[180px]">
                <Skeleton className="h-3 w-20" />
              </th>
              {/* Highlight col */}
              <th className="px-md py-sm min-w-[300px]">
                <Skeleton className="h-3 w-24" />
              </th>
              {/* Note col */}
              <th className="px-md py-sm w-[280px]">
                <Skeleton className="h-3 w-16" />
              </th>
              {/* Tags col */}
              <th className="px-md py-sm w-[140px]">
                <Skeleton className="h-3 w-12" />
              </th>
              {/* Date col */}
              <th className="px-md py-sm w-[80px]">
                <Skeleton className="h-3 w-12" />
              </th>
              {/* Status col */}
              <th className="px-md py-sm w-[90px]">
                <Skeleton className="h-3 w-14" />
              </th>
            </tr>
          </thead>
          {/* Table body — 10 skeleton rows */}
          <tbody className="divide-y divide-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                {/* Checkbox */}
                <td className="px-md py-sm">
                  <Skeleton className="h-4 w-4 rounded" />
                </td>
                {/* Book + author */}
                <td className="px-md py-sm">
                  <div className="space-y-xxs">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </td>
                {/* Highlight text — variable widths for realism */}
                <td className="px-md py-sm">
                  <div className="space-y-xxs">
                    <Skeleton className={`h-3 ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-4/5'}`} />
                    <Skeleton className={`h-3 ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`} />
                  </div>
                </td>
                {/* Note */}
                <td className="px-md py-sm">
                  {i % 3 !== 2 && <Skeleton className="h-3 w-32" />}
                </td>
                {/* Tags */}
                <td className="px-md py-sm">
                  {i % 2 === 0 && <Skeleton className="h-5 w-16 rounded-full" />}
                </td>
                {/* Date */}
                <td className="px-md py-sm">
                  <Skeleton className="h-3 w-16" />
                </td>
                {/* Status badge */}
                <td className="px-md py-sm">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="py-md flex flex-col sm:flex-row items-center justify-between gap-md border-t border-border">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center gap-xs">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}
