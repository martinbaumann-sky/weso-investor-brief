import { LayoutGrid, RotateCcw, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { INSURANCE_PRESETS, INSURANCE_WIDGETS } from './dashboardPresets';
import type { useInsuranceDashboardPreferences } from '@/hooks/useInsuranceDashboardPreferences';

type Props = { preferences: ReturnType<typeof useInsuranceDashboardPreferences>; es: boolean; compact?: boolean };
const descriptions = [
  ['Todos los indicadores y análisis.', 'All metrics and analytics.'],
  ['Resultados, satisfacción y evolución.', 'Results, satisfaction and trends.'],
  ['Casos abiertos, servicios, mapa y comunicaciones.', 'Open cases, services, map and communications.'],
  ['Montos y transacciones en una columna amplia.', 'Amounts and transactions in a wide column.'],
];
const names = ['Default', 'Executive', 'Operations', 'Finance'];

export default function InsuranceDashboardPreferences({ preferences: p, es, compact = false }: Props) {
  const copy = (a: string, b: string) => es ? a : b;
  return <>
    <Button variant={compact ? 'ghost' : 'outline'} size="sm" className={compact ? 'insurance-toolbar-button gap-2' : 'gap-2'} onClick={() => p.setOpen(true)} title={copy('Presets y elementos', 'Presets and widgets')}><LayoutGrid className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />{compact ? 'Presets' : copy('Presets y elementos', 'Presets and widgets')}</Button>
    <Button variant={compact ? 'ghost' : 'outline'} size={compact ? 'icon' : 'sm'} className={compact ? 'insurance-toolbar-button w-8' : 'gap-2'} onClick={p.reset} aria-label={copy('Restablecer dashboard', 'Reset dashboard')} title={copy('Restablecer dashboard', 'Reset dashboard')}><RotateCcw className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />{!compact && copy('Restablecer', 'Reset')}</Button>
    <Dialog open={p.open} onOpenChange={p.setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{copy('Personaliza tu dashboard', 'Customize your dashboard')}</DialogTitle><DialogDescription>{copy('Elige una distribución y los elementos que quieres mostrar. Usa Editar para mover o redimensionar los bloques.', 'Choose a layout and the widgets to display. Use Edit to move or resize panels.')}</DialogDescription></DialogHeader>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label={copy('Presets disponibles', 'Available presets')}>
          {INSURANCE_PRESETS.map((preset, index) => <button type="button" key={preset.id} aria-pressed={p.settings.selected === preset.id} onClick={() => p.apply(preset)} className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${p.settings.selected === preset.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
            <strong className="block text-sm">{es ? preset.name : names[index]}</strong><span className="mt-1 block text-xs text-muted-foreground">{descriptions[index][es ? 0 : 1]}</span>
            <span aria-hidden="true" className={`mt-3 grid gap-1 ${preset.id === 'financial' ? 'grid-cols-1' : 'grid-cols-3'}`}>{Array.from({ length: 6 }, (_, i) => <i key={i} className={`h-3 rounded bg-primary/20 ${i === 0 && preset.id === 'executive' ? 'col-span-2' : ''}`} />)}</span>
          </button>)}
        </div>
        {p.settings.custom.length > 0 && <section><h3 className="mb-2 text-sm font-semibold">{copy('Mis presets', 'My presets')}</h3><div className="space-y-2">{p.settings.custom.map(preset => <div key={preset.id} className="flex items-center gap-2"><Button className="flex-1 justify-start" variant={p.settings.selected === preset.id ? 'default' : 'outline'} onClick={() => p.apply(preset)}>{preset.name}</Button><Button variant="ghost" size="icon" aria-label={`${copy('Eliminar preset', 'Delete preset')} ${preset.name}`} onClick={() => p.remove(preset.id)}><Trash2 className="h-4 w-4" /></Button></div>)}</div></section>}
        <section><div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{copy('Elementos visibles', 'Visible widgets')}</h3><span className="text-xs text-muted-foreground">{p.settings.visible.length} / {INSURANCE_WIDGETS.length}</span></div>
          <div className="grid gap-2 sm:grid-cols-2">{INSURANCE_WIDGETS.map(([id, spanish, english]) => <label key={id} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-primary" checked={p.settings.visible.includes(id)} onChange={() => p.toggle(id)} />{es ? spanish : english}</label>)}</div>
        </section>
        <div className="space-y-2 border-t pt-4"><label htmlFor="insurance-preset-name" className="text-sm font-semibold">{copy('Guardar distribución actual', 'Save current layout')}</label><div className="flex flex-wrap gap-2"><Input id="insurance-preset-name" className="min-w-0 flex-1" maxLength={80} placeholder={copy('Nombre de mi preset', 'My preset name')} value={p.name} onChange={event => p.setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') p.save(); }} /><Button disabled={!p.name.trim() || !p.settings.visible.length} onClick={p.save} className="gap-2"><Save className="h-4 w-4" />{copy('Guardar', 'Save')}</Button></div><p className="text-xs text-muted-foreground">{copy('Se guarda en este navegador para tu usuario y compañía. Los cambios se aplican al instante.', 'Saved in this browser for your account and company. Changes apply immediately.')}</p></div>
        <Button onClick={() => p.setOpen(false)}>{copy('Listo', 'Done')}</Button>
      </DialogContent>
    </Dialog>
  </>;
}
