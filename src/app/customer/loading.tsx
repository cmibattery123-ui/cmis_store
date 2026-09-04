import { Loader2 } from "lucide-react";

export default function CustomerLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-500 dark:text-gray-400">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider">Loading Account Data…</p>
      </div>
    </div>
  );
}
