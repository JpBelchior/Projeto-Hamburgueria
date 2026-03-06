/**
 * Button — botão reutilizável
 *
 * Props:
 *   children   {ReactNode}  — texto do botão
 *   onClick    {function}   — callback de clique
 *   icon       {Component}  — ícone lucide (opcional)
 *   variant    {string}     — "primary" | "danger" | "ghost" (padrão: "primary")
 *   size       {string}     — "sm" | "md" (padrão: "md")
 *   disabled   {boolean}    — desabilita o botão
 *   type       {string}     — "button" | "submit" (padrão: "button")
 */

const VARIANTS = {
  primary: `
    bg-gradient-to-r from-amber-400 to-orange-500
    hover:from-amber-500 hover:to-orange-600
    text-white font-semibold
  `,
  danger: `
    bg-transparent
    text-red-400 font-medium
    border border-red-500/30
    hover:bg-red-500/10 hover:border-red-500/50
  `,
  ghost: `
    bg-transparent
    text-slate-400 font-medium
    border border-slate-700/50
    hover:text-white hover:border-slate-600 hover:bg-slate-800/50
  `,
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-8 py-3   text-sm gap-2  rounded-2xl",
};

const ICON_SIZES = {
  sm: 13,
  md: 16,
  lg: 16,
};

const Button = ({
  children,
  onClick,
  icon: Icon,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center rounded-xl shrink-0
        hover:-translate-y-px active:translate-y-0
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size] ?? SIZES.md}
      `}
    >
      {Icon && <Icon size={ICON_SIZES[size]} className="shrink-0" />}
      {children}
    </button>
  );
};

export default Button;