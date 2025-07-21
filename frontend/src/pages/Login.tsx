import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simular login por enquanto
    setTimeout(() => {
      console.log("Login:", { email, password });

      // Simulação simples de validação
      if (email === "admin@burger.com" && password === "123456") {
        setIsLoading(false);
        navigate("/Dashboard");
      } else {
        setError("Email ou senha incorretos");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full bg-repeat opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/80 backdrop-blur-xl border border-red-600/30 rounded-3xl shadow-2xl p-8">
          {/* Logo e Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🍔</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Burger <span className="text-red-500">Admin</span>
            </h1>
            <p className="text-gray-400">Sistema de Gerenciamento</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">⚠️ {error}</p>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm uppercase tracking-wide">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">📧</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-red-600/30 rounded-xl 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-red-500 focus:border-transparent transition-all duration-300
                           hover:border-red-500/50"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm uppercase tracking-wide">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-red-600/30 rounded-xl 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-red-500 focus:border-transparent transition-all duration-300
                           hover:border-red-500/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Botão Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                       text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 
                       transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       uppercase tracking-wide text-sm"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-4">
              Acesso apenas para funcionários autorizados
            </p>

            {/* Informações de teste */}
            <div className="bg-gray-900/30 border border-gray-600/30 rounded-xl p-3 mb-4">
              <p className="text-gray-400 text-xs mb-2">Para teste:</p>
              <p className="text-gray-300 text-xs">
                📧 admin@burger.com
                <br />
                🔒 123456
              </p>
            </div>

            {/* Badges dos cargos */}
            <div className="flex justify-center space-x-3">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                ATENDENTE
              </span>
              <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                GERENTE
              </span>
            </div>
          </div>
        </div>

        {/* Elementos decorativos flutuantes */}
        <div className="absolute -top-4 -right-4 text-4xl opacity-20 animate-pulse">
          🍟
        </div>
        <div className="absolute -bottom-4 -left-4 text-4xl opacity-20 animate-pulse delay-1000">
          🥤
        </div>
      </div>
    </div>
  );
};

export default Login;
