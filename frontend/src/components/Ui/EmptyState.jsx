export default function EmptyState({ icon: Icon, message, actionLabel, onAction, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mb-4">
          <Icon size={24} className="text-slate-600" />
        </div>
      )}
      <p className="text-slate-400 font-medium text-sm">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
