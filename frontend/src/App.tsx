import { BrowserRouter as Router, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function Layout() {
  const location = useLocation();

  const isLoginPage = location.pathname === "/";

  return (
    <div>
      <AppRoutes />
      {!isLoginPage && (
        <>
          {/* Aqui vão os componentes de menu quando criarmos */}
          {/* <BarraMenu /> */}
          {/* <TopMenu /> */}
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
