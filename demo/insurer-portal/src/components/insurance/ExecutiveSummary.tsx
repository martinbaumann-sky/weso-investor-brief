import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ArrowRight, BarChart3, Check, Clock, Coins, FileText, FolderOpen, Layers, Star, Target, TriangleAlert, Zap } from 'lucide-react';
import type { CorporateOrderRow } from '@/hooks/useCorporateDashboard';
import { DashboardGrid, type WidgetDef } from '@/components/dashboard/DashboardGrid';

type Rating = { order_id: string | null; rating: number | null; created_at: string };
interface Props {
  orders: CorporateOrderRow[];
  ratings: Rating[];
  from: Date;
  to: Date;
  ordersPath: string;
  ratingsLoading?: boolean;
  ratingsError?: boolean;
  movable?: boolean;
  editing?: boolean;
  storageKey?: string;
}

export default function ExecutiveSummary({ orders, ratings, from, to, ordersPath, ratingsLoading, ratingsError, movable = false, editing = false, storageKey }: Props) {
  const { i18n } = useTranslation();
  const es = i18n.language.startsWith('es');
  const copy = (spanish: string, english: string) => es ? spanish : english;
  const locale = es ? 'es-CL' : 'en-US';
  const number = (n: number) => n.toLocaleString(locale);
  const percent = (n: number) => `${n.toLocaleString(locale, { maximumFractionDigits: 1 })}%`;
  const data = useMemo(() => {
    const completed = orders.filter(o => o.status === 'completed');
    const cancelled = orders.filter(o => o.status === 'cancelled');
    const pending = orders.filter(o => !o.status || o.status === 'pending');
    const active = orders.filter(o => !['completed', 'cancelled'].includes(o.status || ''));
    const overdue = active.filter(o => Date.now() - Date.parse(o.created_at) > 86400000);
    const unassigned = active.filter(o => !o.technician_id);
    const pricedOrders = orders.filter(o => o.price_charged != null && Number.isFinite(Number(o.price_charged)));
    const mixedAmountCountries = new Set(pricedOrders.map(o => o.country_code || o.client?.country || 'sin país')).size > 1;
    const validRatings = ratings.filter(r => r.rating != null && r.rating >= 1 && r.rating <= 5);
    const average = validRatings.length ? validRatings.reduce((sum, r) => sum + r.rating!, 0) / validRatings.length : null;
    const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const days = new Map<string, { date: string; requests: number; completed: number }>();
    for (const date = new Date(from); date <= to; date.setDate(date.getDate() + 1)) {
      days.set(dayKey(date), { date: date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }), requests: 0, completed: 0 });
    }
    const services = new Map<string, { name: string; total: number; completed: number; ratings: number[] }>();
    const orderMap = new Map(orders.map(o => [o.id, o]));
    orders.forEach(o => {
      const day = days.get(dayKey(new Date(o.created_at)));
      if (day) { day.requests++; if (o.status === 'completed') day.completed++; }
      const name = o.service?.name || (es ? 'Sin servicio' : 'No service');
      const service = services.get(name) || { name, total: 0, completed: 0, ratings: [] };
      service.total++;
      if (o.status === 'completed') service.completed++;
      services.set(name, service);
    });
    validRatings.forEach(r => {
      const order = orderMap.get(r.order_id || '');
      if (order) services.get(order.service?.name || (es ? 'Sin servicio' : 'No service'))?.ratings.push(r.rating!);
    });
    // Only label events whose timestamps actually exist. Assignment time is not queried.
    const activity = orders.flatMap(o => [
      { id: `${o.id}-created`, date: o.created_at, kind: 'created', service: o.service?.name || o.order_number || '—' },
      ...(o.completed_at ? [{ id: `${o.id}-completed`, date: o.completed_at, kind: 'completed', service: o.service?.name || o.order_number || '—' }] : []),
    ]).concat(validRatings.map(r => ({ id: `rating-${r.order_id}-${r.created_at}`, date: r.created_at, kind: 'rating', service: `${r.rating}/5` })))
      .filter(event => Date.parse(event.date) >= from.getTime() && Date.parse(event.date) <= to.getTime())
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 4);
    return { completed, cancelled, pending, active, overdue, unassigned, validRatings, average, days: [...days.values()],
      services: [...services.values()].sort((a, b) => b.total - a.total), activity,
      amount: pricedOrders.reduce((sum, o) => sum + Number(o.price_charged), 0),
      amountCount: pricedOrders.length, mixedAmountCountries };
  }, [orders, ratings, from, to, locale, es]);
  const total = orders.length;
  const ratio = (n: number) => total ? n / total * 100 : 0;
  const completion = ratio(data.completed.length);
  const period = `${from.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${to.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  const unknown = copy('Sin datos', 'No data');
  const ratingText = ratingsError ? copy('No disponible', 'Unavailable') : ratingsLoading ? '…' : data.average == null ? '—' : `${data.average.toLocaleString(locale, { maximumFractionDigits: 1 })} / 5`;
  const statuses = [
    { label: copy('Completados', 'Completed'), count: data.completed.length, color: '#6b3df5' },
    { label: copy('En curso', 'In progress'), count: data.active.length - data.pending.length, color: '#3985ff' },
    { label: copy('Pendientes', 'Pending'), count: data.pending.length, color: '#ffc752' },
    { label: copy('Cancelados', 'Cancelled'), count: data.cancelled.length, color: '#fb6577' },
  ];
  const cards = [
    (
    <article className="executive-metric executive-hero">
                <div className="executive-label"><span className="executive-icon"><BarChart3 size={20} /></span>{copy('Operación del período', 'Period activity')}</div>
                <strong>{number(total)}</strong><span>{copy('servicios solicitados', 'requested services')}</span>
                <small>{period}</small>
                <div className="executive-spark" aria-hidden="true">{data.days.slice(-12).map((day, i, days) => <i key={i} style={{ height: `${Math.max(5, day.requests / Math.max(1, ...days.map(d => d.requests)) * 100)}%` }} />)}</div>
              </article>
    ),
    (
    <article className="executive-metric executive-lavender">
                <div className="executive-label"><span className="executive-icon"><Check size={20} /></span>{copy('Servicios completados', 'Completed services')}</div>
                <strong>{number(data.completed.length)}</strong><span>{total ? percent(completion) : unknown}</span>
                <div className="executive-track"><i style={{ width: `${completion}%` }} /></div>
              </article>
    ),
    (
    <article className="executive-metric executive-mint">
                <div className="executive-label"><span className="executive-icon"><Star size={20} /></span>{copy('Satisfacción', 'Satisfaction')}</div>
                <strong className="executive-rating">{ratingText}</strong><small>{ratingsError ? copy('No se pudieron cargar las valoraciones', 'Unable to load ratings') : `${number(data.validRatings.length)} ${copy('valoraciones', 'ratings')}`}</small>
                <div className="executive-track"><i style={{ width: `${(data.average || 0) / 5 * 100}%` }} /></div>
              </article>
    ),
    (
    <article className="executive-metric executive-rose"><div className="executive-label"><FolderOpen size={21} />{copy('Casos abiertos', 'Open cases')}</div><strong>{number(data.active.length)}</strong><small>{copy('Creados en el período', 'Created in the period')}</small><span className="executive-ring" style={{ background: `conic-gradient(#fa6a7b ${ratio(data.active.length)}%, #f4dfe4 0)` }}><b>{total ? percent(ratio(data.active.length)) : '—'}</b></span></article>
    ),
    (
    <article className="executive-metric executive-peach"><div className="executive-label"><Clock size={21} />{copy('Fuera de referencia', 'Over reference time')}</div><strong>{number(data.overdue.length)}</strong><small>{copy('Abiertos hace más de 24 h', 'Open for more than 24 h')}</small></article>
    ),
    (
    <article className="executive-metric executive-blue"><div className="executive-label"><Coins size={21} />{copy('Monto registrado', 'Recorded amount')}</div><strong className="executive-amount">{data.amountCount && !data.mixedAmountCountries ? number(data.amount) : '—'}</strong><small>{data.mixedAmountCountries ? copy('Selecciona un país para comparar montos', 'Select a country to compare amounts') : copy('Según órdenes · moneda no informada', 'From orders · currency not specified')}</small></article>
    ),
  ];
  const panels = [
    (
    <section className="executive-panel">
              <div className="executive-panel-heading"><div><h2><Activity size={20} />{copy('Evolución de la operación', 'Activity trend')}</h2><p>{copy('Solicitudes y su estado actual, por fecha de creación', 'Requests and current status, by creation date')}</p></div><span className="executive-period">{period}</span></div>
              {total ? <div className="executive-trend"><div className="executive-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.days} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}><defs><linearGradient id="executive-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--company-brand-primary, #7046fa)" stopOpacity={0.18} /><stop offset="100%" stopColor="var(--company-brand-primary, #7046fa)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e9eaf3" /><XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={42} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Area name={copy('Solicitudes', 'Requests')} type="monotone" dataKey="requests" stroke="var(--company-brand-primary, #683afa)" fill="url(#executive-fill)" strokeWidth={2.5} /><Area name={copy('Completados', 'Completed')} type="monotone" dataKey="completed" stroke="var(--company-brand-secondary, var(--company-brand-primary, #a391f8))" fill="none" strokeDasharray="5 4" strokeWidth={2} /></AreaChart></ResponsiveContainer></div><div className="executive-completion"><strong>{percent(completion)}</strong><span>{copy('completados', 'completed')}</span><small>{number(data.completed.length)} / {number(total)}</small></div></div> : <div className="executive-empty"><BarChart3 /><p>{copy('No hay servicios con estos filtros.', 'No services match these filters.')}</p><small>{copy('Prueba otro período o amplía la selección.', 'Try another period or broaden the selection.')}</small></div>}
              <div className="executive-legend"><span><i style={{ background: 'var(--company-brand-primary, #683afa)' }} />{copy('Solicitudes', 'Requests')}</span><span><i style={{ background: 'var(--company-brand-secondary, var(--company-brand-primary, #a391f8))' }} />{copy('Completados', 'Completed')}</span></div>
            </section>
    ),
    (
    <section className="executive-panel">
              <div className="executive-panel-heading"><div><h2><FileText size={20} />{copy('Desempeño por servicio', 'Service performance')}</h2><p>{copy('Principales servicios del período', 'Top services in this period')}</p></div></div>
              <div className="executive-table-scroll"><table className="executive-table"><thead><tr><th>{copy('Servicio', 'Service')}</th><th>{copy('Solicitudes', 'Requests')}</th><th>{copy('Completados', 'Completed')}</th><th>{copy('Calificación', 'Rating')}</th></tr></thead><tbody>{data.services.slice(0, 5).map(service => <tr key={service.name}><td>{service.name}</td><td>{number(service.total)}</td><td>{number(service.completed)}</td><td>{service.ratings.length ? <><Star size={14} className="executive-star" />{(service.ratings.reduce((s, n) => s + n, 0) / service.ratings.length).toLocaleString(locale, { maximumFractionDigits: 1 })}</> : '—'}</td></tr>)}{!data.services.length && <tr><td colSpan={4}>{unknown}</td></tr>}</tbody></table></div>
              <Link className="executive-action" to={ordersPath}><span className="executive-action-icon"><Zap size={18} /></span><span><b>{copy('Explorar operación', 'Explore operations')}</b><small>{copy('Consulta órdenes, estados y detalles de los servicios.', 'View orders, statuses and service details.')}</small></span><ArrowRight size={19} /></Link>
            </section>
    ),
    (
    <section className="executive-panel"><div className="executive-panel-heading"><h2><Clock size={19} />{copy('Actividad reciente', 'Recent activity')}</h2></div><p className="executive-scope">{copy('Eventos del período y filtros seleccionados', 'Events within the selected period and filters')}</p>{data.activity.map(event => <div className="executive-event" key={event.id}><span className={`executive-event-icon ${event.kind}`} >{event.kind === 'completed' ? <Check size={17} /> : event.kind === 'rating' ? <Star size={17} /> : <FileText size={17} />}</span><div><b>{event.kind === 'completed' ? copy('Servicio completado', 'Service completed') : event.kind === 'rating' ? copy('Nueva valoración', 'New rating') : copy('Solicitud recibida', 'Request received')}</b><small>{event.service}</small><time dateTime={event.date}>{new Date(event.date).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></div></div>)}{!data.activity.length && <p className="executive-scope">{copy('Sin actividad en este período.', 'No activity in this period.')}</p>}</section>
    ),
    (
    <section className="executive-panel"><div className="executive-panel-heading"><h2><Target size={20} />{copy('Dónde poner atención', 'Needs attention')}</h2></div><div className="executive-attention"><b>{number(data.unassigned.length)}</b><span>{copy('abiertos sin asignar', 'open and unassigned')}</span></div><div className="executive-attention"><b>{number(data.overdue.length)}</b><span>{copy('abiertos hace más de 24 h', 'open for more than 24 h')}</span></div><div className="executive-attention"><b>{ratingsLoading || ratingsError ? '—' : number(data.validRatings.filter(r => r.rating! <= 3).length)}</b><span>{copy('valoraciones de 1–3 estrellas', 'ratings of 1–3 stars')}</span></div><p className="executive-scope"><TriangleAlert size={12} />{copy('24 h es una referencia, no el SLA contractual.', '24 h is a reference, not a contractual SLA.')}</p></section>
    ),
    (
    <section className="executive-panel"><div className="executive-panel-heading"><h2><Layers size={20} />{copy('Estado de los servicios', 'Service status')}</h2></div><div className="executive-status-bar" aria-hidden="true">{statuses.map(status => <i key={status.label} style={{ width: `${ratio(status.count)}%`, background: status.color }} />)}</div>{statuses.map(status => <div className="executive-status-row" key={status.label}><i style={{ background: status.color }} /><span>{status.label}</span><b>{number(status.count)}</b><small>{total ? percent(ratio(status.count)) : '—'}</small></div>)}</section>
    ),
  ];
  const dashboardWidgets: WidgetDef[] = [
    { id: 'summary-period', title: 'Operación del período', defaultLayout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 }, render: () => cards[0] },
    { id: 'summary-completed', title: 'Servicios completados', defaultLayout: { x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 2 }, render: () => cards[1] },
    { id: 'summary-satisfaction', title: 'Satisfacción', defaultLayout: { x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 2 }, render: () => cards[2] },
    { id: 'summary-open', title: 'Casos abiertos', defaultLayout: { x: 0, y: 4, w: 4, h: 3, minW: 2, minH: 2 }, render: () => cards[3] },
    { id: 'summary-overdue', title: 'Fuera de referencia', defaultLayout: { x: 4, y: 4, w: 4, h: 3, minW: 2, minH: 2 }, render: () => cards[4] },
    { id: 'summary-amount', title: 'Monto registrado', defaultLayout: { x: 8, y: 4, w: 4, h: 3, minW: 2, minH: 2 }, render: () => cards[5] },
    { id: 'summary-trend', title: 'Evolución de la operación', defaultLayout: { x: 0, y: 7, w: 8, h: 6, minW: 2, minH: 2 }, render: () => panels[0] },
    { id: 'summary-activity', title: 'Actividad reciente', defaultLayout: { x: 8, y: 7, w: 4, h: 6, minW: 2, minH: 2 }, render: () => panels[2] },
    { id: 'summary-performance', title: 'Desempeño por servicio', defaultLayout: { x: 0, y: 13, w: 8, h: 7, minW: 2, minH: 2 }, render: () => panels[1] },
    { id: 'summary-attention', title: 'Dónde poner atención', defaultLayout: { x: 8, y: 13, w: 4, h: 4, minW: 2, minH: 2 }, render: () => panels[3] },
    { id: 'summary-statuses', title: 'Estado de los servicios', defaultLayout: { x: 8, y: 17, w: 4, h: 4, minW: 2, minH: 2 }, render: () => panels[4] },
  ];

  if (movable) {
    return <div className="executive-grid"><DashboardGrid widgets={dashboardWidgets} editing={editing} storageKey={storageKey || 'weso.insurance.summary.layout.v3'} wideColumns /></div>;
  }

  return (
    <div className="executive-layout">
      <div className="executive-main">
        <div className="executive-hero-row">{cards[0]}{cards[1]}{cards[2]}</div>
        <div className="executive-secondary-row">{cards[3]}{cards[4]}{cards[5]}</div>
        {panels[0]}{panels[1]}
      </div>
      <aside className="executive-rail" aria-label={copy('Actividad y alertas', 'Activity and alerts')}>{panels[2]}{panels[3]}{panels[4]}</aside>
    </div>
  );
}
