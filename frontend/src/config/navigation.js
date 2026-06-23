import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Layers,
  BarChart2,
  UtensilsCrossed,
  Receipt,
  Settings,
} from "lucide-react";

export const GERENTE_NAV = [
  {
    section: "PRINCIPAL",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
      { label: "Pedidos", icon: ShoppingBag, path: "/Dashboard/pedidos" },
    ],
  },
  {
    section: "GESTÃO",
    items: [
      { label: "Ingredientes", icon: Package, path: "/Dashboard/ingredientes" },
      { label: "Produtos", icon: UtensilsCrossed, path: "/Dashboard/produtos" },
      { label: "Combos & Promoções", icon: Layers, path: "/Dashboard/combos" },
      { label: "Funcionários", icon: Users, path: "/Dashboard/funcionarios" },
      { label: "Compras & Pagamentos", icon: Receipt, path: "/Dashboard/compras-pagamentos" },
    ],
  },
  {
    section: "ESTATÍSTICAS",
    items: [
      { label: "Métricas", icon: BarChart2, path: "/Dashboard/metricas" },
    ],
  },
  {
    section: "SISTEMA",
    items: [
      { label: "Configurações", icon: Settings, path: "/Dashboard/configuracoes" },
    ],
  },
];