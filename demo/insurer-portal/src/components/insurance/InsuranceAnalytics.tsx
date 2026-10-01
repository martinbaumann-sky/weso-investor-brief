import { DEMO_TMO_MINUTES } from '@/fixtures';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardGrid, type WidgetDef } from '@/components/dashboard/DashboardGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MapboxMap, { type MapMarker } from '@/components/map/MapboxMap';
import { useCorporateOrders, type CorporateOrderRow } from '@/hooks/useCorporateDashboard';
import { useInsuranceCommunications } from '@/hooks/useInsuranceCommunications';
import { useInsuranceOrderDetail } from '@/hooks/useInsurancePortal';
import { useCorporatePlans } from '@/hooks/useCorporatePlans';
import InsuranceOrderDetailDialog from './InsuranceOrderDetailDialog';
import { comparisonSeries, filterAnalyticsOrders, previousAnalyticsRange, SERVICE_STATUSES } from './insuranceAnalyticsData';
import { compactTransactionLayouts, INSURANCE_DEFAULT_LAYOUT } from './dashboardPresets';
import './analytics.css';
import './sections.css';

interface Props {
  companyId: number; orders: CorporateOrderRow[]; from: Date; to: Date;
  country: string; city: string; service: string; editing: boolean;
  storageKey?: string; hiddenIds?: Set<string>;
}
export const INSURANCE_ANALYTICS_LAYOUT_KEY = 'weso.insurance.analytics.layout.v1';
const PAGE_SIZE = 8;
const BRAND = 'var(--company-brand-primary, #7046fa)';

function Panel({ title, hint, children, wide = false }: { title: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return <section className={`executive-panel insurance-analytics-panel${wide ? ' insurance-analytics-wide' : ''}`}>
    <div className="executive-panel-heading"><div><h2>{title}</h2>{hint && <p>{hint}</p>}</div></div>
    <div className="insurance-analytics-content no-drag">{children}</div>
  </section>;
}

export default function InsuranceAnalytics({ companyId, orders, from, to, country, city, service, editing, storageKey, hiddenIds }: Props) {
  const layoutKey = storageKey || INSURANCE_ANALYTICS_LAYOUT_KEY;
  const [layoutReady, setLayoutReady] = useState(false);
  useEffect(() => {
    const migrationKey = `${layoutKey}.compact-transactions.v1`;
    try {
      if (!localStorage.getItem(migrationKey)) {
        const stored = localStorage.getItem(layoutKey);
        if (stored) localStorage.setItem(layoutKey, JSON.stringify(compactTransactionLayouts(JSON.parse(stored))));
        localStorage.setItem(migrationKey, '1');
      }
    } catch { /* The grid falls back to its defaults if browser storage is unavailable. */ }
    setLayoutReady(true);
  }, [layoutKey]);
  const { i18n } = useTranslation();
  const es = i18n.language.startsWith('es');
  const copy = (a: string, b: string) => es ? a : b;
  const locale = es ? 'es-CL' : 'en-US';
  const n = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 1 });
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [pageState, setPage] = useState({ key: '', page: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useInsuranceOrderDetail(companyId, selectedId, !!selectedId);
  const { plans } = useCorporatePlans(companyId, { enabled: !!selectedId });
  const prior = useMemo(() => previousAnalyticsRange(from, to), [from, to]);
  const previous = useCorporateOrders(companyId, prior.from.toISOString(), prior.to.toISOString());
  const comm = useInsuranceCommunications(companyId, from.toISOString(), to.toISOString());
  const priorRows = useMemo(() => filterAnalyticsOrders(previous.data || [], country, city, service), [previous.data, country, city, service]);
  const comparison = useMemo(() => comparisonSeries(orders, priorRows, from, to, locale), [orders, priorRows, from, to, locale]);
  const hourly = useMemo(() => {
    const bins = Array.from({ length: 24 }, (_, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, total: 0 }));
    for (const order of orders) bins[new Date(order.created_at).getHours()].total++;
    return bins;
  }, [orders]);
  const top = useMemo(() => {
    const totals = new Map<string, number>();
    for (const order of orders) {
      const name = order.service?.name || (es ? 'Sin servicio' : 'Unknown service');
      totals.set(name, (totals.get(name) || 0) + 1);
    }
    return [...totals].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [orders, es]);
  const markers = useMemo<MapMarker[]>(() => orders.filter(o => o.latitude != null && o.longitude != null &&
    Number.isFinite(o.latitude) && Number.isFinite(o.longitude) && Math.abs(o.latitude) <= 90 && Math.abs(o.longitude) <= 180)
    .map(o => ({ id: o.id, lat: o.latitude!, lng: o.longitude!, type: 'service', label: o.service?.name || o.order_number || o.id,
      status: o.status || undefined, city: o.city || undefined })), [orders]);
  const filtered = useMemo(() => orders.filter(o => (status === 'all' || (status === 'unknown'
    ? !SERVICE_STATUSES.some(s => s.id === o.status) : o.status === status)) &&
    (!search.trim() || [o.order_number, o.service?.name, o.city, o.technician?.business_name, o.technician?.contact_name]
      .some(value => value?.toLowerCase().includes(search.trim().toLowerCase())))), [orders, status, search]);
  const key = [companyId, from.toISOString(), to.toISOString(), country, city, service, status, search].join('|');
  const page = Math.min(pageState.key === key ? pageState.page : 0, Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  const recent = useMemo(() => [...orders].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 8), [orders]);
  const statusText = (id: string | null) => {
    const definition = SERVICE_STATUSES.find(s => s.id === id);
    return definition ? (es ? definition.es : definition.en) : copy('Sin estado reconocido', 'Unknown status');
  };
  const callCount = comm.calls.data?.length || 0;
  const tmoMinutes = DEMO_TMO_MINUTES;
  const minutesUsed = callCount * tmoMinutes;
  const decimal = (value: number) => value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const unavailable = copy('No disponible', 'Unavailable');
  const callValue = (value: string) => comm.calls.isError ? unavailable : comm.calls.isPending ? '…' : value;
  const msgValue = (value: number) => comm.clients.isError || comm.messages.isError ? unavailable : comm.messages.isPending ? '…' : n(value);
  const openOrder = (id: string) => setSelectedId(id);
  const statusOptions = [...SERVICE_STATUSES, ...(orders.some(o => !SERVICE_STATUSES.some(s => s.id === o.status))
    ? [{ id: 'unknown', es: 'Sin estado reconocido', en: 'Unknown status', color: '#94a3b8' }] : [])];
  const orderMatchesStatus = (o: CorporateOrderRow, id: string) => id === 'unknown'
    ? !SERVICE_STATUSES.some(s => s.id === o.status) : o.status === id;

  const panels = [
    <Panel title={copy('Demanda por hora del día', 'Demand by hour')} hint={`${copy('Solicitudes creadas · Zona horaria', 'Requests created · Time zone')}: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`}>
      <div className="insurance-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={hourly}><CartesianGrid vertical={false} strokeDasharray="3 4" /><XAxis dataKey="hour" interval={3} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar name={copy('Solicitudes', 'Requests')} dataKey="total" fill={BRAND} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
    </Panel>,
    <Panel title={copy('Comparación de servicios en el tiempo', 'Service comparison over time')} hint={copy('Solicitudes acumuladas · Períodos consecutivos de igual duración', 'Cumulative requests · Consecutive periods of equal length')}>
      <p className="executive-scope">{prior.from.toLocaleDateString(locale)} – {prior.to.toLocaleDateString(locale)} / {from.toLocaleDateString(locale)} – {to.toLocaleDateString(locale)}</p>
      {previous.isPending ? <p role="status">{copy('Cargando período anterior…', 'Loading previous period…')}</p> : previous.isError ? <div role="alert">{unavailable} <Button variant="outline" onClick={() => previous.refetch()}>{copy('Reintentar', 'Retry')}</Button></div> :
        <div className="insurance-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={comparison}><CartesianGrid vertical={false} strokeDasharray="3 4" /><XAxis dataKey="day" minTickGap={40} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line type="monotone" name={copy('Período actual', 'Current period')} dataKey="current" stroke={BRAND} strokeWidth={3} dot={comparison.length <= 12 ? { r: 3, fill: BRAND } : false} /><Line type="monotone" name={copy('Período anterior', 'Previous period')} dataKey="previous" stroke="#94a3b8" strokeDasharray="5 4" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>}
    </Panel>,
    <Panel title={copy('Mapa de servicios', 'Service map')} hint={`${n(markers.length)} / ${n(orders.length)} ${copy('servicios con coordenadas · Filtros del dashboard', 'services with coordinates · Dashboard filters')}`}>
      <MapboxMap markers={markers} center={[-70, -10]} zoom={1.2} clusterMarkers onMarkerClick={marker => openOrder(marker.id)} onShowDetails={marker => openOrder(marker.id)} className="insurance-service-map" />
      {markers.length < orders.length && <p className="executive-scope">{copy(`${n(orders.length - markers.length)} servicios no tienen coordenadas registradas y no aparecen en el mapa.`, `${n(orders.length - markers.length)} services have no recorded coordinates and are not shown on the map.`)}</p>}
      <div className="insurance-status-legend">{SERVICE_STATUSES.map(s => <span key={s.id}><i style={{ background: s.color }} />{es ? s.es : s.en}</span>)}</div>
    </Panel>,
    <Panel title={copy('Servicios Top', 'Top services')} hint={copy('Servicios más solicitados en el período', 'Most requested services in this period')}>
      {top.length ? <div className="insurance-top-services">{top.map((item, index) => <div key={item.name}><span>{index + 1}</span><div><b>{item.name}</b><div className="executive-track"><i style={{ width: `${item.total / top[0].total * 100}%`, background: BRAND }} /></div></div><strong>{n(item.total)}</strong></div>)}</div> : <p className="executive-empty">{copy('Sin servicios en el período.', 'No services in this period.')}</p>}
    </Panel>,
    <Panel wide title={copy('Transacciones recientes', 'Recent transactions')} hint={copy('Últimas órdenes y su monto registrado · La fecha corresponde a la solicitud', 'Latest orders and recorded amounts · Dates refer to requests')}>
      <div className="executive-table-scroll"><table className="executive-table"><thead><tr>{[copy('Orden', 'Order'), copy('Cliente', 'Client'), copy('Servicio', 'Service'), copy('Monto registrado', 'Recorded amount'), copy('Estado', 'Status'), copy('Fecha', 'Date')].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{recent.map(o => <tr key={o.id}><td><button className="insurance-order-link" onClick={() => openOrder(o.id)}>{o.order_number || o.id.slice(0, 8)}</button></td><td>{o.client?.contact_name || '—'}</td><td>{o.service?.name || '—'}</td><td>{o.price_charged == null ? '—' : n(Number(o.price_charged))} <small>{o.country_code || o.client?.country || '—'}</small></td><td>{statusText(o.status)}</td><td>{new Date(o.created_at).toLocaleString(locale)}</td></tr>)}{!recent.length && <tr><td colSpan={6}>{copy('Sin transacciones en el período.', 'No transactions in this period.')}</td></tr>}</tbody></table></div>
      <p className="executive-scope">{copy('Importes de órdenes; no confirma cobro ni pago. Moneda no informada en el registro.', 'Order amounts; collection or payment is not confirmed. Currency is not specified in the record.')}</p>
    </Panel>,
    <Panel wide title={copy('Detalle de servicios', 'Service details')} hint={copy('Órdenes creadas en el período · Selecciona un estado o una orden para ver sus detalles', 'Orders created in this period · Select a status or an order to view details')}>
      <div className="insurance-status-filters"><Button variant={status === 'all' ? 'default' : 'outline'} onClick={() => setStatus('all')}>{copy('Todas', 'All')} · {n(orders.length)}</Button>{statusOptions.map(s => <Button key={s.id} variant={status === s.id ? 'default' : 'outline'} onClick={() => setStatus(s.id)}><i style={{ background: s.color }} />{es ? s.es : s.en} · {n(orders.filter(o => orderMatchesStatus(o, s.id)).length)}</Button>)}</div>
      <div className="insurance-order-toolbar"><Input aria-label={copy('Buscar servicios', 'Search services')} placeholder={copy('Buscar por orden, servicio, ciudad o proveedor…', 'Search order, service, city or provider…')} value={search} onChange={e => setSearch(e.target.value)} /><Button variant={view === 'kanban' ? 'default' : 'outline'} onClick={() => setView('kanban')}>Kanban</Button><Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')}>{copy('Lista', 'List')}</Button></div>
      {view === 'kanban' ? <div className="insurance-kanban">{statusOptions.filter(s => status === 'all' || status === s.id).map(s => {
        const group = filtered.filter(o => orderMatchesStatus(o, s.id));
        return <section key={s.id}><h3 style={{ borderColor: s.color }}>{es ? s.es : s.en}<span>{n(group.length)}</span></h3><div>{group.map(o => <button key={o.id} onClick={() => openOrder(o.id)}><b>{o.service?.name || o.order_number || o.id.slice(0, 8)}</b><small>{o.order_number} · {o.city || o.client?.city || '—'}</small><small>{o.scheduled_date || new Date(o.created_at).toLocaleDateString(locale)}</small><span>{o.technician?.business_name || o.technician?.contact_name || copy('Sin asignar', 'Unassigned')}</span></button>)}{!group.length && <p>{copy('Sin órdenes', 'No orders')}</p>}</div></section>;
      })}</div> : <><div className="executive-table-scroll"><table className="executive-table"><thead><tr><th>{copy('Orden / Servicio', 'Order / Service')}</th><th>{copy('Estado', 'Status')}</th><th>{copy('Ciudad', 'City')}</th><th>{copy('Proveedor', 'Provider')}</th></tr></thead><tbody>{filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(o => <tr key={o.id}><td><button className="insurance-order-link" onClick={() => openOrder(o.id)}>{o.order_number || o.id.slice(0, 8)} · {o.service?.name}</button></td><td>{statusText(o.status)}</td><td>{o.city || o.client?.city || '—'}</td><td>{o.technician?.business_name || o.technician?.contact_name || copy('Sin asignar', 'Unassigned')}</td></tr>)}{!filtered.length && <tr><td colSpan={4}>{copy('No hay órdenes con estos filtros.', 'No orders match these filters.')}</td></tr>}</tbody></table></div><div className="insurance-pagination"><span>{n(filtered.length)} {copy('órdenes', 'orders')} · {page + 1} / {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}</span><Button variant="outline" disabled={!page} onClick={() => setPage({ key, page: page - 1 })}>{copy('Anterior', 'Previous')}</Button><Button variant="outline" disabled={(page + 1) * PAGE_SIZE >= filtered.length} onClick={() => setPage({ key, page: page + 1 })}>{copy('Siguiente', 'Next')}</Button></div></>}
      {selectedId && detail.isPending && <p role="status">{copy('Cargando detalle…', 'Loading details…')}</p>}
      {selectedId && (detail.isError || (detail.isSuccess && !detail.data)) && <p role="alert">{copy('No se pudo cargar el detalle.', 'Unable to load details.')} <Button onClick={() => detail.refetch()}>{copy('Reintentar', 'Retry')}</Button><Button variant="ghost" onClick={() => setSelectedId(null)}>{copy('Cerrar', 'Close')}</Button></p>}
      {detail.data && selectedId && <InsuranceOrderDetailDialog order={detail.data} companyId={companyId} plans={plans} open onOpenChange={open => { if (!open) setSelectedId(null); }} />}
    </Panel>,
    <Panel wide title={copy('Detalles de comunicación', 'Communication details')} hint={copy('Actividad de la compañía en el período seleccionado · No aplica filtro de ciudad o servicio', 'Company activity in the selected period · City and service filters do not apply')}>
      <div className="insurance-comm-metrics">{[
        [copy('Llamadas registradas', 'Recorded calls'), callValue(n(comm.calls.data?.length || 0))],
        [copy('TMO promedio', 'Average AHT'), callValue(`${decimal(tmoMinutes)} min`)],
        [copy('Solicitudes de servicio', 'Service requests'), n(orders.length)],
        ['SMS', msgValue(comm.messages.data?.sms || 0)],
        ['VOICE', msgValue(comm.messages.data?.voice || 0)],
        ['WhatsApp', msgValue(comm.messages.data?.whatsapp || 0)],
        [copy('Minutos utilizados', 'Minutes used'), callValue(decimal(minutesUsed))],
      ].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
      <p className="executive-scope">{copy('TMO promedio: 4,23 minutos por llamada. Minutos utilizados = llamadas registradas × TMO promedio. SMS y WhatsApp: mensajes registrados, entrantes y salientes. VOICE: conversaciones con mensajes de voz en el período.', 'Average AHT: 4.23 minutes per call. Minutes used = recorded calls × average AHT. SMS and WhatsApp: recorded inbound and outbound messages. VOICE: conversations with voice messages in the period.')}</p>
      <p className="executive-scope">{copy('Solo llamadas vinculadas a clientes de esta compañía y mensajes de conversaciones de sus usuarios. Actividad sin vínculo con un cliente o usuario no se incluye.', 'Only calls linked to company clients and messages in their users’ conversations. Activity without a client or user link is excluded.')}</p>
      {(comm.calls.isError || comm.clients.isError || comm.messages.isError) && <div role="alert">{copy('Parte de los datos de comunicación no está disponible.', 'Some communication data is unavailable.')} <Button variant="outline" onClick={() => { comm.calls.refetch(); comm.clients.refetch(); if (comm.clients.isSuccess) comm.messages.refetch(); }}>{copy('Reintentar', 'Retry')}</Button></div>}
    </Panel>,
  ];
  const layouts = Object.entries(INSURANCE_DEFAULT_LAYOUT.analytics).map(([id, layout]) => ({ id, ...layout }));
  const widgets: WidgetDef[] = layouts.map(({ id, ...layout }, index) => ({
    id,
    title: panels[index].props.title,
    defaultLayout: { ...layout, minW: 2, minH: id === 'analytics-transactions' ? 3 : 5 },
    render: () => panels[index],
  }));
  return <div className="executive-grid insurance-analytics">
    {layoutReady && <DashboardGrid widgets={widgets} editing={editing} storageKey={layoutKey} hiddenIds={hiddenIds} wideColumns />}
  </div>;
}
