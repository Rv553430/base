'use client'

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-gray-800" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-gray-800 rounded" />
              <div className="h-12 bg-gray-800 rounded" />
            </div>
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-10 bg-gray-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}