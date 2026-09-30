export type Placement = { x: number; y: number; w: number; h: number };
export type PresetLayout = Record<string, Placement>;
export type InsurancePreset = { id: string; name: string; visible: string[]; summary: PresetLayout; analytics: PresetLayout };

export const INSURANCE_WIDGETS = [
  ['summary-period', 'Operación del período', 'Period activity', 6, 4],
  ['summary-completed', 'Servicios completados', 'Completed services', 3, 4],
  ['summary-satisfaction', 'Satisfacción', 'Satisfaction', 3, 4],
  ['summary-open', 'Casos abiertos', 'Open cases', 4, 3],
  ['summary-overdue', 'Fuera de referencia', 'Over reference time', 4, 3],
  ['summary-amount', 'Monto registrado', 'Recorded amount', 4, 3],
  ['summary-trend', 'Evolución de la operación', 'Activity trend', 8, 6],
  ['summary-activity', 'Actividad reciente', 'Recent activity', 4, 6],
  ['summary-performance', 'Desempeño por servicio', 'Service performance', 8, 7],
  ['summary-attention', 'Dónde poner atención', 'Where to focus', 4, 4],
  ['summary-statuses', 'Estado de los servicios', 'Service statuses', 4, 4],
  ['analytics-demand', 'Demanda por hora', 'Demand by hour', 6, 8],
  ['analytics-comparison', 'Comparación de períodos', 'Period comparison', 6, 8],
  ['analytics-map', 'Mapa de servicios', 'Service map', 6, 10],
  ['analytics-top', 'Servicios Top', 'Top services', 6, 10],
  ['analytics-transactions', 'Transacciones recientes', 'Recent transactions', 12, 5],
  ['analytics-orders', 'Detalle de servicios', 'Service details', 12, 14],
  ['analytics-communications', 'Detalles de comunicación', 'Communication details', 12, 8],
] as const;
export const ALL_INSURANCE_WIDGET_IDS = INSURANCE_WIDGETS.map(w => w[0]);
export const INSURANCE_DEFAULT_LAYOUT_VERSION = 3;

export const INSURANCE_DEFAULT_LAYOUT: { summary: PresetLayout; analytics: PresetLayout } = {
  summary: {
    'summary-period': { x: 0, y: 0, w: 4, h: 4 },
    'summary-completed': { x: 4, y: 0, w: 4, h: 4 },
    'summary-satisfaction': { x: 8, y: 0, w: 4, h: 4 },
    'summary-open': { x: 0, y: 4, w: 4, h: 4 },
    'summary-overdue': { x: 4, y: 4, w: 4, h: 4 },
    'summary-amount': { x: 8, y: 4, w: 4, h: 4 },
    'summary-trend': { x: 0, y: 8, w: 12, h: 6 },
    'summary-performance': { x: 0, y: 14, w: 8, h: 7 },
    'summary-activity': { x: 8, y: 14, w: 4, h: 7 },
    'summary-attention': { x: 0, y: 21, w: 6, h: 5 },
    'summary-statuses': { x: 6, y: 21, w: 6, h: 5 },
  },
  analytics: {
    'analytics-demand': { x: 0, y: 0, w: 6, h: 6 },
    'analytics-comparison': { x: 6, y: 0, w: 6, h: 6 },
    'analytics-map': { x: 0, y: 6, w: 6, h: 8 },
    'analytics-top': { x: 6, y: 6, w: 6, h: 8 },
    'analytics-transactions': { x: 0, y: 14, w: 12, h: 5 },
    'analytics-orders': { x: 0, y: 19, w: 12, h: 11 },
    'analytics-communications': { x: 0, y: 30, w: 12, h: 7 },
  },
};

/** Pack each grid independently, in priority order, without overlapping panels. */
export function presetLayout(ids: string[], group: 'summary' | 'analytics', stacked = false): PresetLayout {
  const layout: PresetLayout = {};
  let x = 0, y = 0, rowHeight = 0;
  for (const id of ids.filter(id => id.startsWith(`${group}-`))) {
    const widget = INSURANCE_WIDGETS.find(w => w[0] === id);
    if (!widget) continue;
    const w = stacked ? 12 : widget[3], h = widget[4];
    if (x + w > 12) { y += rowHeight; x = 0; rowHeight = 0; }
    layout[id] = { x, y, w, h };
    x += w;
    rowHeight = Math.max(rowHeight, h);
  }
  return layout;
}
function makePreset(id: string, name: string, visible: string[], stacked = false): InsurancePreset {
  return { id, name, visible, summary: presetLayout(visible, 'summary', stacked), analytics: presetLayout(visible, 'analytics', stacked) };
}
export const INSURANCE_PRESETS = [
  { id: 'complete', name: 'Predeterminado', visible: [...ALL_INSURANCE_WIDGET_IDS], ...INSURANCE_DEFAULT_LAYOUT },
  makePreset('executive', 'Ejecutivo', ['summary-period', 'summary-completed', 'summary-satisfaction', 'summary-amount', 'summary-trend', 'summary-attention', 'analytics-comparison', 'analytics-top']),
  makePreset('operations', 'Operación', ['summary-open', 'summary-overdue', 'summary-completed', 'summary-statuses', 'summary-attention', 'summary-activity', 'analytics-orders', 'analytics-map', 'analytics-demand', 'analytics-communications']),
  makePreset('financial', 'Finanzas', ['summary-amount', 'summary-period', 'summary-completed', 'summary-trend', 'summary-performance', 'analytics-transactions', 'analytics-comparison'], true),
];
export function normalizeVisible(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && ALL_INSURANCE_WIDGET_IDS.some(known => known === id)))] : [...ALL_INSURANCE_WIDGET_IDS];
}
export function normalizeLayout(value: unknown): PresetLayout {
  const result: PresetLayout = {};
  if (!value || typeof value !== 'object') return result;
  for (const [id, raw] of Object.entries(value)) {
    if (!ALL_INSURANCE_WIDGET_IDS.some(known => known === id) || !raw || typeof raw !== 'object') continue;
    const { x, y, w, h } = raw as Placement;
    if ([x, y, w, h].every(Number.isFinite) && x >= 0 && y >= 0 && w >= 2 && x + w <= 12 && h >= 2) result[id] = { x, y, w, h };
  }
  return result;
}
export function insurancePreferenceKeys(scope: string) {
  const base = `weso.insurance.preferences.v1.${encodeURIComponent(scope)}`;
  return { preferences: base, summary: `${base}.summary`, analytics: `${base}.analytics` };
}

export function presetGridLayouts(layout: PresetLayout) {
  const lg = Object.entries(layout).map(([i, position]) => ({ i, ...position, minW: 2, minH: i === 'analytics-transactions' ? 3 : i.startsWith('analytics-') ? 5 : 2 }));
  const ordered = [...lg].sort((a, b) => a.y - b.y || a.x - b.x);
  const compact = (columns: number) => {
    let y = 0;
    return ordered.map(item => {
      const result = { ...item, x: 0, y, w: columns };
      y += item.h;
      return result;
    });
  };
  return { lg, md: lg, sm: lg, xs: compact(6), xxs: compact(2) };
}

/** Upgrade the old default height; leave manually resized panels untouched. */
export function compactTransactionLayouts(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([breakpoint, items]) => [breakpoint,
    Array.isArray(items) ? items.map(item => {
      if (!item || item.i !== 'analytics-transactions') return item;
      const defaultWidth = breakpoint === 'xxs' ? 2 : breakpoint === 'xs' ? 6 : 12;
      return { ...item, h: item.h === 10 && item.w === defaultWidth ? 5 : item.h, minH: 3 };
    }) : items,
  ]));
}
