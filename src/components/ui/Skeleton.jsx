import React from 'react';

/**
 * Base Shimmer Primitive
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/70 ${className}`}
      {...props}
    />
  );
}

/**
 * Modern Mobile & Desktop Dashboard Skeleton (Exact Mirror of Live Dashboard)
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* 1. Greeting & Profile Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md opacity-60" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        </div>
      </div>

      {/* 2. Top 3 Metric Stat Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#131722] rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center space-x-2">
              <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
              <Skeleton className="h-6 w-8 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-14 rounded-md opacity-70" />
              <Skeleton className="h-2.5 w-16 rounded-md opacity-50" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Attendance Insights Hero Card (Gauge + Chart Skeleton) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800/90 shadow-md">
        <div className="grid grid-cols-12 gap-3 items-center">
          
          {/* Left Column: Arc Gauge Placeholder */}
          <div className="col-span-5 flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800/80 pr-2 space-y-2">
            <div className="relative w-24 h-16 rounded-t-full border-4 border-zinc-200 dark:border-zinc-800 border-b-0 flex items-end justify-center pb-1">
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
            <Skeleton className="h-2.5 w-16 rounded-md opacity-60" />
            <Skeleton className="h-5 w-20 rounded-full mt-1" />
          </div>

          {/* Right Column: Wave Line + Present/Absent Stats */}
          <div className="col-span-7 flex flex-col justify-between pl-2 space-y-4">
            <div className="h-14 w-full rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/40 p-2 flex items-end">
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="space-y-1">
                <Skeleton className="h-5 w-8 mx-auto rounded-md" />
                <Skeleton className="h-2.5 w-14 mx-auto rounded-md opacity-60" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-8 mx-auto rounded-md" />
                <Skeleton className="h-2.5 w-14 mx-auto rounded-md opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Cards / Schedule Overview Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-2.5 w-20 rounded-md opacity-60" />
                </div>
              </div>
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          ))}
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
                <Skeleton className="w-7 h-7 rounded-xl" />
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-2 w-14 rounded-md opacity-60" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * 1. Metric Stat Card Skeleton (Dashboard, Batches, Fees Overview)
 */
export function MetricCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-2.5 w-40 rounded-md opacity-60" />
        </div>
      ))}
    </div>
  );
}

/**
 * 2. Data Table / List Skeleton (Fees, Attendance, Students)
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between p-3.5 gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-36 rounded-md" />
                <Skeleton className="h-2.5 w-24 rounded-md opacity-60" />
              </div>
            </div>
            {Array.from({ length: cols - 1 }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={`h-4 rounded-md ${
                  cIdx === cols - 2 ? 'w-16 hidden sm:block' : 'w-24'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. Card Grid Skeleton (Students Grid, Batches Grid)
 */
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md opacity-60" />
              </div>
            </div>
            <Skeleton className="w-6 h-6 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-14 rounded-md opacity-60" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-14 rounded-md opacity-60" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>

          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * 4. Student View / Profile Section Skeleton
 */
export function StudentViewSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header Skeleton */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-3xl flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="space-y-1">
              <Skeleton className="h-3 w-16 rounded-md opacity-60" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Row Skeleton */}
      <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl w-full sm:w-fit">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>

      {/* Main Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-52 w-full rounded-3xl" />
          <Skeleton className="h-60 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * 5. Monthly Calendar Grid Skeleton
 */
export function CalendarSkeleton() {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full rounded-lg opacity-60" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-14 sm:h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * 6. Batches Page Skeleton
 */
export function BatchesSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-32">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-3 w-44 rounded-md opacity-60" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#131722] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
            <Skeleton className="w-7 h-7 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-2.5 w-24 rounded-md opacity-60" />
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Batches Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md opacity-60" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 7. Fees Page Skeleton
 */
export function FeesSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-32">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md opacity-60" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
        </div>
      </div>

      {/* Month Selector Bar & Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#131722] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16 rounded-md opacity-60" />
              <Skeleton className="w-6 h-6 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-2.5 w-20 rounded-md opacity-50" />
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-11 flex-1 rounded-2xl" />
        <Skeleton className="h-11 w-full sm:w-44 rounded-2xl" />
      </div>

      {/* Table / List Skeleton */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md opacity-60" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-xl hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 8. Attendance Page Skeleton
 */
export function AttendanceSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-32">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md opacity-60" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
        </div>
      </div>

      {/* Batch and Date Selector Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 rounded-2xl bg-white dark:bg-[#131722] border border-zinc-200/80 dark:border-zinc-800/80 text-center space-y-1.5">
            <Skeleton className="h-6 w-8 mx-auto rounded-md" />
            <Skeleton className="h-2.5 w-12 mx-auto rounded-md opacity-60" />
          </div>
        ))}
      </div>

      {/* Student Attendance List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-3 shadow-xs space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-2.5 w-20 rounded-md opacity-60" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 9. Student Dashboard Skeleton
 */
export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-28">
      {/* Top Banner & Tuition Selector */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md opacity-60" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>

      {/* Hero Attendance & Overview Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/90 shadow-md">
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-5 flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800/80 pr-2 space-y-2">
            <div className="relative w-24 h-16 rounded-t-full border-4 border-zinc-200 dark:border-zinc-800 border-b-0 flex items-end justify-center pb-1">
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
            <Skeleton className="h-2.5 w-16 rounded-md opacity-60" />
          </div>
          <div className="col-span-7 pl-2 space-y-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-2.5 w-36 rounded-md opacity-60" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Action / Status Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
            <Skeleton className="w-7 h-7 rounded-xl" />
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-4 w-10 rounded-md" />
          </div>
        ))}
      </div>

      {/* Today's Class / Homework Skeletons */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full rounded-md opacity-60" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 10. Student Fees Skeleton
 */
export function StudentFeesSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md opacity-60" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>

      {/* Hero Fee Status Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-3 w-48 rounded-md opacity-60" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
            <Skeleton className="h-3 w-16 rounded-md opacity-60" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        ))}
      </div>

      {/* Fee History Receipts List */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-5 w-32 rounded-md" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md opacity-60" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 11. Homework Page Skeleton
 */
export function HomeworkSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-200 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-3 w-44 rounded-md opacity-60" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-11 flex-1 rounded-2xl" />
        <Skeleton className="h-11 w-full sm:w-40 rounded-2xl" />
      </div>

      {/* Homework Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-md opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md opacity-60" />
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-between items-center">
              <Skeleton className="h-3 w-24 rounded-md opacity-60" />
              <Skeleton className="h-7 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 12. Announcements Page Skeleton
 */
export function AnnouncementsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-200 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-3 w-44 rounded-md opacity-60" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>

      {/* Search Bar */}
      <Skeleton className="h-11 w-full rounded-2xl" />

      {/* Announcements List */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded-md opacity-70" />
            <Skeleton className="h-3 w-2/3 rounded-md opacity-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
