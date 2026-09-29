import type { ReactNode } from 'react';
import { AlertTriangle, ArrowUpRight, Building2, CalendarClock, CheckCircle2, Clock3, FileText, MapPin, Mail, Phone, ShieldCheck, UserRound, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrderStatusHistory } from '@/hooks/useOrderStatusHistory';
import { useCountryReference } from '@/hooks/useCountryReference';
import type { CorporatePlan } from '@/hooks/useCorporatePlans';
import { useInsuranceOrderDetail, type InsuranceOrderRow } from '@/hooks/useInsurancePortal';

const CLOSED = ['completed', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', assigned: 'Asignado', en_route: 'En camino',
  in_progress: 'En curso', completed: 'Completado', cancelled: 'Cancelado',
};
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja', medium: 'Normal', normal: 'Normal', high: 'Alta', urgent: 'Urgente',
};
const OPERATION_LABELS: Record<string, string> = {
  available: 'Disponible', active: 'Activo', approved: 'Aprobado', pending: 'Pendiente',
  busy: 'Ocupado', inactive: 'Inactivo', suspended: 'Suspendido', on_break: 'En pausa',
};
const MARKETPLACE_LABELS: Record<string, string> = {
  available: 'Marketplace', auto_assigned: 'Asignación automática', in_review: 'Revisión de ofertas',
  supervised_pending: 'Pendiente de supervisión', manually_assigned: 'Asignación manual',
};

function readableStatus(value: string | null | undefined) {
  if (!value) return 'No informado';
  return OPERATION_LABELS[value.toLowerCase()] || value.replace(/_/g, ' ');
}

function formatTime(value: string | null | undefined) {
  if (!value) return 'No informado';
  return /^\d{2}:\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : value;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'No informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'No informado';
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-CL', { dateStyle: 'medium' });
}

function getStatusTone(order: InsuranceOrderRow, overdue: boolean) {
  if ((!CLOSED.includes(order.status || '') && !order.technician_id) || overdue) return 'red';
  if (order.status === 'completed') return 'green';
  if (order.status === 'pending') return 'amber';
  return 'purple';
}

function DetailSection({ icon: Icon, title, children, className = '' }: { icon: LucideIcon; title: string; children: ReactNode; className?: string }) {
  return <section className={`operation-detail-section ${className}`}>
    <div className="operation-detail-section-title"><Icon size={18} /><h3>{title}</h3></div>
    {children}
  </section>;
}

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return <div className="operation-detail-item"><span>{label}</span><strong>{children || 'No informado'}</strong></div>;
}

export default function InsuranceOrderDetailDialog({
  order: selectedOrder,
  companyId,
  plans,
  open,
  onOpenChange,
}: {
  order: InsuranceOrderRow | null;
  companyId: number | null;
  plans: CorporatePlan[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: fullOrder, isLoading: detailLoading, isError: detailError } = useInsuranceOrderDetail(companyId, open ? selectedOrder?.id || null : null, open);
  const order = fullOrder || selectedOrder;
  const { data: history = [], isLoading: historyLoading } = useOrderStatusHistory(open ? order?.id : undefined);
  const { getCode, getName } = useCountryReference();

  if (!order) return null;

  const ageHours = Math.max(0, Math.floor((Date.now() - Date.parse(order.created_at)) / 3_600_000));
  const isOpen = !CLOSED.includes(order.status || '');
  const overdue = isOpen && ageHours > 24;
  const client = order.client;
  const rawCountry = order.country_code || client?.country;
  const countryCode = getCode(rawCountry);
  const countryName = countryCode ? getName(countryCode) : rawCountry;
  const plan = client?.plan_id ? plans.find((item) => item.id === client.plan_id) : undefined;
  const planStatus = !client?.plan_id
    ? 'Sin plan asociado'
    : client.is_active === false
      ? 'Cliente inactivo'
      : client.plan_expiration_date && new Date(`${client.plan_expiration_date.slice(0, 10)}T23:59:59`).getTime() < Date.now()
        ? 'Plan vencido'
        : client.plan_expiration_date ? 'Vigencia registrada' : 'Vigencia no informada';
  const durationMinutes = order.estimated_duration ?? order.service?.duration_minutes;
  const orderNumber = order.order_number || order.id;
  const city = order.city || client?.city;
  const state = order.state || client?.state;
  const locationParts = [city, state, countryName].filter(Boolean);
  const mapUrl = order.latitude != null && order.longitude != null
    ? `https://www.google.com/maps?q=${order.latitude},${order.longitude}`
    : null;
  const fallbackEvents = [
    { id: 'created', label: 'Solicitud recibida', at: order.created_at, notes: order.description },
    ...(order.technician_id ? [{ id: 'assigned', label: 'Proveedor asignado', at: null, notes: order.technician?.business_name || order.technician?.contact_name || 'Fecha de asignación no registrada' }] : []),
    ...(order.started_at ? [{ id: 'started', label: 'Servicio iniciado', at: order.started_at, notes: order.technician_notes }] : []),
    ...(order.completed_at ? [{ id: 'completed', label: 'Servicio completado', at: order.completed_at, notes: order.completion_summary }] : []),
    ...(order.cancelled_at ? [{ id: 'cancelled', label: 'Orden cancelada', at: order.cancelled_at, notes: order.cancellation_reason }] : []),
  ];
  const timeline = history.length
    ? [
        ...(history.some((event) => event.status === 'pending') ? [] : [{ id: 'created', status: 'pending', created_at: order.created_at, notes: order.description }]),
        ...history,
      ]
    : fallbackEvents.map((event) => ({ ...event, status: event.id === 'created' ? 'pending' : event.id }));

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="operation-detail-dialog">
      <DialogHeader className="operation-detail-header">
        <div className="operation-detail-header-main">
          <div>
            <span className="operation-detail-eyebrow">Ficha operativa · Orden {orderNumber}</span>
            <DialogTitle>{order.service?.name || 'Servicio solicitado'}</DialogTitle>
            <DialogDescription>{locationParts.length ? locationParts.join(' · ') : 'Ubicación no informada'}</DialogDescription>
          </div>
          <div className="operation-detail-badges">
            <span className={`ins-pill ${getStatusTone(order, overdue)}`}>{STATUS_LABELS[order.status || ''] || order.status || 'Sin estado'}</span>
            <span className={`ins-pill ${['urgent', 'high'].includes(order.priority || '') ? 'red' : 'purple'}`}>{PRIORITY_LABELS[order.priority || ''] || order.priority || 'Prioridad no informada'}</span>
          </div>
        </div>
      </DialogHeader>

      <div className="operation-detail-scroll">
        {detailLoading && <p className="operation-detail-loading">Cargando todos los datos de la orden…</p>}
        {detailError && <p className="operation-detail-loading is-error">No se pudieron cargar todos los campos. Se muestran los datos disponibles de la lista.</p>}
        <div className={`operation-detail-sla ${overdue ? 'is-overdue' : ''}`}>
          {overdue ? <AlertTriangle size={19} /> : <Clock3 size={19} />}
          <div>
            <strong>{isOpen ? overdue ? `${ageHours - 24} h sobre la referencia` : `${ageHours} h desde la solicitud` : order.status === 'completed' ? 'Servicio completado' : 'Orden cancelada'}</strong>
            <span>{isOpen ? `Antigüedad: ${ageHours} h · ${overdue ? 'requiere seguimiento' : 'dentro de las primeras 24 h'}` : `Creada ${formatDateTime(order.created_at)} · actualizada ${formatDateTime(order.updated_at)}`}</span>
          </div>
          <small>Referencia operativa de 24 h; no es un SLA contractual.</small>
        </div>

        <div className="operation-detail-grid">
          <DetailSection icon={Wrench} title="Servicio solicitado">
            <div className="operation-detail-items">
              <DetailItem label="Servicio">{order.service?.name}</DetailItem>
              <DetailItem label="Duración estimada">{durationMinutes != null ? `${durationMinutes} min` : null}</DetailItem>
              <DetailItem label="Prioridad">{PRIORITY_LABELS[order.priority || ''] || order.priority}</DetailItem>
              <DetailItem label="Canal de asignación">{order.marketplace_status ? MARKETPLACE_LABELS[order.marketplace_status] || readableStatus(order.marketplace_status) : order.technician_id ? 'Proveedor asignado' : 'Pendiente'}</DetailItem>
            </div>
            {order.service?.description && <p className="operation-detail-copy"><b>Descripción del servicio</b>{order.service.description}</p>}
            {order.description && <p className="operation-detail-copy"><b>Solicitud registrada</b>{order.description}</p>}
          </DetailSection>

          <DetailSection icon={UserRound} title="Cliente y plan">
            <div className="operation-detail-items">
              <DetailItem label="Asegurado / cliente">{client?.contact_name}</DetailItem>
              {client?.company_name && <DetailItem label="Empresa del cliente">{client.company_name}</DetailItem>}
              <DetailItem label="Plan asociado">{plan?.name || (client?.plan_id ? `Plan · ${client.plan_id.slice(0, 8)}` : 'Sin plan asociado')}</DetailItem>
              <DetailItem label="Estado del cliente">{client?.is_active == null ? 'No informado' : client.is_active ? 'Activo' : 'Inactivo'}</DetailItem>
              <DetailItem label="Inicio de vigencia">{formatDate(client?.plan_start_date)}</DetailItem>
              <DetailItem label="Vencimiento del plan">{client?.plan_expiration_date ? `${formatDate(client.plan_expiration_date)} · ${planStatus}` : planStatus}</DetailItem>
            </div>
            {(client?.phone || client?.email) && <div className="operation-detail-contact">
              {client.phone && <a href={`tel:${client.phone}`}><Phone size={14} />{client.phone}</a>}
              {client.email && <a href={`mailto:${client.email}`}><Mail size={14} />{client.email}</a>}
            </div>}
            {client?.plan_id && <p className="operation-detail-copy"><b>Validación de cobertura</b>El plan asociado es una referencia; valida sus condiciones para confirmar que este servicio esté cubierto.</p>}
          </DetailSection>

          <DetailSection icon={MapPin} title="Ubicación del servicio">
            <div className="operation-detail-items">
              <DetailItem label="Dirección">{order.address}</DetailItem>
              <DetailItem label="Ciudad / localidad">{city}</DetailItem>
              <DetailItem label="Región / estado">{state}</DetailItem>
              <DetailItem label="País">{countryName || client?.country}</DetailItem>
              <DetailItem label="Coordenadas">{order.latitude != null && order.longitude != null ? `${order.latitude}, ${order.longitude}` : 'No disponibles'}</DetailItem>
            </div>
            {mapUrl && <a className="operation-detail-link" href={mapUrl} target="_blank" rel="noreferrer">Abrir ubicación en mapa <ArrowUpRight size={15} /></a>}
          </DetailSection>

          <DetailSection icon={Building2} title="Proveedor asignado">
            {order.technician_id && order.technician
              ? <>
                  <div className="operation-detail-items">
                    <DetailItem label="Empresa proveedora">{order.technician.business_name}</DetailItem>
                    <DetailItem label="Técnico de contacto">{order.technician.contact_name}</DetailItem>
                    <DetailItem label="Estado del proveedor">{readableStatus(order.technician.status)}</DetailItem>
                    <DetailItem label="Calificación">{order.technician.rating != null ? `★ ${Number(order.technician.rating).toFixed(1)} / 5` : null}</DetailItem>
                  </div>
                  {(order.technician.phone || order.technician.email) && <div className="operation-detail-contact">
                    {order.technician.phone && <a href={`tel:${order.technician.phone}`}><Phone size={14} />{order.technician.phone}</a>}
                    {order.technician.email && <a href={`mailto:${order.technician.email}`}><Mail size={14} />{order.technician.email}</a>}
                  </div>}
                </>
              : <div className="operation-detail-empty"><UserRound size={17} />No hay proveedor asignado a esta orden.</div>}
          </DetailSection>

          <DetailSection icon={CalendarClock} title="Agenda y tiempos">
            <div className="operation-detail-items">
              <DetailItem label="Solicitud recibida">{formatDateTime(order.created_at)}</DetailItem>
              <DetailItem label="Fecha programada">{formatDate(order.scheduled_date)}</DetailItem>
              <DetailItem label="Hora programada">{formatTime(order.scheduled_time)}</DetailItem>
              <DetailItem label="Inicio del servicio">{formatDateTime(order.started_at)}</DetailItem>
              <DetailItem label="Resolución">{formatDateTime(order.completed_at)}</DetailItem>
              <DetailItem label="Última actualización">{formatDateTime(order.updated_at)}</DetailItem>
            </div>
          </DetailSection>

          <DetailSection icon={ShieldCheck} title="Seguimiento operativo">
            <div className="operation-detail-events">
              {order.provider_alert_sent && <p><CheckCircle2 size={15} />Aviso al proveedor enviado · {formatDateTime(order.provider_alert_sent_at)}</p>}
              {order.admin_escalation_sent && <p><AlertTriangle size={15} />Escalado a operaciones · {formatDateTime(order.admin_escalation_sent_at)}</p>}
              {!order.provider_alert_sent && !order.admin_escalation_sent && <span>No hay avisos o escalamientos registrados para esta orden.</span>}
              {order.status === 'cancelled' && <p><AlertTriangle size={15} />Cancelación · {formatDateTime(order.cancelled_at)}</p>}
            </div>
            {order.cancellation_reason && <p className="operation-detail-copy"><b>Motivo de cancelación</b>{order.cancellation_reason}</p>}
          </DetailSection>

          <DetailSection icon={FileText} title="Notas, cierre y monto registrado" className="operation-detail-wide">
            <div className="operation-detail-notes">
              {!order.client_notes && !order.technician_notes && !order.completion_summary && !order.completion_signed_at && <p><b>Notas y cierre</b>No hay notas adicionales ni constancia de cierre registradas.</p>}
              {order.client_notes && <p><b>Nota del cliente</b>{order.client_notes}</p>}
              {order.technician_notes && <p><b>Nota del técnico</b>{order.technician_notes}</p>}
              {order.completion_summary && <p><b>Resumen de resolución</b>{order.completion_summary}</p>}
              {order.completion_signed_at && <p><b>Constancia de cierre</b>Registrada el {formatDateTime(order.completion_signed_at)}</p>}
              <p><b>Monto cobrado al cliente</b>{order.price_charged == null ? 'No informado' : new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(Number(order.price_charged))} <span>La moneda no está informada por la fuente.</span></p>
            </div>
          </DetailSection>
        </div>

        <DetailSection icon={CalendarClock} title="Historial de estados" className="operation-detail-history">
          {historyLoading ? <p className="operation-detail-empty">Cargando movimientos registrados…</p>
            : timeline.length ? <div className="operation-detail-timeline">{timeline.map((event) => {
                const label = STATUS_LABELS[event.status || ''] || event.status || 'Actualización';
                return <div className="operation-detail-timeline-item" key={event.id}>
                  <span className="operation-detail-timeline-dot" />
                  <div><strong>{label}</strong><time>{formatDateTime(event.created_at)}</time>{event.notes && <p>{event.notes}</p>}</div>
                </div>;
              })}</div>
              : <p className="operation-detail-empty">La fuente no registra movimientos adicionales.</p>}
        </DetailSection>

        <footer className="operation-detail-footer"><span><FileText size={14} />ID interno: <code>{order.id}</code></span><small>Datos de operación asociados a {client?.company_name || 'la compañía seleccionada'}.</small></footer>
      </div>
    </DialogContent>
  </Dialog>;
}
