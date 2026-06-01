const VariationBadge = ({ value, invertColors = false }) => {
  const isUp = value >= 0;
  const isGood = invertColors ? !isUp : isUp;

  return (
    <span
      className={`
        inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold
        ${isGood
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
        }
      `}
    >
      {isUp ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
    </span>
  );
};

export default VariationBadge;
