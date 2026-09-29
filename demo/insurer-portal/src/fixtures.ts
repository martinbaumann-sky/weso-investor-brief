// Local demo data. These adapters never contact Supabase or production systems.
const now = new Date();
now.setHours(12, 0, 0, 0);
export const company = { id: 1, 'Company Name': 'Nova Seguros · Demo', brand_primary: '#7046fa' };
const names = ['Asistencia vehicular', 'Gasfitería', 'Cerrajería', 'Cambio de batería', 'Electricidad'];
export const orders = Array.from({ length: 1248 }, (_, i) => {
  const daysAgo = i < 80 ? i % 2 : 2 + i % 59;
  const created = new Date(now.getTime() - daysAgo * 86400000 - (i % 12) * 3600000);
  const status = daysAgo > 1 ? (i % 31 === 0 ? 'cancelled' : 'completed') : ['pending', 'assigned', 'en_route', 'in_progress', 'completed'][i % 5];
  const started = new Date(created.getTime() + 22 * 60000).toISOString();
  const completed = new Date(created.getTime() + 65 * 60000).toISOString();
  const city = i % 3 === 0 ? 'Valparaíso' : 'Santiago';
  return {
    id: `demo-${i}`, order_number: `WS-${2048 + i}`, company_id: 1,
    created_at: created.toISOString(), status, started_at: status === 'completed' || status === 'in_progress' ? started : null,
    completed_at: status === 'completed' ? completed : null, cancelled_at: status === 'cancelled' ? completed : null,
    country_code: 'CL', city, state: city === 'Santiago' ? 'Región Metropolitana' : 'Valparaíso',
    latitude: (city === 'Santiago' ? -33.4489 : -33.0472) + ((i * 17 % 100) - 50) * .0011,
    longitude: (city === 'Santiago' ? -70.6693 : -71.6127) + ((i * 29 % 100) - 50) * .0014,
    price_charged: 35000 + i % 8 * 5000,
    technician_id: status === 'pending' ? null : `provider-${i % 8}`, priority: i % 9 === 0 ? 'high' : 'normal',
    description: 'Solicitud de asistencia de ejemplo. Datos ficticios para la demostración del portal.',
    completion_summary: status === 'completed' ? 'Servicio realizado y confirmado por el asegurado.' : null,
    estimated_duration: 45, address: 'Dirección de ejemplo',
    service: { id: i % 5, name: names[i % 5], duration_minutes: 45 },
    client: { id: `client-${i}`, contact_name: `Asegurado Demo ${i + 1}`, city, country: 'CL', plan_id: 1, is_active: true, plan_expiration_date: '2027-12-31' },
    technician: status === 'pending' ? null : { id: `provider-${i % 8}`, business_name: `Proveedor Demo ${i % 8 + 1}`, contact_name: 'Equipo de asistencia', status: 'active' },
  };
}).sort((a,b) => Date.parse(b.created_at) - Date.parse(a.created_at));
const ratings = orders.filter(o => o.status === 'completed').map((o, i) => ({ order_id: o.id, rating: i % 10 === 0 ? 3 : i % 5 === 0 ? 4 : 5, created_at: o.completed_at }));
const result = (data: unknown) => ({ data, isLoading: false, isPending: false, isError: false, isSuccess: true, refetch: () => {} });
export const useCorporateClients = () => result([company]);
export const useCorporateOrders = (_id: number, from: string, to: string) => result(orders.filter(o => Date.parse(o.created_at) >= Date.parse(from) && Date.parse(o.created_at) <= Date.parse(to)));
export const useCorporateRatings = (ids: string[]) => result(ratings.filter(r => ids.includes(r.order_id)));
export const useCorporateClaims = () => result({ claims: [], policies: [] });
export const useCorporateCoverage = () => result({ activeClients: 28500 });
export const useCorporateAI = () => result(orders.map((o, i) => ({ id: o.id, escalated: i % 20 === 0 })));
export const useInsuranceOrderDetail = (_company: number, id: string | null) => result(orders.find(o => o.id === id) || null);
export const useCorporatePlans = () => ({ plans: [{ id: 1, name: 'Asistencia Integral', is_active: true }] });
export const useOrderStatusHistory = () => result([]);
export const useCountryReference = () => ({ getCode: (c: string) => c, getName: (c: string) => c === 'CL' ? 'Chile' : c });
export const useMapboxToken = () => ({ token: 'public-demo-basemap', isLoading: false, error: null });
export const useAuth = () => ({ signOut: async () => {} });
export const useInsuranceCommunications = (_id: number, from: string, to: string) => {
  const rows = orders.filter(o => Date.parse(o.created_at) >= Date.parse(from) && Date.parse(o.created_at) <= Date.parse(to));
  return { calls: result(rows.map(o => ({ id: o.id, status: 'completed', duration_seconds: 65 }))), clients: result(rows.map(o => o.client)), messages: result({ sms: rows.length * 2, voice: rows.length, whatsapp: rows.length * 3 }) };
};
