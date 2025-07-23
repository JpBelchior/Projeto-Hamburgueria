import { Activity, Award } from "lucide-react";

// Componente reutilizável
const UserTypeButton = ({
  icon: Icon,
  text,
  value,
  userType,
  setUserType,
  color,
}) => {
  const isSelected = userType === value;

  return (
    <button
      type="button"
      onClick={() => setUserType(value)}
      className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
        isSelected
          ? `bg-${color}-600/20 border-${color}-500/50 text-${color}-300`
          : `bg-slate-800/30 border-slate-600/30 text-slate-400 hover:border-${color}-500/30 hover:text-${color}-400`
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="font-semibold text-xs uppercase">{text}</span>
    </button>
  );
};
export default UserTypeButton;
