import type { CorporateOrderRow } from '../../hooks/useCorporateDashboard';

export const SERVICE_STATUSES = [
  { id: 'pending', es: 'Pendientes', en: 'Pending', color: '#f59e0b' },
  { id: 'assigned', es: 'Asignadas', en: 'Assigned', color: '#22c55e' },
  { id: 'en_route', es: 'En camino', en: 'En route', color: '#3b82f6' },
  { id: 'in_progress', es: 'En curso', en: 'In progress', color: '#8b5cf6' },
  { id: 'completed', es: 'Completadas', en: 'Completed', color: '#10b981' },
  { id: 'cancelled', es: 'Canceladas', en: 'Cancelled', color: '#ef4444' },
];

export function filterAnalyticsOrders(orders: CorporateOrderRow[], country: string, city: string, service: string) {
  return orders.filter(o => Number.isFinite(Date.parse(o.created_at)) &&
    (country === 'all' || (o.country_code || o.client?.country) === country) &&
    (city === 'all' || (o.city || o.client?.city) === city) &&
    (service === 'all' || o.service?.name === service));
}

export function previousAnalyticsRange(from: Date, to: Date) {
  const days = Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86400000) + 1;
  const previousFrom = new Date(from);
  previousFrom.setDate(previousFrom.getDate() - days);
  const previousTo = new Date(from);
  previousTo.setMilliseconds(-1);
  return { from: previousFrom, to: previousTo, days };
}

export function comparisonSeries(current: CorporateOrderRow[], previous: CorporateOrderRow[], from: Date, to: Date, locale: string) {
  const prior = previousAnalyticsRange(from, to);
  const counts = (rows: CorporateOrderRow[]) => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const date = new Date(row.created_at);
      if (!Number.isFinite(date.getTime())) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  };
  const now = counts(current), before = counts(previous);
  // Compare the same number of elapsed days, grouped into readable intervals.
  const interval = prior.days > 90 ? 30 : prior.days > 31 ? 7 : 1;
  let currentTotal = 0, previousTotal = 0;
  const series: { day: string; current: number; previous: number }[] = [];
  for (let index = 0; index < prior.days; index++) {
    const date = new Date(from), old = new Date(prior.from);
    date.setDate(date.getDate() + index); old.setDate(old.getDate() + index);
    const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    currentTotal += now.get(key(date)) || 0;
    previousTotal += before.get(key(old)) || 0;
    if ((index + 1) % interval === 0 || index === prior.days - 1) {
      series.push({ day: date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }), current: currentTotal, previous: previousTotal });
    }
  }
  return series;
}
