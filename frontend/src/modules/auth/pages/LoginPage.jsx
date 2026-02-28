import React, { useState, useRef } from "react";
import {
  User,
  Shield,
  Target,
  TrendingUp,
  Activity,
  Clock,
  Award,
} from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import Footer from "../../../shared/hooks/footer";
import MetricCard from "../components/MetricCard";
import UserTypeButton from "../components/UserType";
import LogoHeader from "../components/LogoHeader";
import PasswordToggle from "../../../shared/hooks/buttonPassword";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("funcionario");
  const passwordRef = useRef(null);

  const { login, isLoading, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, userType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-black/70 backdrop-blur-2xl border border-amber-500/10 rounded-3xl shadow-2xl p-10">
          <LogoHeader />

          <form onSubmit={handleSubmit} className="space-y-7 ">
            {error && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                <p className="text-red-300 text-sm text-center flex items-center justify-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-white  text-sm tracking-wider">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-amber-400/70 group-focus-within:text-amber-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-[90%] pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl 
                           text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                           focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300
                           hover:border-amber-500/30 hover:bg-slate-800/70"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-white text-sm tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-amber-400/70 group-focus-within:text-amber-400 transition-colors" />
                </div>
                <input
                  ref={passwordRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-[90%] pl-12 pr-14 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl 
                           text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                           focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300
                           hover:border-amber-500/30 hover:bg-slate-800/70"
                  placeholder="••••••••••••"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <PasswordToggle inputRef={passwordRef} />
                </div>
              </div>
            </div>
            <div className=" flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  relative inline-flex items-center justify-center
                  bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-600
                  hover:from-amber-500 hover:via-orange-600 hover:to-yellow-700
                  text-white font-medium
                  py-3 px-8
                  rounded-2xl
                  shadow-md shadow-orange-500/10
                  hover:shadow-lg hover:shadow-orange-500/15
                  hover:-translate-y-[1px]
                  active:translate-y-0 active:scale-[0.98]
                  transition-all duration-300 ease-out
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                  tracking-wide
                "
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                    Autenticando...
                  </div>
                ) : (
                  "Acessar Dashboard"
                )}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-700/50 pt-6 mt-3">
              <p className="text-slate-400 text-sm text-center mb-4 font-medium">
               ESCOLHA SEU NÍVEL DE ACESSO
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto"> 
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
            <div className="mt-10 space-y-6">
              <div className="border-t border-slate-700/50 pt-6">
                <p className="text-slate-400 text-sm text-center mb-4 font-medium">
                  MÉTRICAS QUE TRANSFORMAM SEU NEGÓCIO
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard
                    icon={Clock}
                    text="DIMINUA O TEMPO DE PREPARO"
                    color={{ icon: "text-blue-400", text: "text-blue-300" }}
                  />
                  <MetricCard
                    icon={Target}
                    text="SAIBA QUAIS SÃO OS MAIS PEDIDOS"
                    color={{ icon: "text-green-400", text: "text-green-300" }}
                  />
                  <MetricCard
                    icon={TrendingUp}
                    text="NOVAS SUGESTÕES DE COMBOS"
                    color={{ icon: "text-amber-400", text: "text-amber-300" }}
                  />
                </div>
              </div>
            </div>

          <div className="mt-8 text-center">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;