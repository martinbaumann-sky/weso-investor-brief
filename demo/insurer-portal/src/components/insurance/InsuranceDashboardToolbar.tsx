import { Check, Move, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import InsuranceDashboardPreferences from './InsuranceDashboardPreferences';
import type { useInsuranceDashboardPreferences } from '@/hooks/useInsuranceDashboardPreferences';

type Props = {
  country: string; city: string; service: string;
  countries: string[]; cities: string[]; services: string[];
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  range: string; ranges: { key: string; label: string }[];
  onRangeChange: (value: string) => void;
  editing: boolean; onToggleEditing: () => void;
  preferences: ReturnType<typeof useInsuranceDashboardPreferences>;
};

export default function InsuranceDashboardToolbar(props: Props) {
  const { t, i18n } = useTranslation();
  const es = i18n.language.startsWith('es');
  const active = [props.country, props.city, props.service].filter(value => value !== 'all');
  const fields = [
    { id: 'country', label: t('corpDash.country'), value: props.country, options: props.countries, onChange: props.onCountryChange, all: t('corpDash.all') },
    { id: 'city', label: t('corpDash.city'), value: props.city, options: props.cities, onChange: props.onCityChange, all: t('corpDash.allF') },
    { id: 'service', label: t('corpDash.service'), value: props.service, options: props.services, onChange: props.onServiceChange, all: t('corpDash.all') },
  ];
  return <div className="insurance-summary-toolbar">
    <div className="insurance-summary-toolbar-row">
      <Select value={props.range} onValueChange={props.onRangeChange}>
        <SelectTrigger className="insurance-period-select" aria-label={es ? 'Período del dashboard' : 'Dashboard period'}><SelectValue /></SelectTrigger>
        <SelectContent>{props.ranges.map(range => <SelectItem key={range.key} value={range.key}>{range.label}</SelectItem>)}</SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild><Button variant="ghost" size="sm" className="insurance-toolbar-button gap-2"><SlidersHorizontal className="h-3.5 w-3.5" />{t('corpDash.filtersTitle')}{active.length > 0 && <span className="insurance-filter-count">{active.length}</span>}</Button></PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-3">
          <h2 className="text-sm font-semibold">{t('corpDash.filtersTitle')}</h2>
          {fields.map(field => <div key={field.id} className="space-y-1"><label htmlFor={`summary-filter-${field.id}`} className="text-xs text-muted-foreground">{field.label}</label><Select value={field.value} onValueChange={field.onChange}><SelectTrigger id={`summary-filter-${field.id}`} className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent className="max-h-72"><SelectItem value="all">{field.all}</SelectItem>{field.options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>)}
          {active.length > 0 && <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { props.onCountryChange('all'); props.onCityChange('all'); props.onServiceChange('all'); }}>{es ? 'Limpiar filtros' : 'Clear filters'}</Button>}
          <p className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">{t('corpDash.scopeNote')}</p>
        </PopoverContent>
      </Popover>
      {active.length > 0 && <span className="insurance-filter-summary" title={active.join(' · ')}>{active.join(' · ')}</span>}
      <div className="insurance-toolbar-actions">
        <Button variant={props.editing ? 'default' : 'ghost'} size="sm" className="insurance-toolbar-button gap-2" onClick={props.onToggleEditing}>{props.editing ? <Check className="h-3.5 w-3.5" /> : <Move className="h-3.5 w-3.5" />}{props.editing ? t('corpDash.done') : es ? 'Editar' : 'Edit'}</Button>
        <InsuranceDashboardPreferences preferences={props.preferences} es={es} compact />
      </div>
    </div>
    {props.editing && <p className="mt-2 text-xs text-muted-foreground">{t('corpDash.editHint')}</p>}
  </div>;
}
