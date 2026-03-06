import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Layers,
  BarChart2,
  UtensilsCrossed,
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
      { label: "Produtos", icon: UtensilsCrossed, path: "/Dashboard/produtos" },
      { label: "Ingredientes", icon: Package, path: "/Dashboard/ingredientes" },
      { label: "Combos e Promoções", icon: Layers, path: "/Dashboard/combos" },
      { label: "Funcionários", icon: Users, path: "/Dashboard/funcionarios" },
    ],
  },
  {
    section: "ESTATÍSTICAS",
    items: [
      { label: "Métricas", icon: BarChart2, path: "/Dashboard/metricas" },
    ],
  },
];