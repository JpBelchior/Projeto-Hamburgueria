import CardContainer from "./CardContainer";

export default function MixBar({ title, items }) {
  return (
    <CardContainer className="hover:border-slate-600 transition-all">
      <div className="px-5 py-4">
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-3">
          {title}
        </p>
        <div className="flex h-2 rounded-full overflow-hidden mb-3 gap-0.5">
          {items.filter((i) => i.value > 0).map(({ key, color, value }) => (
            <div
              key={key}
              className="rounded-full transition-all duration-500"
              style={{ flex: value, background: color }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {items.map(({ key, label, color, value }) => (
            <span key={key} className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              {label} {value}
            </span>
          ))}
        </div>
      </div>
    </CardContainer>
  );
}
