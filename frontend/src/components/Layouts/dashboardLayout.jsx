import Sidebar from "../sidebar";
import { Outlet } from "react-router-dom";


// colocar coisas fixas que apareceram em todas a telas ( sidebar, algum footer... e a pagina se encaixa no Outlet)
const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 overflow-hidden">
      <Sidebar />

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout; 