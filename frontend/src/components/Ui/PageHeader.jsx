/**
 * PageHeader — cabeçalho reutilizável de página
 *
 * Props:
 *   title       {string}  — texto principal (obrigatório)
 *   subtitle    {string}  — texto secundário (opcional)
 */
const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h1 className="inline-block text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
        )}
      </div>

      {/* Linha separadora com degradê âmbar */}
      <div className="h-px bg-gradient-to-r from-amber-500/40 via-amber-500/10 to-transparent" />
    </div>
  );
};

export default PageHeader;