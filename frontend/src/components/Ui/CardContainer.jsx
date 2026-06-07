export default function CardContainer({ children, className = "" }) {
  return (
    <div className={`bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden ${className}`}>
      <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
      {children}
    </div>
  );
}
