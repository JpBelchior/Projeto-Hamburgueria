const LogoHeader = ({
  title = "Food",
  highlightText = "Analytics",
  subtitle = "Sistema Avançado de Métricas & Performance",
  showIndicator = true,
  gradientFrom = "amber-400",
  gradientTo = "orange-500",
}) => {
  return (
    <div className="text-center mb-10">
      <div className="relative inline-block ">
        <div className="relative inline-block ">
          <img
            src="/logo.png"
            alt="Logo FastFood Control"
            className="w-28 h-28 object-contain drop-shadow-[0_0_35px_rgba(255,140,0,0.6)]"
          />
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