export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 border-2 border-slate-300 dark:border-white/10 border-t-amber-500 dark:border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-gray-400 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
