const LogoHeader = ({
  emoji = "🍔",
  title = "Food",
  highlightText = "Analytics",
  subtitle = "Sistema Avançado de Métricas & Performance",
  showIndicator = true,
  gradientFrom = "amber-400",
  gradientTo = "orange-500",
}) => {
  return (
    <div className="text-center mb-10">
      <div className="relative inline-block mb-6">
        <div
          className={`bg-gradient-to-br from-${gradientFrom} to-${gradientTo} p-4 rounded-2xl shadow-lg`}
        >
          <div className="text-4xl filter drop-shadow-lg">{emoji}</div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-white mb-3">
        {title}
        <span
          className={`text-transparent bg-clip-text bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`}
        >
          {highlightText}
        </span>
      </h1>

      <p className="text-slate-400 text-sm font-medium">{subtitle}</p>
    </div>
  );
};
export default LogoHeader;
