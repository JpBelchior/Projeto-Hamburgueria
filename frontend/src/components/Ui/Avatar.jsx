/**
 * Avatar — representação visual de usuário
 *
 * Props:
 *   name    {string}  — nome completo (usado para gerar as iniciais)
 *   size    {string}  — "sm" | "md" | "lg" (padrão: "md")
 *   src     {string}  — URL de imagem (opcional — se fornecido, usa foto)
 *
 * Gera até 2 iniciais: "João Silva" → "JS"
 */

const SIZE_CONFIG = {
  sm: {
    wrapper: "w-8 h-8 text-xs",
  },
  md: {
    wrapper: "w-10 h-10 text-sm",
  },
  lg: {
    wrapper: "w-14 h-14 text-lg",
  },
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Avatar = ({ name = "", size = "md", src }) => {
  const config = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${config.wrapper} rounded-full object-cover ring-2 ring-amber-500/20 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`
        ${config.wrapper}
        rounded-full shrink-0
        bg-gradient-to-br from-amber-400 to-orange-600
        ring-2 ring-amber-500/20
        flex items-center justify-center
      `}
      title={name}
    >
      <span className="font-bold text-black leading-none">
        {initials}
      </span>
    </div>
  );
};

export default Avatar;