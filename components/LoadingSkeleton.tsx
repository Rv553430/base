'use client'

import { memo } from 'react'

// Optimized skeleton card - memoized to prevent re-renders
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="aspect-square bg-gray-800 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-800 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-800 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="h-10 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
})

// Reduced number of skeleton cards for faster initial render
export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}