
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AdDetailsSkeleton() {
  return (
    <div className="container px-4 mx-auto py-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content column */}
        <div className="md:col-span-2">
          {/* Title and basic info */}
          <div className="mb-6">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          
          {/* Image gallery skeleton */}
          <div className="mb-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
          
          {/* Tabs skeleton */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="md:col-span-1">
          {/* Seller info skeleton */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden mb-6 bg-white dark:bg-neutral-800">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-700">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-4 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              
              {/* Buttons */}
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
          
          {/* Safety tips skeleton */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden mb-6 bg-white dark:bg-neutral-800">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-700">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="p-4 space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Related ads skeleton */}
      <div className="mt-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
