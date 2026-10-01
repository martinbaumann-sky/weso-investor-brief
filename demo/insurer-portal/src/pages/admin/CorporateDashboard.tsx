import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppHeader from '@/components/layout/AppHeader';
import MapboxMap, { type MapMarker } from '@/components/map/MapboxMap';
import { DashboardGrid, type WidgetDef, type DashboardTemplate } from '@/components/dashboard/DashboardGrid';
import DemandHeatmap, { type HeatPoint } from '@/components/dashboard/DemandHeatmap';
import MapboxHeatmapLayer from '@/components/dashboard/MapboxHeatmapLayer';

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import {
  Building2, ShieldCheck, ClipboardList, CheckCircle2, Clock, Timer, Smile, Gauge, HandshakeIcon,
  TrendingUp, PiggyBank, Bot, UserCog, AlertTriangle, MapPin, Sparkles, LayoutGrid, Repeat,
  Move, Check, RotateCcw, ChevronUp, ChevronDown, SlidersHorizontal, Save, Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ExecutiveSummary from '@/components/insurance/ExecutiveSummary';
import InsuranceDashboardToolbar from '@/components/insurance/InsuranceDashboardToolbar';
import { useInsuranceDashboardPreferences } from '@/hooks/useInsuranceDashboardPreferences';
import InsuranceAnalytics, { INSURANCE_ANALYTICS_LAYOUT_KEY } from '@/components/insurance/InsuranceAnalytics';
import '@/components/insurance/executive.css';
import { useCorporateClients } from '@/hooks/useCorporateClient';
import {
  useCorporateOrders, useCorporateRatings, useCorporateClaims, useCorporateCoverage, useCorporateAI,
} from '@/hooks/useCorporateDashboard';
import { format, subDays, startOfDay, endOfDay, startOfYear, startOfQuarter } from 'date-fns';

const CHART_COLORS = ['#560FF3', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
const SECTIONS_KEY = 'weso.corporate.dashboard.sections.v1';
const LAYOUT_KEY = 'weso.corporate.dashboard.layout.v1';
const INSURANCE_SUMMARY_LAYOUT_KEY = 'weso.insurance.summary.layout.v3';
const TEMPLATE_KEY = 'weso.corporate.dashboard.template.v1';
const CUSTOM_TPL_KEY = 'weso.corporate.dashboard.customTemplates.v1';

type StoredTemplate = {
  id: string;
  name: string;
  layout: Record<string, { x: number; y: number; w: number; h: number }>;
  sections?: string[];
};

const SECTION_IDS = [
  'executive', 'operations', 'geo', 'categories', 'cx', 'providers',
  'financial', 'claims', 'ai', 'sla', 'bi', 'alerts', 'score',
] as const;
type SectionId = (typeof SECTION_IDS)[number];

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'quarter' | 'year';
const RANGE_KEYS: { key: RangeKey; i18n: string }[] = [
  { key: 'today', i18n: 'today' },
  { key: 'yesterday', i18n: 'yesterday' },
  { key: '7d', i18n: 'd7' },
  { key: '30d', i18n: 'd30' },
  { key: 'quarter', i18n: 'quarter' },
  { key: 'year', i18n: 'year' },
];

const resolveRange = (key: RangeKey) => {
  const now = new Date();
  switch (key) {
    case 'today': return { from: startOfDay(now), to: endOfDay(now) };
    case 'yesterday': return { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) };
    case '7d': return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case 'quarter': return { from: startOfQuarter(now), to: endOfDay(now) };
    case 'year': return { from: startOfYear(now), to: endOfDay(now) };
    default: return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
  }
};

const money = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;
const pct = (n: number) => `${n.toFixed(0)}%`;

const TONES = ['tone-primary', 'tone-violet', 'tone-cyan', 'tone-emerald', 'tone-amber', 'tone-indigo', 'tone-rose'] as const;
type Tone = (typeof TONES)[number];

const KpiCard = ({ icon: Icon, label, value, hint, tone = 'tone-primary' }: {
  icon: any; label: string; value: string; hint?: string; tone?: Tone;
}) => (
  <div className={cn(
    tone,
    'kpi-gradient group h-full rounded-xl border border-border/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glass'
  )}>
    <div className="flex items-center justify-between gap-2">
      <div className="kpi-chip flex h-9 w-9 items-center justify-center rounded-lg">
        <Icon className="w-[18px] h-[18px]" />
      </div>
    </div>
    <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">{label}</p>
    <p className="mt-0.5 text-2xl font-semibold leading-tight tracking-tight truncate">{value}</p>
    {hint && <p className="mt-1 text-[11px] text-muted-foreground/80 truncate">{hint}</p>}
  </div>
);

const Panel = ({ title, subtitle, children, className }: {
  title?: string; subtitle?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={cn(
    'surface-gradient h-full flex flex-col rounded-xl border border-border/60 p-5 transition-shadow duration-200 hover:shadow-md',
    className
  )}>
    {title && (
      <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-1 h-4 w-1 rounded-full gradient-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight truncate">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
    )}
    <div className="flex-1 min-h-0">{children}</div>
  </div>
);



interface CorporateDashboardProps {
  /** When set, the dashboard is locked to a single company and the selector is hidden. */
  lockedCompanyId?: number | null;
  hideHeader?: boolean;
  preferenceScope?: string;
}

const CorporateDashboard = ({ lockedCompanyId = null, hideHeader = false, preferenceScope = 'admin' }: CorporateDashboardProps) => {
  const { t, i18n } = useTranslation();
  const insurancePreferences = useInsuranceDashboardPreferences(preferenceScope, i18n.language.startsWith('es'));
  const { data: companies = [], isLoading: loadingCompanies } = useCorporateClients();
  const [selectedCompanyId, setCompanyId] = useState<number | null>(lockedCompanyId);
  // The insurance portal's selected company is authoritative from the first
  // render, including while the saved admin selection is still loading.
  const companyId = hideHeader ? lockedCompanyId : lockedCompanyId ?? selectedCompanyId;
  const [companySearch, setCompanySearch] = useState('');
  const locked = hideHeader || lockedCompanyId != null;

  const [rangeKey, setRangeKey] = useState<RangeKey>('year');
  const [country, setCountry] = useState<string>('all');
  const [city, setCity] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [editing, setEditing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('weso.corporate.dashboard.filters.open') !== '0'; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem('weso.corporate.dashboard.filters.open', filtersOpen ? '1' : '0'); } catch {}
  }, [filtersOpen]);

  // Filters belong to the selected insurer. Do not carry a city/service
  // selection from the previous company into the next company's dataset.
  useEffect(() => {
    setCountry('all');
    setCity('all');
    setCategory('all');
  }, [companyId]);
  const [gridKey, setGridKey] = useState(0);
  const [templateId, setTemplateId] = useState<string | null>(() => {
    try { return localStorage.getItem(TEMPLATE_KEY); } catch { return null; }
  });
  const [visible, setVisible] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(SECTIONS_KEY);
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch {}
    return new Set(SECTION_IDS);
  });

  const hrs = (mins: number) => (mins >= 60 ? `${(mins / 60).toFixed(1)} h` : `${Math.round(mins)} min`);
  const na = t('corpDash.misc.na');

  const companyName = (c: any) => c['Company Name'] || t('corpDash.companyFallback', { id: c.id });

  const sortedCompanies = useMemo(
    () => [...companies].sort((a, b) => companyName(a).localeCompare(companyName(b), 'es', { sensitivity: 'base' })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [companies],
  );

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return sortedCompanies;
    return sortedCompanies.filter((c) => companyName(c).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedCompanies, companySearch]);

  useEffect(() => {
    if (!locked && !companyId && sortedCompanies.length) setCompanyId(sortedCompanies[0].id);
  }, [sortedCompanies, companyId, locked]);


  useEffect(() => {
    try { localStorage.setItem(SECTIONS_KEY, JSON.stringify([...visible])); } catch {}
  }, [visible]);

  const range = useMemo(() => resolveRange(rangeKey), [rangeKey]);
  const fromISO = range.from.toISOString();
  const toISO = range.to.toISOString();

  const { data: orders = [], isLoading, isError: ordersError, refetch: retryOrders } = useCorporateOrders(companyId, fromISO, toISO);
  const { data: claimsData } = useCorporateClaims(companyId, fromISO, toISO);
  const { data: coverage } = useCorporateCoverage(companyId);
  const { data: conversations = [] } = useCorporateAI(companyId, fromISO, toISO);

  const company = companies.find((c) => c.id === companyId);

  const countries = useMemo(
    () => [...new Set(orders.map((o) => o.country_code || o.client?.country).filter(Boolean) as string[])].sort(),
    [orders]
  );
  const cities = useMemo(
    () => [...new Set(orders.map((o) => o.city || o.client?.city).filter(Boolean) as string[])].sort(),
    [orders]
  );
  const serviceNames = useMemo(
    () => [...new Set(orders.map((o) => o.service?.name).filter(Boolean) as string[])].sort(),
    [orders]
  );

  const rows = useMemo(() => orders.filter((o) => {
    // Supabase allows a nullable created_at on legacy orders. Date-fns and
    // the hourly series throw on an invalid date, so keep malformed records
    // out of the analytics view while the raw order remains available in
    // Orders for cleanup.
    if (!o.created_at || Number.isNaN(Date.parse(o.created_at))) return false;
    if (country !== 'all' && (o.country_code || o.client?.country) !== country) return false;
    if (city !== 'all' && (o.city || o.client?.city) !== city) return false;
    if (category !== 'all' && o.service?.name !== category) return false;
    return true;
  }), [orders, country, city, category]);

  const orderIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const { data: ratings = [], isLoading: ratingsLoading, isError: ratingsError } = useCorporateRatings(orderIds);

  // ---------------- Metrics ----------------
  const m = useMemo(() => {
    const total = rows.length;
    const completed = rows.filter((r) => r.status === 'completed');
    const cancelled = rows.filter((r) => r.status === 'cancelled');
    const open = rows.filter((r) => !['completed', 'cancelled'].includes(r.status || ''));

    const resolutionMins = completed
      .filter((r) => r.completed_at)
      .map((r) => (new Date(r.completed_at as string).getTime() - new Date(r.created_at).getTime()) / 60000)
      .filter((n) => n > 0 && n < 60 * 24 * 30);
    const avgResolution = resolutionMins.length ? resolutionMins.reduce((a, b) => a + b, 0) / resolutionMins.length : 0;

    const responseMins = rows
      .filter((r) => r.started_at)
      .map((r) => (new Date(r.started_at as string).getTime() - new Date(r.created_at).getTime()) / 60000)
      .filter((n) => n > 0 && n < 60 * 24 * 7);
    const avgResponse = responseMins.length ? responseMins.reduce((a, b) => a + b, 0) / responseMins.length : 0;

    const rated = ratings.filter((r) => typeof r.rating === 'number');
    const csat = rated.length ? rated.reduce((a, b) => a + (b.rating || 0), 0) / rated.length : 0;
    const promoters = rated.filter((r) => (r.rating || 0) >= 5).length;
    const detractors = rated.filter((r) => (r.rating || 0) <= 3).length;
    const nps = rated.length ? ((promoters - detractors) / rated.length) * 100 : 0;

    const assigned = rows.filter((r) => r.technician_id).length;
    const acceptanceRate = total ? (assigned / total) * 100 : 0;

    const slaTarget = 24 * 60;
    const slaOk = resolutionMins.filter((n) => n <= slaTarget).length;
    const slaCompliance = resolutionMins.length ? (slaOk / resolutionMins.length) * 100 : 0;
    const nearBreach = open.filter((r) => {
      const age = (Date.now() - new Date(r.created_at).getTime()) / 60000;
      return age > slaTarget * 0.8 && age <= slaTarget;
    }).length;
    const breached = open.filter((r) => (Date.now() - new Date(r.created_at).getTime()) / 60000 > slaTarget).length;

    const revenue = rows.reduce((a, r) => a + (Number(r.price_charged) || 0), 0);
    const cost = rows.reduce((a, r) => a + (Number(r.technician_payment) || 0), 0);
    const avgCost = completed.length ? cost / completed.length : 0;
    const savings = revenue - cost;

    const seen = new Map<string, number>();
    rows.forEach((r) => {
      const k = `${r.client?.city || r.city}|${r.service?.name}`;
      seen.set(k, (seen.get(k) || 0) + 1);
    });
    const repeats = [...seen.values()].filter((v) => v > 1).reduce((a, b) => a + (b - 1), 0);
    const recontactRate = total ? (repeats / total) * 100 : 0;

    const escalated = conversations.filter((c: any) => c.escalated).length;
    const automationRate = conversations.length ? ((conversations.length - escalated) / conversations.length) * 100 : 0;

    return {
      total, completed: completed.length, cancelled: cancelled.length, open: open.length,
      avgResolution, avgResponse, csat, nps, acceptanceRate, slaCompliance, nearBreach, breached,
      revenue, cost, avgCost, savings, recontactRate, automationRate,
      humanRate: 100 - automationRate, conversations: conversations.length, escalated,
      ratedCount: rated.length,
    };
  }, [rows, ratings, conversations]);

  const byDay = useMemo(() => {
    const map = new Map<string, { day: string; requests: number; completed: number }>();
    rows.forEach((r) => {
      const d = format(new Date(r.created_at), 'dd MMM');
      const e = map.get(d) || { day: d, requests: 0, completed: 0 };
      e.requests += 1;
      if (r.status === 'completed') e.completed += 1;
      map.set(d, e);
    });
    return [...map.values()].reverse();
  }, [rows]);

  const byHour = useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}h`, requests: 0 }));
    rows.forEach((r) => { arr[new Date(r.created_at).getHours()].requests += 1; });
    return arr;
  }, [rows]);

  const byCity = useMemo(() => {
    const map = new Map<string, { city: string; total: number; resolution: number[] }>();
    rows.forEach((r) => {
      const c = r.city || r.client?.city || t('corpDash.misc.noCity');
      const e = map.get(c) || { city: c, total: 0, resolution: [] };
      e.total += 1;
      if (r.completed_at) e.resolution.push((new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()) / 60000);
      map.set(c, e);
    });
    return [...map.values()]
      .map((e) => ({ city: e.city, total: e.total, avg: e.resolution.length ? e.resolution.reduce((a, b) => a + b, 0) / e.resolution.length : 0 }))
      .sort((a, b) => b.total - a.total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, t]);

  const byService = useMemo(() => {
    const map = new Map<string, { name: string; total: number; revenue: number; ratings: number[] }>();
    rows.forEach((r) => {
      const n = r.service?.name || t('corpDash.misc.noService');
      const e = map.get(n) || { name: n, total: 0, revenue: 0, ratings: [] };
      e.total += 1;
      e.revenue += Number(r.price_charged) || 0;
      map.set(n, e);
    });
    ratings.forEach((rt) => {
      const order = rows.find((r) => r.id === rt.order_id);
      const n = order?.service?.name;
      if (n && map.has(n) && typeof rt.rating === 'number') map.get(n)!.ratings.push(rt.rating);
    });
    return [...map.values()].map((e) => ({
      ...e,
      csat: e.ratings.length ? e.ratings.reduce((a, b) => a + b, 0) / e.ratings.length : 0,
    })).sort((a, b) => b.total - a.total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, ratings, t]);

  const providers = useMemo(() => {
    const map = new Map<string, { name: string; total: number; completed: number; res: number[]; rating: number | null }>();
    rows.filter((r) => r.technician_id).forEach((r) => {
      const name = r.technician?.business_name || r.technician?.contact_name || t('corpDash.prov.provider');
      const e = map.get(r.technician_id as string) || { name, total: 0, completed: 0, res: [], rating: r.technician?.rating ?? null };
      e.total += 1;
      if (r.status === 'completed') e.completed += 1;
      if (r.completed_at) e.res.push((new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()) / 60000);
      map.set(r.technician_id as string, e);
    });
    return [...map.values()].map((e) => ({
      name: e.name,
      total: e.total,
      completion: e.total ? (e.completed / e.total) * 100 : 0,
      avgRes: e.res.length ? e.res.reduce((a, b) => a + b, 0) / e.res.length : 0,
      rating: e.rating,
    })).sort((a, b) => b.completion - a.completion || b.total - a.total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, t]);

  const cancellationReasons = useMemo(() => {
    const map = new Map<string, number>();
    rows.filter((r) => r.status === 'cancelled').forEach((r) => {
      const k = r.cancellation_reason?.trim() || t('corpDash.misc.noReason');
      map.set(k, (map.get(k) || 0) + 1);
    });
    return [...map.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count).slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, t]);

  const ratingDistribution = useMemo(() => {
    const arr = [1, 2, 3, 4, 5].map((n) => ({ stars: `${n}★`, count: 0 }));
    ratings.forEach((r) => {
      const rating = Number(r.rating);
      if (Number.isFinite(rating) && rating >= 1 && rating <= 5) {
        arr[Math.round(rating) - 1].count += 1;
      }
    });
    return arr;
  }, [ratings]);

  const markers: MapMarker[] = useMemo(() => rows
    .filter((r) => {
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    })
    .slice(0, 300)
    .map((r) => ({
      id: r.id,
      lng: Number(r.longitude),
      lat: Number(r.latitude),
      type: 'service' as const,
      label: r.service?.name || r.order_number || 'Servicio',
      status: r.status || undefined,
      city: r.city || undefined,
    })), [rows]);

  const heatPoints: HeatPoint[] = useMemo(
    () => rows.map((r) => ({
      zone: r.city || r.client?.city || t('corpDash.misc.noCity'),
      date: r.created_at,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, t]
  );

  // All historical geolocated services for the live map heatmap (no marker cap)
  const geoHeatPoints = useMemo(
    () => rows
      .filter((r) => {
        const lat = Number(r.latitude);
        const lng = Number(r.longitude);
        return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
      })
      .map((r) => ({ lng: Number(r.longitude), lat: Number(r.latitude), weight: 1 })),
    [rows]
  );




  const claims = claimsData?.claims || [];
  const claimStats = useMemo(() => {
    const opened = claims.length;
    const closed = claims.filter((c) => ['approved', 'rejected', 'paid', 'closed'].includes(c.status)).length;
    const pending = opened - closed;
    const fraud = claims.filter((c) => ['high', 'critical'].includes(c.fraud_risk)).length;
    const amounts = claims.map((c) => Number(c.approved_amount || c.estimated_amount) || 0).filter(Boolean);
    const avgAmount = amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const cycles = claims.filter((c) => c.resolved_at).map((c) => (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / 86400000);
    const cycle = cycles.length ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0;
    return { opened, closed, pending, fraud, avgAmount, cycle };
  }, [claims]);

  const health = useMemo(() => {
    const parts = [
      { label: t('corpDash.score.satisfaction'), value: (m.csat / 5) * 100, weight: 0.2 },
      { label: t('corpDash.score.sla'), value: m.slaCompliance, weight: 0.2 },
      { label: t('corpDash.score.providers'), value: m.acceptanceRate, weight: 0.15 },
      { label: t('corpDash.score.automation'), value: m.automationRate, weight: 0.15 },
      { label: t('corpDash.score.financial'), value: m.revenue ? Math.min(100, (m.savings / m.revenue) * 100 + 50) : 50, weight: 0.15 },
      { label: t('corpDash.score.resolution'), value: m.avgResolution ? Math.max(0, 100 - (m.avgResolution / (24 * 60)) * 100) : 60, weight: 0.15 },
    ];
    const score = parts.reduce((a, p) => a + Math.max(0, Math.min(100, p.value)) * p.weight, 0);
    return { score: Math.round(score), parts };
  }, [m, t]);

  const insights = useMemo(() => {
    const out: string[] = [];
    if (!rows.length) return out;
    const top = byCity[0];
    if (top) out.push(t('corpDash.insight.topCity', { city: top.city, pct: pct((top.total / rows.length) * 100) }));
    const topSvc = byService[0];
    if (topSvc) out.push(t('corpDash.insight.topService', { name: topSvc.name, count: topSvc.total }));
    const bestCsat = [...byService].filter((s) => s.ratings.length).sort((a, b) => b.csat - a.csat)[0];
    if (bestCsat) out.push(t('corpDash.insight.bestCsat', { name: bestCsat.name, value: bestCsat.csat.toFixed(1) }));
    if (m.savings > 0) out.push(t('corpDash.insight.value', { value: money(m.savings) }));
    if (m.conversations) out.push(t('corpDash.insight.automation', { pct: pct(m.automationRate) }));
    out.push(t('corpDash.insight.sla', { pct: pct(m.slaCompliance), count: m.completed }));
    return out;
  }, [rows, byCity, byService, m, t]);

  const alerts = useMemo(() => {
    const out: { level: 'high' | 'medium'; text: string }[] = [];
    if (m.breached > 0) out.push({ level: 'high', text: t('corpDash.alert.breached', { count: m.breached }) });
    if (m.nearBreach > 0) out.push({ level: 'medium', text: t('corpDash.alert.nearBreach', { count: m.nearBreach }) });
    if (m.acceptanceRate < 80 && m.total > 0) out.push({ level: 'high', text: t('corpDash.alert.acceptance', { pct: pct(m.acceptanceRate) }) });
    if (m.csat && m.csat < 4) out.push({ level: 'medium', text: t('corpDash.alert.csat', { value: m.csat.toFixed(1) }) });
    if (claimStats.fraud > 0) out.push({ level: 'high', text: t('corpDash.alert.fraud', { count: claimStats.fraud }) });
    if (m.recontactRate > 25) out.push({ level: 'medium', text: t('corpDash.alert.recontact', { pct: pct(m.recontactRate) }) });
    return out;
  }, [m, claimStats, t]);

  const show = (id: string) => visible.has(id);
  const toggle = (id: string) => setVisible((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const financeByDay = useMemo(() => {
    const map = new Map<string, { day: string; revenue: number; cost: number }>();
    rows.forEach((r) => {
      const d = format(new Date(r.created_at), 'dd MMM');
      const e = map.get(d) || { day: d, revenue: 0, cost: 0 };
      e.revenue += Number(r.price_charged) || 0;
      e.cost += Number(r.technician_payment) || 0;
      map.set(d, e);
    });
    return [...map.values()].reverse();
  }, [rows]);

  // ---------------- Widgets ----------------
  const widgets: (WidgetDef & { section: SectionId })[] = useMemo(() => {
    const S = (k: string) => t(`corpDash.sections.${k}`);
    const list: (WidgetDef & { section: SectionId })[] = [
      {
        id: 'exec-kpis', section: 'executive', title: S('executive'),
        defaultLayout: { x: 0, y: 0, w: 12, h: 11, minH: 5 },
        render: () => (
          <Panel title={S('executive')} subtitle={`${format(range.from, 'dd MMM yyyy')} – ${format(range.to, 'dd MMM yyyy')}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
              <KpiCard icon={ShieldCheck} label={t('corpDash.kpi.insured')} value={String(coverage?.activeClients ?? 0)}  tone="tone-primary" />
              <KpiCard icon={ClipboardList} label={t('corpDash.kpi.requests')} value={String(m.total)}  tone="tone-violet" />
              <KpiCard icon={CheckCircle2} label={t('corpDash.kpi.completed')} value={String(m.completed)}  tone="tone-cyan" />
              <KpiCard icon={Clock} label={t('corpDash.kpi.open')} value={String(m.open)}  tone="tone-emerald" />
              <KpiCard icon={Timer} label={t('corpDash.kpi.avgResolution')} value={hrs(m.avgResolution)}  tone="tone-amber" />
              <KpiCard icon={Timer} label={t('corpDash.kpi.avgResponse')} value={hrs(m.avgResponse)}  tone="tone-indigo" />
              <KpiCard icon={Smile} label={t('corpDash.kpi.csat')} value={m.csat ? `${m.csat.toFixed(1)}/5` : na} hint={t('corpDash.kpi.ratings', { count: m.ratedCount })}  tone="tone-rose" />
              <KpiCard icon={Gauge} label={t('corpDash.kpi.nps')} value={m.ratedCount ? m.nps.toFixed(0) : na}  tone="tone-primary" />
              <KpiCard icon={HandshakeIcon} label={t('corpDash.kpi.acceptance')} value={pct(m.acceptanceRate)}  tone="tone-violet" />
              <KpiCard icon={ShieldCheck} label={t('corpDash.kpi.sla')} value={pct(m.slaCompliance)}  tone="tone-cyan" />
              <KpiCard icon={PiggyBank} label={t('corpDash.kpi.value')} value={money(m.savings)}  tone="tone-emerald" />
              <KpiCard icon={Repeat} label={t('corpDash.kpi.recontacts')} value={pct(m.recontactRate)}  tone="tone-amber" />
              <KpiCard icon={Bot} label={t('corpDash.kpi.automation')} value={pct(m.automationRate)}  tone="tone-indigo" />
              <KpiCard icon={UserCog} label={t('corpDash.kpi.human')} value={pct(m.humanRate)}  tone="tone-rose" />
              <KpiCard icon={TrendingUp} label={t('corpDash.kpi.revenue')} value={money(m.revenue)}  tone="tone-primary" />
            </div>
          </Panel>
        ),
      },
      {
        id: 'ops-trend', section: 'operations', title: t('corpDash.ops.trend'),
        defaultLayout: { x: 0, y: 11, w: 6, h: 8 },
        render: () => (
          <Panel title={t('corpDash.ops.trend')}>
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <AreaChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend formatter={(v) => t(`corpDash.ops.${v}`)} />
                <Area type="monotone" dataKey="requests" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.15} />
                <Area type="monotone" dataKey="completed" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>
        ),
      },
      {
        id: 'ops-hourly', section: 'operations', title: t('corpDash.ops.hourly'),
        defaultLayout: { x: 6, y: 11, w: 6, h: 8 },
        render: () => (
          <Panel title={t('corpDash.ops.hourly')}>
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <BarChart data={byHour}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="hour" fontSize={10} interval={1} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip formatter={(v: any) => [v, t('corpDash.ops.requests')]} />
                <Bar dataKey="requests" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        ),
      },
      {
        id: 'ops-status', section: 'operations', title: t('corpDash.ops.openVsClosed'),
        defaultLayout: { x: 0, y: 19, w: 12, h: 5 },
        render: () => (
          <Panel title={t('corpDash.ops.openVsClosed')}>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-3xl font-bold">{m.open}</p><p className="text-xs text-muted-foreground">{t('corpDash.ops.openLabel')}</p></div>
              <div><p className="text-3xl font-bold text-green-600">{m.completed}</p><p className="text-xs text-muted-foreground">{t('corpDash.ops.closedLabel')}</p></div>
              <div><p className="text-3xl font-bold text-red-500">{m.cancelled}</p><p className="text-xs text-muted-foreground">{t('corpDash.ops.cancelledLabel')}</p></div>
            </div>
            <Progress value={m.total ? (m.completed / m.total) * 100 : 0} className="mt-4" />
          </Panel>
        ),
      },
      {
        id: 'geo-map', section: 'geo', title: S('geo'),
        defaultLayout: { x: 0, y: 24, w: 8, h: 9 },
        render: () => (
          <div className="h-full overflow-hidden rounded-xl border border-border/60 bg-card">
            <MapboxMap markers={markers} className="w-full h-full" />
          </div>
        ),
      },
      {
        id: 'geo-cities', section: 'geo', title: t('corpDash.geo.topCities'),
        defaultLayout: { x: 8, y: 24, w: 4, h: 9 },
        render: () => (
          <Panel title={t('corpDash.geo.topCities')}>
            <div className="space-y-2 h-full overflow-auto">
              {byCity.slice(0, 12).map((c) => (
                <div key={c.city} className="flex items-center justify-between text-sm">
                  <span className="truncate">{c.city}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{c.total} · {c.avg ? hrs(c.avg) : '—'}</span>
                </div>
              ))}
              {!byCity.length && <p className="text-sm text-muted-foreground">{t('corpDash.geo.noData')}</p>}
            </div>
          </Panel>
        ),
      },
      {
        id: 'geo-heatmap', section: 'geo', title: t('corpDash.geo.heatmap'),
        defaultLayout: { x: 0, y: 33, w: 12, h: 10, minH: 6 },
        render: () => (
          <Panel title={t('corpDash.geo.heatmap')} subtitle={t('corpDash.geo.heatmapSubtitle')}>
            <DemandHeatmap points={heatPoints} />
          </Panel>
        ),
      },
      {
        id: 'geo-live-heatmap', section: 'geo', title: t('corpDash.geo.liveHeatmap'),
        defaultLayout: { x: 0, y: 43, w: 12, h: 11, minH: 7 },
        render: () => (
          <Panel title={t('corpDash.geo.liveHeatmap')} subtitle={t('corpDash.geo.liveHeatmapSubtitle')}>
            <MapboxHeatmapLayer points={geoHeatPoints} className="w-full h-full min-h-[260px]" />
          </Panel>
        ),
      },
      {
        id: 'cat-pie', section: 'categories', title: t('corpDash.cat.distribution'),
        defaultLayout: { x: 0, y: 33, w: 6, h: 8 },

        render: () => (
          <Panel title={t('corpDash.cat.distribution')}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <PieChart>
                <Pie data={byService.slice(0, 8)} dataKey="total" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {byService.slice(0, 8).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        ),
      },
      {
        id: 'cat-bar', section: 'categories', title: t('corpDash.cat.top'),
        defaultLayout: { x: 6, y: 33, w: 6, h: 8 },
        render: () => (
          <Panel title={t('corpDash.cat.top')}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={byService.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={130} fontSize={11} />
                <Tooltip />
                <Bar dataKey="total" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        ),
      },
      {
        id: 'cx-ratings', section: 'cx', title: t('corpDash.cx.ratingDistribution'),
        defaultLayout: { x: 0, y: 41, w: 4, h: 7 },
        render: () => (
          <Panel title={t('corpDash.cx.ratingDistribution')}>
            <ResponsiveContainer width="100%" height="100%" minHeight={160}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="stars" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        ),
      },
      {
        id: 'cx-kpis', section: 'cx', title: t('corpDash.cx.keyIndicators'),
        defaultLayout: { x: 4, y: 41, w: 4, h: 7 },
        render: () => (
          <Panel title={t('corpDash.cx.keyIndicators')}>
            <div className="space-y-3">
              {[
                [t('corpDash.kpi.csat'), m.csat ? `${m.csat.toFixed(1)}/5` : na],
                [t('corpDash.kpi.nps'), m.ratedCount ? m.nps.toFixed(0) : na],
                [t('corpDash.cx.fcr'), m.total ? pct((m.completed / m.total) * 100) : na],
                [t('corpDash.cx.waitTime'), hrs(m.avgResponse)],
                [t('corpDash.cx.repeated'), pct(m.recontactRate)],
                [t('corpDash.cx.cancellations'), String(m.cancelled)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </Panel>
        ),
      },
      {
        id: 'cx-cancel', section: 'cx', title: t('corpDash.cx.cancelReasons'),
        defaultLayout: { x: 8, y: 41, w: 4, h: 7 },
        render: () => (
          <Panel title={t('corpDash.cx.cancelReasons')}>
            <div className="space-y-2">
              {cancellationReasons.map((c) => (
                <div key={c.reason} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{c.reason}</span><Badge variant="secondary">{c.count}</Badge>
                </div>
              ))}
              {!cancellationReasons.length && <p className="text-sm text-muted-foreground">{t('corpDash.cx.noCancellations')}</p>}
            </div>
          </Panel>
        ),
      },
      {
        id: 'prov-table', section: 'providers', title: S('providers'),
        defaultLayout: { x: 0, y: 48, w: 12, h: 9 },
        render: () => (
          <Panel title={S('providers')}>
            <div className="h-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2">{t('corpDash.prov.provider')}</th>
                    <th className="py-2">{t('corpDash.prov.services')}</th>
                    <th className="py-2">{t('corpDash.prov.completionPct')}</th>
                    <th className="py-2">{t('corpDash.prov.avgTime')}</th>
                    <th className="py-2">{t('corpDash.prov.rating')}</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.slice(0, 15).map((p) => (
                    <tr key={p.name} className="border-b border-border/40">
                      <td className="py-2 font-medium truncate max-w-[220px]">{p.name}</td>
                      <td className="py-2">{p.total}</td>
                      <td className="py-2">{pct(p.completion)}</td>
                      <td className="py-2">{p.avgRes ? hrs(p.avgRes) : '—'}</td>
                      <td className="py-2">{p.rating ? p.rating.toFixed(1) : '—'}</td>
                    </tr>
                  ))}
                  {!providers.length && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">{t('corpDash.prov.none')}</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        ),
      },
      {
        id: 'fin-trend', section: 'financial', title: t('corpDash.fin.trend'),
        defaultLayout: { x: 0, y: 57, w: 8, h: 8 },
        render: () => (
          <Panel title={t('corpDash.fin.trend')}>
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <LineChart data={financeByDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v: any) => money(Number(v))} />
                <Legend formatter={(v) => (v === 'revenue' ? t('corpDash.fin.income') : t('corpDash.fin.opCost'))} />
                <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cost" stroke={CHART_COLORS[5]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        ),
      },
      {
        id: 'fin-summary', section: 'financial', title: t('corpDash.fin.summary'),
        defaultLayout: { x: 8, y: 57, w: 4, h: 8 },
        render: () => (
          <Panel title={t('corpDash.fin.summary')}>
            <div className="space-y-3">
              {[
                [t('corpDash.fin.revenue'), money(m.revenue)],
                [t('corpDash.fin.cost'), money(m.cost)],
                [t('corpDash.fin.margin'), money(m.savings)],
                [t('corpDash.fin.avgCost'), money(m.avgCost)],
                [t('corpDash.fin.billed'), String(m.completed)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </Panel>
        ),
      },
      {
        id: 'claims-kpis', section: 'claims', title: S('claims'),
        defaultLayout: { x: 0, y: 65, w: 12, h: 6 },
        render: () => (
          <Panel title={S('claims')} subtitle={t('corpDash.claims.subtitle')}>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <KpiCard icon={ClipboardList} label={t('corpDash.claims.opened')} value={String(claimStats.opened)} />
              <KpiCard icon={CheckCircle2} label={t('corpDash.claims.closed')} value={String(claimStats.closed)} />
              <KpiCard icon={Clock} label={t('corpDash.claims.pending')} value={String(claimStats.pending)} />
              <KpiCard icon={AlertTriangle} label={t('corpDash.claims.fraud')} value={String(claimStats.fraud)} />
              <KpiCard icon={Timer} label={t('corpDash.claims.cycle')} value={`${claimStats.cycle.toFixed(1)} d`} />
              <KpiCard icon={PiggyBank} label={t('corpDash.claims.avgCost')} value={money(claimStats.avgAmount)} />
            </div>
          </Panel>
        ),
      },
      {
        id: 'ai-kpis', section: 'ai', title: S('ai'),
        defaultLayout: { x: 0, y: 71, w: 12, h: 6 },
        render: () => (
          <Panel title={S('ai')}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <KpiCard icon={Bot} label={t('corpDash.ai.conversations')} value={String(m.conversations)} />
              <KpiCard icon={Sparkles} label={t('corpDash.ai.automationRate')} value={pct(m.automationRate)} />
              <KpiCard icon={UserCog} label={t('corpDash.ai.escalations')} value={String(m.escalated)} />
              <KpiCard icon={Timer} label={t('corpDash.ai.hoursSaved')} value={`${Math.round((m.conversations - m.escalated) * 0.25)} h`} />
              <KpiCard icon={Gauge} label={t('corpDash.ai.successRate')} value={pct(m.automationRate)} />
            </div>
          </Panel>
        ),
      },
      {
        id: 'sla-kpis', section: 'sla', title: S('sla'),
        defaultLayout: { x: 0, y: 77, w: 12, h: 6 },
        render: () => (
          <Panel title={S('sla')} subtitle={t('corpDash.sla.subtitle')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard icon={ShieldCheck} label={t('corpDash.sla.compliance')} value={pct(m.slaCompliance)} />
              <KpiCard icon={AlertTriangle} label={t('corpDash.sla.nearBreach')} value={String(m.nearBreach)} />
              <KpiCard icon={AlertTriangle} label={t('corpDash.sla.breached')} value={String(m.breached)} />
              <KpiCard icon={Timer} label={t('corpDash.sla.margin')} value={hrs(Math.max(0, 24 * 60 - m.avgResolution))} />
            </div>
          </Panel>
        ),
      },
      {
        id: 'bi-panel', section: 'bi', title: S('bi'),
        defaultLayout: { x: 0, y: 83, w: 12, h: 7 },
        render: () => (
          <Panel title={S('bi')} subtitle={t('corpDash.bi.subtitle')}>
            <div className="space-y-3 h-full overflow-auto">
              {insights.map((i, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{i}</span>
                </div>
              ))}
              {!insights.length && <p className="text-sm text-muted-foreground">{t('corpDash.bi.none')}</p>}
            </div>
          </Panel>
        ),
      },
      {
        id: 'alerts-panel', section: 'alerts', title: S('alerts'),
        defaultLayout: { x: 0, y: 90, w: 12, h: 7 },
        render: () => (
          <Panel title={S('alerts')}>
            <div className="space-y-3 h-full overflow-auto">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Badge variant={a.level === 'high' ? 'destructive' : 'secondary'}>
                    {a.level === 'high' ? t('corpDash.alerts.high') : t('corpDash.alerts.medium')}
                  </Badge>
                  <span>{a.text}</span>
                </div>
              ))}
              {!alerts.length && <p className="text-sm text-muted-foreground">{t('corpDash.alerts.none')}</p>}
            </div>
          </Panel>
        ),
      },
      {
        id: 'score-panel', section: 'score', title: S('score'),
        defaultLayout: { x: 0, y: 97, w: 12, h: 8 },
        render: () => (
          <Panel title={S('score')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{health.score}</p>
                <p className="text-sm text-muted-foreground">{t('corpDash.score.outOf')}</p>
                <Progress value={health.score} className="mt-4" />
              </div>
              <div className="md:col-span-2 space-y-2">
                {health.parts.map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{p.label}</span>
                      <span className="font-medium">{pct(Math.max(0, Math.min(100, p.value)))}</span>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, p.value))} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        ),
      },
    ];
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, m, coverage, byDay, byHour, byCity, byService, ratingDistribution, cancellationReasons, providers, markers, heatPoints, geoHeatPoints, financeByDay, claimStats, insights, alerts, health, range]);

  const TEMPLATES: DashboardTemplate[] = useMemo(() => [
    {
      id: 'compact', name: t('corpDash.tplCompact'),
      layout: {
        'exec-kpis': { x: 0, y: 0, w: 12, h: 9 },
        'ops-trend': { x: 0, y: 9, w: 4, h: 6 },
        'ops-hourly': { x: 4, y: 9, w: 4, h: 6 },
        'ops-status': { x: 8, y: 9, w: 4, h: 6 },
        'geo-map': { x: 0, y: 15, w: 6, h: 7 },
        'geo-cities': { x: 6, y: 15, w: 6, h: 7 },
        'cat-pie': { x: 0, y: 22, w: 6, h: 7 },
        'cat-bar': { x: 6, y: 22, w: 6, h: 7 },
        'cx-ratings': { x: 0, y: 29, w: 4, h: 6 },
        'cx-kpis': { x: 4, y: 29, w: 4, h: 6 },
        'cx-cancel': { x: 8, y: 29, w: 4, h: 6 },
        'prov-table': { x: 0, y: 35, w: 12, h: 7 },
        'fin-trend': { x: 0, y: 42, w: 8, h: 6 },
        'fin-summary': { x: 8, y: 42, w: 4, h: 6 },
        'claims-kpis': { x: 0, y: 48, w: 12, h: 5 },
        'ai-kpis': { x: 0, y: 53, w: 12, h: 5 },
        'sla-kpis': { x: 0, y: 58, w: 12, h: 5 },
        'bi-panel': { x: 0, y: 63, w: 6, h: 6 },
        'alerts-panel': { x: 6, y: 63, w: 6, h: 6 },
        'score-panel': { x: 0, y: 69, w: 12, h: 7 },
      },
    },
    {
      id: 'operations', name: t('corpDash.tplOperations'),
      layout: {
        'ops-trend': { x: 0, y: 0, w: 6, h: 9 },
        'ops-hourly': { x: 6, y: 0, w: 6, h: 9 },
        'sla-kpis': { x: 0, y: 9, w: 12, h: 6 },
        'ops-status': { x: 0, y: 15, w: 6, h: 5 },
        'alerts-panel': { x: 6, y: 15, w: 6, h: 5 },
        'geo-map': { x: 0, y: 20, w: 8, h: 9 },
        'geo-cities': { x: 8, y: 20, w: 4, h: 9 },
        'prov-table': { x: 0, y: 29, w: 12, h: 9 },
        'exec-kpis': { x: 0, y: 38, w: 12, h: 11 },
        'cat-pie': { x: 0, y: 49, w: 6, h: 8 },
        'cat-bar': { x: 6, y: 49, w: 6, h: 8 },
        'cx-ratings': { x: 0, y: 57, w: 4, h: 7 },
        'cx-kpis': { x: 4, y: 57, w: 4, h: 7 },
        'cx-cancel': { x: 8, y: 57, w: 4, h: 7 },
        'fin-trend': { x: 0, y: 64, w: 8, h: 8 },
        'fin-summary': { x: 8, y: 64, w: 4, h: 8 },
        'claims-kpis': { x: 0, y: 72, w: 12, h: 6 },
        'ai-kpis': { x: 0, y: 78, w: 12, h: 6 },
        'bi-panel': { x: 0, y: 84, w: 12, h: 7 },
        'score-panel': { x: 0, y: 91, w: 12, h: 8 },
      },
    },
    {
      id: 'financial', name: t('corpDash.tplFinancial'),
      layout: {
        'fin-trend': { x: 0, y: 0, w: 8, h: 9 },
        'fin-summary': { x: 8, y: 0, w: 4, h: 9 },
        'exec-kpis': { x: 0, y: 9, w: 12, h: 11 },
        'claims-kpis': { x: 0, y: 20, w: 12, h: 6 },
        'score-panel': { x: 0, y: 26, w: 12, h: 8 },
        'bi-panel': { x: 0, y: 34, w: 6, h: 7 },
        'alerts-panel': { x: 6, y: 34, w: 6, h: 7 },
        'cat-pie': { x: 0, y: 41, w: 6, h: 8 },
        'cat-bar': { x: 6, y: 41, w: 6, h: 8 },
        'ops-trend': { x: 0, y: 49, w: 6, h: 8 },
        'ops-hourly': { x: 6, y: 49, w: 6, h: 8 },
        'ops-status': { x: 0, y: 57, w: 12, h: 5 },
        'geo-map': { x: 0, y: 62, w: 8, h: 9 },
        'geo-cities': { x: 8, y: 62, w: 4, h: 9 },
        'cx-ratings': { x: 0, y: 71, w: 4, h: 7 },
        'cx-kpis': { x: 4, y: 71, w: 4, h: 7 },
        'cx-cancel': { x: 8, y: 71, w: 4, h: 7 },
        'prov-table': { x: 0, y: 78, w: 12, h: 9 },
        'ai-kpis': { x: 0, y: 87, w: 12, h: 6 },
        'sla-kpis': { x: 0, y: 93, w: 12, h: 6 },
      },
    },
  ], [t]);

  const [customTemplates, setCustomTemplates] = useState<StoredTemplate[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_TPL_KEY);
      if (raw) return JSON.parse(raw) as StoredTemplate[];
    } catch {}
    return [];
  });
  const [saveOpen, setSaveOpen] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [currentLayout, setCurrentLayout] = useState<any[]>([]);

  const persistCustom = (list: StoredTemplate[]) => {
    setCustomTemplates(list);
    try { localStorage.setItem(CUSTOM_TPL_KEY, JSON.stringify(list)); } catch {}
  };

  const allTemplates = useMemo<DashboardTemplate[]>(
    () => [
      ...TEMPLATES,
      ...customTemplates.map((tpl) => ({ id: tpl.id, name: tpl.name, layout: tpl.layout })),
    ],
    [TEMPLATES, customTemplates],
  );

  const activeTemplate = useMemo(
    () => allTemplates.find((tpl) => tpl.id === templateId) || null,
    [allTemplates, templateId],
  );

  const hiddenIds = useMemo(() => {
    const set = new Set<string>();
    widgets.forEach((w) => {
      if (!show(w.section)) set.add(w.id);
      if (w.section === 'claims' && (claimsData?.policies?.length ?? 0) === 0) set.add(w.id);
    });
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgets, visible, claimsData]);

  const applyTemplate = (id: string | null) => {
    setTemplateId(id);
    try {
      localStorage.removeItem(LAYOUT_KEY);
      if (id) localStorage.setItem(TEMPLATE_KEY, id);
      else localStorage.removeItem(TEMPLATE_KEY);
    } catch {}
    const custom = customTemplates.find((c) => c.id === id);
    if (custom?.sections?.length) setVisible(new Set(custom.sections));
    setGridKey((k) => k + 1);
  };

  const saveCurrentAsTemplate = () => {
    const name = newTplName.trim();
    if (!name) return;
    const source = currentLayout.length
      ? currentLayout
      : (() => { try { return (JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}').lg || []); } catch { return []; } })();
    const layout: Record<string, { x: number; y: number; w: number; h: number }> = {};
    (source || []).forEach((l: any) => { layout[l.i] = { x: l.x, y: l.y, w: l.w, h: l.h }; });
    if (!Object.keys(layout).length) {
      (activeTemplate ? Object.entries(activeTemplate.layout) : widgets.map((w) => [w.id, w.defaultLayout] as const))
        .forEach(([id, l]: any) => { layout[id] = { x: l.x, y: l.y, w: l.w, h: l.h }; });
    }
    const tpl: StoredTemplate = {
      id: `custom-${Date.now()}`,
      name,
      layout,
      sections: [...visible],
    };
    persistCustom([...customTemplates, tpl]);
    setTemplateId(tpl.id);
    try { localStorage.setItem(TEMPLATE_KEY, tpl.id); } catch {}
    setNewTplName('');
    setSaveOpen(false);
  };

  const deleteTemplate = (id: string) => {
    persistCustom(customTemplates.filter((c) => c.id !== id));
    if (templateId === id) applyTemplate(null);
  };

  const resetLayout = () => {
    try { localStorage.removeItem(LAYOUT_KEY); localStorage.removeItem(TEMPLATE_KEY); localStorage.removeItem(INSURANCE_ANALYTICS_LAYOUT_KEY); } catch {}
    setTemplateId(null);
    setGridKey((k) => k + 1);
  };


  return (
    <div className="insurance-dashboard min-h-screen">
      {!hideHeader && (
      <AppHeader
        title={t('corpDash.title')}
        subtitle={company?.['Company Name']
          ? t('corpDash.subtitleWith', { name: company['Company Name'] })
          : t('corpDash.subtitleGeneric')}
      />
      )}


      <div className="p-6 space-y-6">
        <header className="executive-welcome">
          <span className="executive-company-badge">{company ? companyName(company) : t('corpDash.company')} · Weso</span>
          <h1>{i18n.language.startsWith('es') ? 'Hola, equipo' : 'Welcome, team'}{company ? `${i18n.language.startsWith('es') ? ' de ' : ' at '}${companyName(company)}` : ''}</h1>
          <p>{i18n.language.startsWith('es') ? 'Resumen de la operación de servicios en Weso' : 'Your service operations overview in Weso'}</p>
        </header>
        {/* Filters */}
        {hideHeader ? <InsuranceDashboardToolbar
          country={country} city={city} service={category}
          countries={countries} cities={cities} services={serviceNames}
          onCountryChange={(value) => { setCountry(value); setCity('all'); }}
          onCityChange={setCity} onServiceChange={setCategory}
          range={rangeKey} ranges={RANGE_KEYS.map(range => ({ key: range.key, label: t(`corpDash.ranges.${range.i18n}`) }))}
          onRangeChange={(value) => setRangeKey(value as RangeKey)}
          editing={editing} onToggleEditing={() => setEditing(value => !value)}
          preferences={insurancePreferences}
        /> : <Card className="p-4 rounded-xl border-border/60 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-2"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">{t('corpDash.filtersTitle')}</span>
            </Button>

            {!filtersOpen && (
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {company && <Badge variant="secondary" className="gap-1"><Building2 className="w-3 h-3" />{companyName(company)}</Badge>}
                <Badge variant="outline">{country === 'all' ? t('corpDash.all') : country}</Badge>
                <Badge variant="outline">{city === 'all' ? t('corpDash.allF') : city}</Badge>
                {category !== 'all' && <Badge variant="outline">{category}</Badge>}
                <Badge variant="outline">{t(`corpDash.ranges.${RANGE_KEYS.find((r) => r.key === rangeKey)?.i18n}`)}</Badge>
              </div>
            )}

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                variant={editing ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? <Check className="w-4 h-4" /> : <Move className="w-4 h-4" />}
                {editing ? t('corpDash.done') : t('corpDash.edit')}
              </Button>

              {!hideHeader && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2"><LayoutGrid className="w-4 h-4" />{t('corpDash.layout')}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover z-50">
                  <DropdownMenuLabel>{t('corpDash.templates')}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => applyTemplate(null)}>{t('corpDash.tplDefault')}</DropdownMenuItem>
                  {TEMPLATES.map((tpl) => (
                    <DropdownMenuItem key={tpl.id} onClick={() => applyTemplate(tpl.id)}>{tpl.name}</DropdownMenuItem>
                  ))}
                  {customTemplates.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>{t('corpDash.myTemplates')}</DropdownMenuLabel>
                      {customTemplates.map((tpl) => (
                        <div key={tpl.id} className="flex items-center">
                          <DropdownMenuItem className="flex-1" onClick={() => applyTemplate(tpl.id)}>
                            {tpl.name}
                          </DropdownMenuItem>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 mr-1 text-muted-foreground hover:text-destructive"
                            title={t('corpDash.deleteTemplate')}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTemplate(tpl.id); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSaveOpen(true); }} className="gap-2">
                    <Save className="w-4 h-4" />{t('corpDash.saveAsTemplate')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t('corpDash.showSections')}</DropdownMenuLabel>
                  {SECTION_IDS.map((id) => (
                    <DropdownMenuCheckboxItem key={id} checked={show(id)} onCheckedChange={() => toggle(id)}>
                      {t(`corpDash.sections.${id}`)}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetLayout} className="gap-2">
                    <RotateCcw className="w-4 h-4" />{t('corpDash.reset')}
                  </DropdownMenuItem>
                </DropdownMenuContent>

              </DropdownMenu>}
            </div>
          </div>

          {filtersOpen && (
            <>
              <div className="flex flex-wrap items-end gap-3 mt-4">
                {!locked && (
                <div className="min-w-[220px]">
                  <label className="text-xs text-muted-foreground mb-1 block">{t('corpDash.company')}</label>
                  <Select value={companyId ? String(companyId) : ''} onValueChange={(v) => { setCompanyId(Number(v)); setCity('all'); setCountry('all'); setCategory('all'); }}>
                    <SelectTrigger><SelectValue placeholder={loadingCompanies ? t('corpDash.loading') : t('corpDash.selectCompany')} /></SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-80">
                      <div className="p-2 sticky top-0 bg-popover z-10">
                        <Input
                          placeholder={t('corpDash.searchCompany')}
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="h-8"
                        />
                      </div>
                      {filteredCompanies.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">{t('corpDash.noResults')}</div>
                      ) : (
                        filteredCompanies.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{companyName(c)}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                )}


                <div className="min-w-[150px]">
                  <label className="text-xs text-muted-foreground mb-1 block">{t('corpDash.country')}</label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">{t('corpDash.all')}</SelectItem>
                      {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[150px]">
                  <label className="text-xs text-muted-foreground mb-1 block">{t('corpDash.city')}</label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-72">
                      <SelectItem value="all">{t('corpDash.allF')}</SelectItem>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[180px]">
                  <label className="text-xs text-muted-foreground mb-1 block">{t('corpDash.service')}</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-72">
                      <SelectItem value="all">{t('corpDash.all')}</SelectItem>
                      {serviceNames.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {RANGE_KEYS.map((r) => (
                    <Button key={r.key} size="sm" variant={rangeKey === r.key ? 'default' : 'outline'} onClick={() => setRangeKey(r.key)}>
                      {t(`corpDash.ranges.${r.i18n}`)}
                    </Button>
                  ))}
                </div>
              </div>

              {company && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  {t('corpDash.scopeNote')}
                </p>
              )}
            </>
          )}

          {editing && (
            <p className="text-xs text-primary mt-2 flex items-center gap-2">
              <Move className="w-3.5 h-3.5" />{t('corpDash.editHint')}
            </p>
          )}
        </Card>}


        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        )}

        {!isLoading && !companyId && (
          <Card className="p-10 text-center text-muted-foreground rounded-xl border-border/60">{t('corpDash.selectCompanyPrompt')}</Card>
        )}

        {hideHeader && companyId && insurancePreferences.settings.visible.length === 0 && <Card className="p-8 text-center"><p>{i18n.language.startsWith('es') ? 'No hay elementos visibles. Elige un preset o activa elementos para comenzar.' : 'No widgets are visible. Choose a preset or enable widgets to begin.'}</p><Button className="mt-3" onClick={() => insurancePreferences.setOpen(true)}>{i18n.language.startsWith('es') ? 'Elegir elementos' : 'Choose widgets'}</Button></Card>}
        {ordersError && <div role="alert" className="executive-panel"><p>{i18n.language.startsWith('es') ? 'No pudimos cargar la operación.' : 'Unable to load operations.'}</p><Button variant="outline" onClick={() => retryOrders()}>{i18n.language.startsWith('es') ? 'Reintentar' : 'Retry'}</Button></div>}
        {!isLoading && !ordersError && companyId && (!hideHeader || insurancePreferences.ready) && <ExecutiveSummary key={hideHeader ? `summary-${gridKey}-${insurancePreferences.revision}` : 'summary-admin'} orders={rows} ratings={ratings} from={range.from} to={range.to} ordersPath={hideHeader ? '/insurance/orders' : '/admin/orders'} ratingsLoading={ratingsLoading} ratingsError={ratingsError} movable={hideHeader} editing={editing} storageKey={hideHeader ? insurancePreferences.keys.summary : INSURANCE_SUMMARY_LAYOUT_KEY} hiddenIds={hideHeader ? insurancePreferences.hiddenIds : undefined} />}
        {!isLoading && !ordersError && companyId && (!hideHeader || insurancePreferences.ready) && <InsuranceAnalytics key={`${companyId}-${gridKey}-${hideHeader ? insurancePreferences.revision : 0}`} companyId={companyId} orders={rows} from={range.from} to={range.to} country={country} city={city} service={category} editing={editing} storageKey={hideHeader ? insurancePreferences.keys.analytics : undefined} hiddenIds={hideHeader ? insurancePreferences.hiddenIds : undefined} />}

        {!hideHeader && !isLoading && !ordersError && companyId && (
          <section className="executive-additional">
          <h2>{i18n.language.startsWith('es') ? 'Análisis adicional' : 'Additional analysis'}</h2>
          <DashboardGrid
            key={`${gridKey}-${templateId || 'default'}`}
            widgets={widgets}
            editing={editing}
            storageKey={LAYOUT_KEY}
            activeTemplate={activeTemplate}
            hiddenIds={hiddenIds}
            onLayoutPersist={(l) => setCurrentLayout(l)}
          />
          </section>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('corpDash.saveAsTemplate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t('corpDash.templateName')}</label>
            <Input
              autoFocus
              value={newTplName}
              onChange={(e) => setNewTplName(e.target.value)}
              placeholder={t('corpDash.templateNamePlaceholder')}
              onKeyDown={(e) => { if (e.key === 'Enter') saveCurrentAsTemplate(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>{t('corpDash.cancel')}</Button>
            <Button onClick={saveCurrentAsTemplate} disabled={!newTplName.trim()} className="gap-2">
              <Save className="w-4 h-4" />{t('corpDash.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
};

export default CorporateDashboard;
