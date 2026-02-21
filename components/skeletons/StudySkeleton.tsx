import React from 'react'
import { Skeleton } from '../ui/skeleton'

/**
 * StudySkeleton — mirrors the Study page layout exactly.
 *
 * Sections:
 * 1. PageHeader (title + subtitle)
 * 2. Heatmap area
 * 3. "All Books" prominent button (full-width)
 * 4. "By Book" section label
 * 5. Deck table: 5 book rows
 */
export function StudySkeleton() {
  return (
    <div className="p-md sm:p-lg">
      {/* PageHeader */}
      <div className="mb-lg space-y-xs">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-52" />
      </div>

      {/* Heatmap area */}
      <Skeleton className="h-32 w-full rounded-xl mb-lg" />

      {/* All Books prominent button */}
      <Skeleton className="w-full h-[72px] rounded-lg mb-md" />

      {/* "By Book" section label */}
      <div className="mb-xs">
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Deck table — 5 book rows */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-md py-sm ${i < 4 ? 'border-b border-border' : ''}`}
          >
            {/* Book cover + title + author */}
            <div className="flex items-center gap-sm flex-1 min-w-0">
              <Skeleton className="w-8 h-11 rounded shrink-0" />
              <div className="space-y-xxs min-w-0">
                <Skeleton className={`h-4 ${i % 2 === 0 ? 'w-40' : 'w-56'}`} />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            {/* Stats (new / learning / review / total) */}
            <div className="hidden sm:flex items-center gap-md shrink-0 ml-md">
              <div className="text-center">
                <Skeleton className="h-4 w-6 mx-auto mb-xxs" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="text-center">
                <Skeleton className="h-4 w-6 mx-auto mb-xxs" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="text-center">
                <Skeleton className="h-4 w-6 mx-auto mb-xxs" />
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="text-center ml-md">
                <Skeleton className="h-4 w-8 mx-auto mb-xxs" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>

            {/* Mobile: total only */}
            <div className="sm:hidden shrink-0 ml-md text-right">
              <Skeleton className="h-5 w-8 mb-xxs" />
              <Skeleton className="h-3 w-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
