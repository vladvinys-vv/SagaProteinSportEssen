declare module "lucide-react" {
  import type { ComponentProps, ComponentType } from "react";
  export const DollarSign: ComponentType<ComponentProps<"svg">>;
  export const Plus: ComponentType<ComponentProps<"svg">>;
  export const ShoppingBasket: ComponentType<ComponentProps<"svg">>;
  export const Store: ComponentType<ComponentProps<"svg">>;
  export const Tag: ComponentType<ComponentProps<"svg">>;
  export const Trash2: ComponentType<ComponentProps<"svg">>;
  export const TrendingDown: ComponentType<ComponentProps<"svg">>;
  export const Download: ComponentType<ComponentProps<"svg">>;
}

declare module "react-router" {
  import type { ComponentType } from "react";
  export const NavLink: ComponentType<{ to?: string; children?: React.ReactNode; className?: string; end?: boolean }>;
  export const Outlet: ComponentType<{ context?: unknown }>;
  export const useNavigate: () => (to: string, options?: { replace?: boolean }) => void;
  export const useParams: () => Record<string, string>;
  export const useLocation: () => { pathname: string; search: string; hash: string; state: unknown };
  export const useSearchParams: () => [URLSearchParams, (params: string | Record<string, string>) => void];
}
