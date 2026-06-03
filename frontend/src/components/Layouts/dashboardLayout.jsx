import Sidebar from "../sidebar";
import { Outlet } from "react-router-dom";
import AppFooter from "./AppFooter";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default DashboardLayout; 