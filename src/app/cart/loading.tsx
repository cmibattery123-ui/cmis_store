export default function CartLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-full mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-2xl shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/2 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-4 w-1/4 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>

          {/* Cart summary skeleton */}
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-3xl p-6 h-fit space-y-6 shadow-sm">
            <div className="h-6 w-36 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
              <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex justify-between">
                <div className="h-5 w-28 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-12 w-full bg-slate-200 dark:bg-white/10 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
