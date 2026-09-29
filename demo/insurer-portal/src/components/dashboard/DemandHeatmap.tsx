import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type HeatPoint = { zone: string; date: string | Date };

type Mode = 'hour' | 'weekday';

const HOUR_BUCKETS = [
  { label: '00-03', from: 0, to: 3 },
  { label: '04-07', from: 4, to: 7 },
  { label: '08-11', from: 8, to: 11 },
  { label: '12-15', from: 12, to: 15 },
  { label: '16-19', from: 16, to: 19 },
  { label: '20-23', from: 20, to: 23 },
];

const intensityClass = (ratio: number) => {
  if (ratio <= 0) return 'bg-muted/40';
  if (ratio < 0.2) return 'bg-primary/15';
  if (ratio < 0.4) return 'bg-primary/30';
  if (ratio < 0.6) return 'bg-primary/50';
  if (ratio < 0.8) return 'bg-primary/70';
  return 'bg-primary/90';
};

export function DemandHeatmap({ points, maxZones = 10 }: { points: HeatPoint[]; maxZones?: number }) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<Mode>('hour');

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });
    // Monday-first ordering
    return [1, 2, 3, 4, 5, 6, 0].map((d) => ({
      key: d,
      label: fmt.format(new Date(Date.UTC(2024, 0, 7 + d))),
    }));
  }, [i18n.language]);

  const columns = useMemo(
    () => (mode === 'hour' ? HOUR_BUCKETS.map((b) => b.label) : weekdayLabels.map((w) => w.label)),
    [mode, weekdayLabels]
  );

  const { grid, max, totalsByZone } = useMemo(() => {
    const zoneTotals = new Map<string, number>();
    const cells = new Map<string, number[]>();

    points.forEach((p) => {
      const d = p.date instanceof Date ? p.date : new Date(p.date);
      if (Number.isNaN(d.getTime())) return;
      const zone = p.zone || '—';
      let col: number;
      if (mode === 'hour') {
        col = HOUR_BUCKETS.findIndex((b) => d.getHours() >= b.from && d.getHours() <= b.to);
      } else {
        col = weekdayLabels.findIndex((w) => w.key === d.getDay());
      }
      if (col < 0) return;
      const arr = cells.get(zone) || new Array(mode === 'hour' ? HOUR_BUCKETS.length : 7).fill(0);
      arr[col] += 1;
      cells.set(zone, arr);
      zoneTotals.set(zone, (zoneTotals.get(zone) || 0) + 1);
    });

    const sorted = [...zoneTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxZones);
    const g = sorted.map(([zone]) => ({ zone, values: cells.get(zone) || [] }));
    const mx = g.reduce((acc, r) => Math.max(acc, ...r.values), 0);
    return { grid: g, max: mx, totalsByZone: new Map(sorted) };
  }, [points, mode, weekdayLabels, maxZones]);

  if (!grid.length) {
    return <p className="text-sm text-muted-foreground">{t('corpDash.geo.noData')}</p>;
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-border/60 p-0.5 no-drag">
          {(['hour', 'weekday'] as Mode[]).map((mk) => (
            <button
              key={mk}
              type="button"
              onClick={() => setMode(mk)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
                mode === mk ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(`corpDash.geo.${mk === 'hour' ? 'byHour' : 'byWeekday'}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{t('corpDash.geo.less')}</span>
          {[0, 0.25, 0.45, 0.65, 0.85, 1].map((r) => (
            <span key={r} className={cn('h-3 w-3 rounded-sm', intensityClass(r))} />
          ))}
          <span>{t('corpDash.geo.more')}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-1 text-[11px]">
          <thead>
            <tr>
              <th className="text-left font-medium text-muted-foreground pr-2">{t('corpDash.geo.zone')}</th>
              {columns.map((c) => (
                <th key={c} className="font-medium text-muted-foreground text-center capitalize">{c}</th>
              ))}
              <th className="font-medium text-muted-foreground text-right pl-2">{t('corpDash.geo.total')}</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.zone}>
                <td className="pr-2 max-w-[120px] truncate" title={row.zone}>{row.zone}</td>
                {columns.map((c, i) => {
                  const v = row.values[i] || 0;
                  const ratio = max ? v / max : 0;
                  return (
                    <td key={c} className="text-center">
                      <div
                        title={`${row.zone} · ${c}: ${v}`}
                        className={cn(
                          'h-7 rounded-md flex items-center justify-center font-medium transition-colors',
                          intensityClass(ratio),
                          ratio >= 0.6 ? 'text-primary-foreground' : 'text-foreground/70'
                        )}
                      >
                        {v || ''}
                      </div>
                    </td>
                  );
                })}
                <td className="text-right pl-2 tabular-nums text-muted-foreground">{totalsByZone.get(row.zone) || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DemandHeatmap;
