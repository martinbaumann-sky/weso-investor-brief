import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ALL_INSURANCE_WIDGET_IDS, INSURANCE_PRESETS, INSURANCE_DEFAULT_LAYOUT_VERSION, insurancePreferenceKeys, normalizeLayout, normalizeVisible, presetGridLayouts, type InsurancePreset, type PresetLayout } from '@/components/insurance/dashboardPresets';

function read(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function savedPresets(value: unknown): InsurancePreset[] {
  if (!Array.isArray(value)) return [];
  return value.filter(p => p && typeof p.id === 'string' && p.id.startsWith('custom-') && typeof p.name === 'string')
    .map(p => ({ id: p.id, name: p.name, visible: normalizeVisible(p.visible), summary: normalizeLayout(p.summary), analytics: normalizeLayout(p.analytics) }));
}
function storedLayout(key: string): PresetLayout {
  const stored = read(key) as { lg?: unknown[] } | null;
  return normalizeLayout(Object.fromEntries((Array.isArray(stored?.lg) ? stored.lg : []).flatMap(item => {
    if (!item || typeof item !== 'object' || !('i' in item) || typeof item.i !== 'string') return [];
    return [[item.i, item]];
  })));
}
export function useInsuranceDashboardPreferences(scope: string, es: boolean) {
  const keys = useMemo(() => insurancePreferenceKeys(scope), [scope]);
  const [settings, setSettings] = useState(() => {
    const stored = read(keys.preferences) as { visible?: unknown; custom?: unknown; selected?: unknown; layoutVersion?: number } | null;
    return { visible: normalizeVisible(stored?.visible), custom: savedPresets(stored?.custom), selected: typeof stored?.selected === 'string' ? stored.selected : 'complete', layoutVersion: stored?.layoutVersion ?? 1 };
  });
  const ready = scope === 'admin' || settings.selected !== 'complete' || settings.layoutVersion >= INSURANCE_DEFAULT_LAYOUT_VERSION;
  useEffect(() => {
    if (ready) return;
    const next = { ...settings, layoutVersion: INSURANCE_DEFAULT_LAYOUT_VERSION };
    try {
      for (const group of ['summary', 'analytics'] as const) {
        localStorage.setItem(keys[group], JSON.stringify(presetGridLayouts(INSURANCE_PRESETS[0][group])));
      }
      localStorage.setItem(keys.preferences, JSON.stringify(next));
    } catch { toast.error(es ? 'No se pudo guardar la distribución predeterminada.' : 'Unable to save the default layout.'); }
    setSettings(next);
  }, [ready, keys, settings, es]);
  const [revision, setRevision] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const hiddenIds = useMemo(() => new Set(ALL_INSURANCE_WIDGET_IDS.filter(id => !settings.visible.includes(id))), [settings.visible]);
  const persist = (next: typeof settings) => {
    setSettings(next);
    try { localStorage.setItem(keys.preferences, JSON.stringify(next)); }
    catch { toast.error(es ? 'No se pudo guardar en este navegador.' : 'Unable to save in this browser.'); }
  };
  const apply = (preset: InsurancePreset) => {
    try {
      for (const group of ['summary', 'analytics'] as const) {
        localStorage.setItem(keys[group], JSON.stringify(presetGridLayouts(preset[group])));
      }
    } catch { toast.error(es ? 'No se pudo guardar la distribución.' : 'Unable to save the layout.'); return; }
    persist({ ...settings, visible: [...preset.visible], selected: preset.id, layoutVersion: INSURANCE_DEFAULT_LAYOUT_VERSION });
    setRevision(v => v + 1);
  };
  const toggle = (id: string) => persist({ ...settings, selected: 'modified', visible: settings.visible.includes(id) ? settings.visible.filter(v => v !== id) : [...settings.visible, id] });
  const save = () => {
    if (!name.trim() || !settings.visible.length) return;
    const preset: InsurancePreset = { id: `custom-${crypto.randomUUID()}`, name: name.trim(), visible: [...settings.visible], summary: storedLayout(keys.summary), analytics: storedLayout(keys.analytics) };
    persist({ ...settings, selected: preset.id, custom: [...settings.custom, preset] });
    setName('');
    toast.success(es ? 'Preset guardado.' : 'Preset saved.');
  };
  const remove = (id: string) => persist({ ...settings, selected: settings.selected === id ? 'modified' : settings.selected, custom: settings.custom.filter(p => p.id !== id) });
  return { keys, settings, hiddenIds, ready, revision, open, setOpen, name, setName, apply, toggle, save, remove, reset: () => apply(INSURANCE_PRESETS[0]) };
}
