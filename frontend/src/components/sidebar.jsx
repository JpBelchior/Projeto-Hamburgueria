import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { GERENTE_NAV } from "../config/navigation";
import Avatar from "./Ui/Avatar";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <aside
      style={{ width: collapsed ? "72px" : "240px" }}
      className="relative flex flex-col h-screen bg-black border-r border-amber-500/10 transition-all duration-300 ease-in-out shrink-0"
    >
      {/* Glow de fundo sutil */}
      <div className="absolute top-0 left-0 w-full h-48 bg-amber-500/3 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center h-16 px-4 border-b border-amber-500/10 overflow-hidden">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(255,140,0,0.5)]"
            />
            <span className="text-white font-bold text-sm tracking-wide whitespace-nowrap">
              Food
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Analytics
              </span>
            </span>
          </div>
        )}
        {collapsed && (
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain mx-auto drop-shadow-[0_0_8px_rgba(255,140,0,0.5)]"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5 px-2">
        {GERENTE_NAV.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <p className="text-slate-600 text-[10px] font-bold tracking-widest px-3 mb-2 uppercase">
                {section}
              </p>
            )}
            {collapsed && (
              <div className="border-t border-slate-800 mx-2 mb-2" />
            )}

            <ul className="space-y-1">
              {items.map(({ label, icon: Icon, path }) => {
                const isActive = location.pathname === path;
                return (
                  <li key={path}>
                    <button
                      onClick={() => navigate(path)}
                      title={collapsed ? label : undefined}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                        text-sm font-medium transition-all duration-200 group relative
                        ${
                          isActive
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                        }
                      `}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />
                      )}

                      <Icon
                        className={`shrink-0 transition-colors ${
                          collapsed ? "mx-auto" : ""
                        } ${
                          isActive
                            ? "text-amber-400"
                            : "text-slate-500 group-hover:text-amber-400/70"
                        }`}
                        size={18}
                      />

                      {!collapsed && (
                        <span className="truncate">{label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — usuário + logout */}
      <div className="border-t border-amber-500/10 p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-900/50">
            <Avatar name={user?.name || "Gerente"} size="sm" />
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">
                {user?.name || "Gerente"}
              </p>
              <p className="text-slate-500 text-[10px] truncate">
                {user?.role || "GERENTE"}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} className={collapsed ? "mx-auto" : "shrink-0"} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Botão de colapsar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400 hover:bg-slate-700 hover:border-amber-500/40 transition-all duration-200 z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};

export default Sidebar;