import {
  BarChart3,
  Building2,
  ClipboardList,
  Coins,
  FileText,
  Globe2,
  LayoutDashboard,
  MapPin,
  Settings2,
  ShieldCheck,
  Star,
  UserCircle,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

export interface InsuranceNavigationItem {
  id: string;
  path: string;
  labelKey: string;
  fallbackLabel: string;
  icon: LucideIcon;
  group: 'main' | 'details';
}

export const INSURANCE_NAVIGATION_ITEMS = [
  { id: 'summary', path: '/insurance', labelKey: 'insurance.summary', fallbackLabel: 'Resumen', icon: LayoutDashboard, group: 'main' },
  { id: 'coverage', path: '/insurance/coverage', labelKey: 'insurance.globalCoverage', fallbackLabel: 'Cobertura global', icon: Globe2, group: 'main' },
  { id: 'operations', path: '/insurance/operations', labelKey: 'insurance.operations', fallbackLabel: 'Operación', icon: BarChart3, group: 'main' },
  { id: 'costs', path: '/insurance/costs', labelKey: 'insurance.costs', fallbackLabel: 'Costos', icon: Coins, group: 'main' },
  { id: 'experience', path: '/insurance/experience', labelKey: 'insurance.experience', fallbackLabel: 'Experiencia', icon: Star, group: 'main' },
  { id: 'providers', path: '/insurance/providers', labelKey: 'insurance.providers', fallbackLabel: 'Proveedores', icon: UsersRound, group: 'main' },
  { id: 'members', path: '/insurance/members', labelKey: 'insurance.members', fallbackLabel: 'Asegurados y planes', icon: ShieldCheck, group: 'main' },
  { id: 'claims', path: '/insurance/claims', labelKey: 'insurance.claims', fallbackLabel: 'Siniestros', icon: ClipboardList, group: 'main' },
  { id: 'reports', path: '/insurance/reports', labelKey: 'insurance.reports', fallbackLabel: 'Reportes', icon: FileText, group: 'main' },
  { id: 'settings', path: '/insurance/settings', labelKey: 'insurance.settings', fallbackLabel: 'Configuración', icon: Settings2, group: 'main' },
  { id: 'clients', path: '/insurance/clients', labelKey: 'nav.clients', fallbackLabel: 'Clientes', icon: UserCircle, group: 'details' },
  { id: 'plans', path: '/insurance/plans', labelKey: 'nav.plans', fallbackLabel: 'Planes', icon: ShieldCheck, group: 'details' },
  { id: 'liveMap', path: '/insurance/live-map', labelKey: 'nav.liveMap', fallbackLabel: 'Mapa en Vivo', icon: MapPin, group: 'details' },
] as const satisfies readonly InsuranceNavigationItem[];

export type InsuranceNavigationItemId = (typeof INSURANCE_NAVIGATION_ITEMS)[number]['id'];

export const DEFAULT_INSURANCE_NAVIGATION_ITEM_IDS: InsuranceNavigationItemId[] =
  INSURANCE_NAVIGATION_ITEMS.map(({ id }) => id);

const insuranceNavigationItemIds = new Set<string>(DEFAULT_INSURANCE_NAVIGATION_ITEM_IDS);

export const normalizeInsuranceNavigationItemIds = (
  itemIds: readonly string[] | null | undefined,
): InsuranceNavigationItemId[] => {
  if (itemIds == null) return [...DEFAULT_INSURANCE_NAVIGATION_ITEM_IDS];
  return itemIds.filter((itemId): itemId is InsuranceNavigationItemId => insuranceNavigationItemIds.has(itemId));
};

export const getInsuranceNavigationItemForPath = (pathname: string) =>
  INSURANCE_NAVIGATION_ITEMS.find(({ path }) =>
    path === '/insurance'
      ? pathname === path || pathname === `${path}/`
      : pathname === path || pathname.startsWith(`${path}/`)
  );
