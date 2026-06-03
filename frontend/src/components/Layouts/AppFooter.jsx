const AppFooter = () => {
  return (
    <footer className="border-t border-white/5 px-6 py-3 flex items-center justify-between shrink-0">
      <span className="text-slate-300 text-[10px] uppercase tracking-widest">
        © {new Date().getFullYear()} FoodAnalytics™
      </span>

      <span className="text-slate-300 text-[10px] uppercase tracking-wider hidden sm:block">
        Visão Executiva
        <span className="mx-2 text-amber-500/40">·</span>
        Análises Profundas
        <span className="mx-2 text-amber-500/40">·</span>
        Métricas em Tempo Real
      </span>

      <span className="text-slate-300 text-[10px] uppercase tracking-widest">
        <span className="ml-1.5">Contato:****</span>
      </span>
    </footer>
  );
};

export default AppFooter;
