import React from 'react'
import { Skeleton } from '../ui/skeleton'

/**
 * SettingsSkeleton — mirrors the Settings page layout exactly.
 *
 * Sections:
 * 1. PageHeader (title + subtitle)
 * 2. Tab bar (4 tabs)
 * 3. Tab content area: generic form-field skeleton for the Import tab
 *    (most users land on Import tab first; form-like layout is generic enough)
 */
export function SettingsSkeleton() {
  return (
    <div className="p-lg max-w-2xl">
      {/* PageHeader */}
      <div className="mb-lg space-y-xs">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Tab bar — 4 tabs */}
      <div className="flex gap-xxs border-b border-border mb-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-8 rounded-t ${i === 0 ? 'w-24' : 'w-20'}`}
          />
        ))}
      </div>

      {/* Tab content: generic import-tab skeleton */}
      <div className="space-y-sm">
        {/* Section title + subtitle */}
        <div className="space-y-xxs">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>

        {/* Drop zone placeholder */}
        <div className="border border-dashed border-border rounded p-xl flex flex-col items-center gap-sm">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-6 w-40 rounded" />
        </div>

        {/* Instructions box */}
        <div className="bg-muted border border-border rounded p-sm space-y-xs">
          <Skeleton className="h-3 w-36" />
          <div className="space-y-xxs">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
