import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Card, CardContent, CardHeader } from '../ui/card'

/**
 * DashboardSkeleton — mirrors the Dashboard page layout exactly.
 *
 * Sections:
 * 1. PageHeader (title + subtitle + streak badge)
 * 2. QuickStudyButton card banner
 * 3. KPI grid: 4 stat cards (2 cols mobile, 4 cols desktop)
 * 4. Heatmap section
 * 5. Top books section (2/3 + 1/3 grid)
 */
export function DashboardSkeleton() {
  return (
    <div className="p-md sm:p-lg">
      {/* PageHeader — title + subtitle + streak badge */}
      <div className="flex items-start justify-between mb-lg">
        <div className="space-y-xs">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        {/* Streak badge placeholder */}
        <div className="flex items-center gap-sm bg-muted rounded-lg px-md py-sm">
          <Skeleton className="w-6 h-6 rounded-full" />
          <div className="text-right space-y-xxs">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>

      <div className="space-y-lg">
        {/* Quick Study CTA banner */}
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-md">
            <div className="flex items-center justify-between">
              <div className="space-y-xs">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* KPI Grid — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} size="sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="w-5 h-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Heatmap section */}
        <section>
          <Skeleton className="h-32 w-full rounded-xl" />
        </section>

        {/* Top Books section — 2/3 + 1/3 grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* This Month — 2 cols wide */}
          <div className="md:col-span-2">
            <div className="flex items-baseline justify-between mb-md">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Card size="sm" className="h-full">
              <CardContent className="p-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                      {/* Book cover */}
                      <Skeleton className="w-16 h-24 rounded mb-sm" />
                      <Skeleton className="h-3 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Month featured — 1 col */}
          <div>
            <div className="flex items-baseline justify-between mb-md">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Card size="sm" className="h-full">
              <CardContent className="p-md flex flex-col items-center text-center">
                {/* Larger cover */}
                <Skeleton className="w-20 h-28 rounded mb-sm" />
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24 mt-1" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
