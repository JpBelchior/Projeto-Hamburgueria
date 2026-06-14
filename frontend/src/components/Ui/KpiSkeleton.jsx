export default function KpiSkeleton({ variant = "kpi" }) {
  if (variant === "compact") {
    return (
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden animate-pulse">
        <div className="h-0.5 bg-slate-800" />
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 bg-slate-800 rounded w-1/2" />
            <div className="h-5 bg-slate-800 rounded w-3/4" />
            <div className="h-2 bg-slate-800 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl overflow-hidden animate-pulse">
        <div className="h-0.5 w-full bg-slate-800" />
        <div className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-800 rounded w-2/3" />
            <div className="h-3 bg-slate-800 rounded w-1/3" />
            <div className="h-5 bg-slate-800 rounded-full w-16 mt-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-700/60" />
        <div className="w-14 h-5 rounded-full bg-slate-700/60" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="w-24 h-3 rounded bg-slate-700/60" />
        <div className="w-32 h-7 rounded bg-slate-700/60" />
      </div>
      <div className="w-16 h-3 rounded bg-slate-700/60" />
    </div>
  );
}
