export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Header Skeleton */}
      <div className="pt-28 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="h-4 w-28 bg-slate-200 dark:bg-white/10 rounded-full mx-auto animate-pulse" />
          <div className="h-10 w-72 bg-slate-200 dark:bg-white/10 rounded-2xl mx-auto animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-slate-200 dark:bg-white/10 rounded-full mx-auto animate-pulse" />
        </div>

        {/* Filter bar skeleton */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-24 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-9 w-48 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
        </div>

        {/* Product grid skeleton */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-3xl p-5 space-y-4 shadow-sm"
            >
              <div className="w-full h-48 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div className="h-6 w-24 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                <div className="h-9 w-28 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
