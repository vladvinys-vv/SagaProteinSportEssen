declare module "lucide-react" {
  import type { ComponentProps, ComponentType } from "react";

  type IconProps = ComponentProps<"svg"> & { size?: number };
  export const DollarSign: ComponentType<IconProps>;
  export const Plus: ComponentType<IconProps>;
  export const ShoppingBasket: ComponentType<IconProps>;
  export const Store: ComponentType<IconProps>;
  export const Tag: ComponentType<IconProps>;
  export const Trash2: ComponentType<IconProps>;
  export const TrendingDown: ComponentType<IconProps>;
  export const Download: ComponentType<IconProps>;
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
