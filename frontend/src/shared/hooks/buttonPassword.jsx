import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Recebe inputRef para controlar o input correto
const PasswordToggle = ({ inputRef }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    if (!inputRef?.current) return;
    const next = !showPassword;
    setShowPassword(next);
    inputRef.current.type = next ? "text" : "password";
  };

  return (
    <button
      type="button"
      onClick={togglePassword}
      className="w-8 h-8 rounded-full bg-black hover:bg-black/80 text-amber-400 flex items-center justify-center transition-colors"
      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );
};

export default PasswordToggle;