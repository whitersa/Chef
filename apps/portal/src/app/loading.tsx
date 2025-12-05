export default function Loading() {
  return (
    <>
      {/* Hero Skeleton */}
      <div className="relative bg-gray-900 h-[500px] animate-pulse">
        <div className="absolute inset-0 bg-gray-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="h-12 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="max-w-xl">
            <div className="h-14 bg-gray-700 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col"
            >
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                    <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
