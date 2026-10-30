declare module "lucide-react" {
  import type { ComponentProps, ComponentType } from "react";

  type IconProps = ComponentProps<"svg"> & { size?: number };

  export const Activity: ComponentType<IconProps>;
  export const AlertTriangle: ComponentType<IconProps>;
  export const ArrowLeft: ComponentType<IconProps>;
  export const ArrowRight: ComponentType<IconProps>;
  export const Barcode: ComponentType<IconProps>;
  export const Calculator: ComponentType<IconProps>;
  export const CalendarDays: ComponentType<IconProps>;
  export const Camera: ComponentType<IconProps>;
  export const Candy: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  export const CheckCircle2: ComponentType<IconProps>;
  export const ChevronLeft: ComponentType<IconProps>;
  export const ChevronRight: ComponentType<IconProps>;
  export const ClipboardCheck: ComponentType<IconProps>;
  export const DollarSign: ComponentType<IconProps>;
  export const Download: ComponentType<IconProps>;
  export const Dumbbell: ComponentType<IconProps>;
  export const Flame: ComponentType<IconProps>;
  export const Footprints: ComponentType<IconProps>;
  export const HeartPulse: ComponentType<IconProps>;
  export const Home: ComponentType<IconProps>;
  export const Plus: ComponentType<IconProps>;
  export const Pencil: ComponentType<IconProps>;
  export const Ruler: ComponentType<IconProps>;
  export const Save: ComponentType<IconProps>;
  export const Search: ComponentType<IconProps>;
  export const ShoppingBasket: ComponentType<IconProps>;
  export const ShieldCheck: ComponentType<IconProps>;
  export const Sparkles: ComponentType<IconProps>;
  export const Store: ComponentType<IconProps>;
  export const Tag: ComponentType<IconProps>;
  export const Trash2: ComponentType<IconProps>;
  export const TrendingDown: ComponentType<IconProps>;
  export const TrendingUp: ComponentType<IconProps>;
  export const Upload: ComponentType<IconProps>;
  export const UserRound: ComponentType<IconProps>;
  export const Utensils: ComponentType<IconProps>;
  export const Weight: ComponentType<IconProps>;
  export const Wine: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
  export const RotateCcw: ComponentType<IconProps>;
}

declare module "react-router" {
  import type { ComponentType } from "react";

  export const BrowserRouter: ComponentType<{ children?: React.ReactNode }>;
  export const Route: ComponentType<{ path?: string; element?: React.ReactNode; caseSensitive?: boolean }>;
  export const Routes: ComponentType<{ children?: React.ReactNode }>;
  export const Link: ComponentType<{ to: string; children?: React.ReactNode; className?: string; end?: boolean }>;
  export const MemoryRouter: ComponentType<{ children?: React.ReactNode; initialEntries?: (string | { pathname: string; state?: unknown })[] }>;
  export const NavLink: ComponentType<{
    to?: string;
    children?: React.ReactNode;
    className?: string | ((props: { isActive: boolean }) => string | undefined);
    end?: boolean;
  }>;
  export const Outlet: ComponentType<{ context?: unknown }>;
  export const useNavigate: () => (to: string, options?: { replace?: boolean; state?: unknown }) => void;
  export const useLocation: () => { pathname: string; search: string; hash: string; state: unknown };
  export const useParams: () => Record<string, string>;
  export const useSearchParams: () => [URLSearchParams, (params: string | Record<string, string>) => void];
}
