import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Target,
  TrendingUp,
  Activity,
  Clock,
  Award,
} from "lucide-react";
import PasswordToggle from "../hooks/buttonPassord";
import Footer from "../components/Login/footer";
import MetricCard from "../components/Login/MetricCard";
import UserTypeButton from "../components/Login/UserType";
import LogoHeader from "../components/Login/LogoHeader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("funcionario");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simular autenticação
    setTimeout(() => {
      // Verificar credenciais baseadas no tipo de usuário
      const validCredentials =
        (userType === "funcionario" &&
          email === "funcionario@burgeranalytics.com" &&
          password === "123456") ||
        (userType === "gerente" &&
          email === "gerente@burgeranalytics.com" &&
          password === "654321");

      if (validCredentials) {
        setIsLoading(false);
        // Redirecionar para o Dashboard
        navigate("/Dashboard");
      } else {
        setError("Credenciais inválidas para o tipo de usuário selecionado.");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-black/70 backdrop-blur-2xl border border-amber-500/10 rounded-3xl shadow-2xl p-10">
          {/* Premium Logo Section */}
          <LogoHeader />

          {/* Login Form */}
          <div className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 animate-pulse">
                <p className="text-red-300 text-sm text-center flex items-center justify-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-3">
              <label className="block text-white font-semibold text-sm uppercase tracking-wider">
                E-MAIL CORPORATIVO
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-amber-400/70 group-focus-within:text-amber-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-5 bg-slate-800/50 border border-slate-600/50 rounded-xl 
                           text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                           focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300
                           hover:border-amber-500/30 hover:bg-slate-800/70"
                  placeholder="digite o email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="block text-white font-semibold text-sm uppercase tracking-wider">
                SENHA DE ACESSO
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-amber-400/70 group-focus-within:text-amber-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-5 bg-slate-800/50 border border-slate-600/50 rounded-xl 
                           text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                           focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300
                           hover:border-amber-500/30 hover:bg-slate-800/70"
                  placeholder="••••••••••••"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <PasswordToggle />
                </div>
              </div>
            </div>

            {/* Premium Login Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 
                       hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600
                       text-black font-bold py-5 px-6 rounded-xl transition-all duration-300 
                       hover:shadow-xl hover:shadow-amber-500/25 transform hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase tracking-wide"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                  Autenticando Sistema...
                </div>
              ) : (
                "Acessar Dashboard"
              )}
            </button>
          </div>

          {/* Metrics Preview Cards */}
          <div className="mt-10 space-y-6">
            <div className="border-t border-slate-700/50 pt-6">
              <p className="text-slate-400 text-sm text-center mb-4 font-medium">
                MÉTRICAS QUE TRANSFORMAM SEU NEGÓCIO
              </p>
              <div className="grid grid-cols-3 gap-3">
                <MetricCard
                  icon={Clock}
                  text="TEMPO PREPARO"
                  color={{ icon: "text-blue-400", text: "text-blue-300" }}
                />

                <MetricCard
                  icon={Target}
                  text="MAIS PEDIDO"
                  color={{ icon: "text-green-400", text: "text-green-300" }}
                />

                <MetricCard
                  icon={TrendingUp}
                  text="PEDIDOS DIÁRIOS"
                  color={{ icon: "text-amber-400", text: "text-amber-300" }}
                />
              </div>
            </div>
            {/* Access Level Selection */}
            <div className="border-t border-slate-700/50 pt-6">
              <p className="text-slate-400 text-sm text-center mb-4 font-medium">
                NÍVEIS DE ACESSO
              </p>

              <div className="grid grid-cols-2 gap-3">
                <UserTypeButton
                  icon={Activity}
                  text="FUNCIONÁRIO"
                  value="funcionario"
                  userType={userType}
                  setUserType={setUserType}
                  color="blue"
                />
                <UserTypeButton
                  icon={Award}
                  text="GERENTE"
                  value="gerente"
                  userType={userType}
                  setUserType={setUserType}
                  color="amber"
                />
              </div>
            </div>
          </div>

          {/* Premium Footer */}
          <div className="mt-8 text-center space-y-3">
            <div className="bg-slate-800/20 border border-slate-700/20 rounded-lg p-4">
              <p className="text-slate-400 text-xs mb-2 font-medium">
                CREDENCIAIS DE TESTE:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 text-xs font-semibold">
                    FUNCIONÁRIO:
                  </span>
                  <span className="text-slate-300 text-xs">
                    funcionario@burgeranalytics.com | 123456
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 text-xs font-semibold">
                    GERENTE:
                  </span>
                  <span className="text-slate-300 text-xs">
                    gerente@burgeranalytics.com | 654321
                  </span>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
