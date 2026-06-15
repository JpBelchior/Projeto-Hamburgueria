import Avatar from "./Avatar";

/**
 * ItemCard — card genérico para exibição de entidades (Produto, Ingrediente, etc.)
 *
 * Props:
 *   onClick       {function}   — clique no card
 *   borderColor   {string}     — cor hex da borda
 *   glowColor     {string}     — cor hex do glow (box-shadow externo)
 *   inactive      {boolean}    — aplica opacity-50 e badge "Inativo"
 *   avatar        {{ name, src }} — dados do Avatar
 *   badge         {ReactNode}  — label acima do nome (ex: categoria, essencial)
 *   name          {string}     — nome principal
 *   subtitle      {ReactNode}  — texto pequeno abaixo do nome
 *   children      {ReactNode}  — conteúdo extra entre o header e o divider
 *   footer        {ReactNode}  — seção abaixo do divider
 */
export default function ItemCard({
  onClick,
  borderColor = "#334155",
  glowColor   = "transparent",
  inactive    = false,
  avatar,
  badge,
  name,
  subtitle,
  children,
  footer,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/60 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:scale-[1.02] relative ${inactive ? "opacity-50" : ""}`}
      style={{
        border:    `1px solid ${borderColor}`,
        boxShadow: `0 0 12px ${glowColor}, 0 2px 6px rgba(0,0,0,0.25)`,
      }}
    >
      {inactive && (
        <div className="absolute top-2 right-2 z-10 bg-slate-700 text-slate-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-600">
          Inativo
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header: avatar + badge + nome */}
        <div className="flex items-start gap-3">
          {avatar && <Avatar name={avatar.name} src={avatar.src} size="md" />}
          <div className="min-w-0 flex-1">
            {badge}
            <p className="text-white text-sm font-semibold leading-tight truncate">{name}</p>
            {subtitle && <div className="mt-0.5">{subtitle}</div>}
          </div>
        </div>

        {children}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

        {footer}
      </div>
    </div>
  );
}
