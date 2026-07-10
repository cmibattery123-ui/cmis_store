export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
