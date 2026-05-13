// src/app/loading.js
export default function Loading() {
  return (
    <section className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="h-40 md:h-56 bg-gray-200 rounded animate-pulse" />

        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`cat-skel-${i}`}
              className="aspect-square rounded-full bg-gray-200 animate-pulse"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`card-skel-${i}`}
              className="border py-2 lg:p-4 grid gap-2 rounded bg-white animate-pulse"
            >
              <div className="h-28 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}