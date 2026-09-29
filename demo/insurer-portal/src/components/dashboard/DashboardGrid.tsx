import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Responsive as ResponsiveRaw } from 'react-grid-layout';
const Responsive = ResponsiveRaw as any;

import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

type LayoutItem = { i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number };
type Layouts = { [breakpoint: string]: LayoutItem[] };

export type WidgetDef = {
  id: string;
  title?: string;
  render: () => ReactNode;
  /** Default layout on lg breakpoint: {x,y,w,h} in a 12-col grid */
  defaultLayout: { x: number; y: number; w: number; h: number; minW?: number; minH?: number };
};

export type DashboardTemplate = {
  id: string;
  name: string;
  description?: string;
  /** Per-widget-id overrides for lg breakpoint */
  layout: Record<string, { x: number; y: number; w: number; h: number }>;
};

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 };
const ROW_HEIGHT = 40;

function buildLayoutFromWidgets(widgets: WidgetDef[]): LayoutItem[] {
  return widgets.map((w) => ({
    i: w.id,
    x: w.defaultLayout.x,
    y: w.defaultLayout.y,
    w: w.defaultLayout.w,
    h: w.defaultLayout.h,
    minW: w.defaultLayout.minW ?? 2,
    minH: w.defaultLayout.minH ?? 3,
  }));
}

function applyTemplate(widgets: WidgetDef[], template: DashboardTemplate): LayoutItem[] {
  return widgets.map((w) => {
    const t = template.layout[w.id];
    const d = w.defaultLayout;
    return {
      i: w.id,
      x: t?.x ?? d.x,
      y: t?.y ?? d.y,
      w: t?.w ?? d.w,
      h: t?.h ?? d.h,
      minW: d.minW ?? 2,
      minH: d.minH ?? 3,
    };
  });
}

type Props = {
  widgets: WidgetDef[];
  editing: boolean;
  storageKey: string;
  activeTemplate?: DashboardTemplate | null;
  hiddenIds?: Set<string>;
  onLayoutPersist?: (layout: LayoutItem[]) => void;
  wideColumns?: boolean;
};

export function DashboardGrid({ widgets, editing, storageKey, activeTemplate, hiddenIds, onLayoutPersist, wideColumns = false }: Props) {
  const defaultLg = useMemo(
    () => (activeTemplate ? applyTemplate(widgets, activeTemplate) : buildLayoutFromWidgets(widgets)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTemplate?.id, widgets.length]
  );

  const [layouts, setLayouts] = useState<Layouts>(() => {
    const compactLayout = (columns: number) => {
      let y = 0;
      return widgets.map((widget) => {
        const item = { i: widget.id, x: 0, y, w: columns, h: widget.defaultLayout.h, minW: Math.min(2, columns), minH: widget.defaultLayout.minH ?? 2 };
        y += item.h;
        return item;
      });
    };
    const defaultLayouts: Layouts = wideColumns
      ? { lg: defaultLg, md: defaultLg, sm: defaultLg, xs: compactLayout(6), xxs: compactLayout(2) }
      : { lg: defaultLg };
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && !activeTemplate) {
        const parsed = JSON.parse(stored) as Layouts;
        const known = new Set((parsed.lg || []).map((l) => l.i));
        const missing = widgets.filter((w) => !known.has(w.id)).map((w) => ({
          i: w.id,
          x: w.defaultLayout.x,
          y: w.defaultLayout.y,
          w: w.defaultLayout.w,
          h: w.defaultLayout.h,
          minW: w.defaultLayout.minW ?? 2,
          minH: w.defaultLayout.minH ?? 3,
        }));
        return { ...defaultLayouts, ...parsed, lg: [...(parsed.lg || []), ...missing] };
      }
    } catch {}
    return defaultLayouts;
  });
  const layoutChangePending = useRef(false);
  const onLayoutPersistRef = useRef(onLayoutPersist);
  onLayoutPersistRef.current = onLayoutPersist;

  useEffect(() => {
    if (!layoutChangePending.current) return;
    layoutChangePending.current = false;
    onLayoutPersistRef.current?.(layouts.lg || []);
    try {
      localStorage.setItem(storageKey, JSON.stringify(layouts));
    } catch {}
  }, [layouts, storageKey]);

  useEffect(() => {
    if (activeTemplate) {
      setLayouts({ lg: applyTemplate(widgets, activeTemplate) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplate?.id]);

  const handleChange = (_current: LayoutItem[], all: Layouts) => {
    // Merge with existing layouts so hidden widgets keep their stored positions.
    setLayouts((prev) => {
      const prevLg = prev.lg || [];
      const nextLg = all.lg || [];
      const nextIds = new Set(nextLg.map((l) => l.i));
      const preserved = prevLg.filter((l) => !nextIds.has(l.i));
      const mergedLg = [...nextLg, ...preserved];
      const merged: Layouts = { ...prev, ...all, lg: mergedLg };
      layoutChangePending.current = true;
      return merged;
    });
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setWidth(el.clientWidth || 1200);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visibleWidgets = useMemo(
    () => (hiddenIds && hiddenIds.size ? widgets.filter((w) => !hiddenIds.has(w.id)) : widgets),
    [widgets, hiddenIds]
  );

  const visibleLayouts = useMemo<Layouts>(() => {
    if (!hiddenIds || !hiddenIds.size) return layouts;
    const filtered: Layouts = {};
    Object.entries(layouts).forEach(([bp, items]) => {
      filtered[bp] = (items || []).filter((l) => !hiddenIds.has(l.i));
    });
    return filtered;
  }, [layouts, hiddenIds]);

  return (
    <div ref={containerRef} className={cn(editing && 'dashboard-editing')}>
      <Responsive
        width={width}
        className="layout"
        layouts={visibleLayouts}
        breakpoints={BREAKPOINTS}
        cols={wideColumns ? { ...COLS, sm: 12, xs: 6 } : COLS}
        rowHeight={ROW_HEIGHT}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        dragConfig={{ enabled: editing, cancel: '.no-drag' }}
        resizeConfig={{ enabled: editing }}
        onLayoutChange={handleChange}
      >
        {visibleWidgets.map((w) => (
          <div key={w.id} className="dashboard-widget relative">
            {editing && (
              <div className="absolute top-2 right-2 z-10 bg-primary/90 text-primary-foreground rounded-md px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-1 shadow-sm pointer-events-none">
                <GripVertical className="w-3 h-3" />
                {w.title || w.id}
              </div>
            )}
            <div className="h-full w-full overflow-auto">{w.render()}</div>
          </div>
        ))}
      </Responsive>
    </div>
  );
}
