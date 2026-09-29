import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Building2, ChevronLeft, LogOut, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_INSURANCE_NAVIGATION_ITEM_IDS, INSURANCE_NAVIGATION_ITEMS } from '@/config/insurance-navigation';

interface InsuranceSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  companyName?: string | null;
  logoUrl?: string | null;
  companies?: { id: number; name: string }[];
  activeCompanyId?: number | null;
  onSelectCompany?: (id: number) => void;
  visibleItemIds?: readonly string[];
  showPortalSwitch?: boolean;
}

const InsuranceSidebar = ({ collapsed, onToggle, companyName, logoUrl, companies = [], activeCompanyId, onSelectCompany, visibleItemIds = DEFAULT_INSURANCE_NAVIGATION_ITEM_IDS, showPortalSwitch = true }: InsuranceSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const multiCompany = companies.length > 1;

  const navItems = INSURANCE_NAVIGATION_ITEMS
    .filter((item) => visibleItemIds.includes(item.id))
    .map((item) => ({ ...item, label: t(item.labelKey, item.fallbackLabel) }));

  const isActive = (path: string) =>
    path === '/insurance' ? location.pathname === '/insurance' : location.pathname.startsWith(path);

  return (
    <aside data-collapsed={collapsed} className={cn(
      'insurance-sidebar fixed left-0 top-0 z-40 h-screen glass-panel border-r border-border/50 transition-all duration-300 ease-apple flex flex-col',
      collapsed ? 'w-16' : 'w-60'
    )}>
      <div className="px-4 pt-6 pb-4">
        <div className="weso-wordmark">
          <img src="/weso-logo.png" alt="" aria-hidden="true" />
        </div>
        {!collapsed && <p className="weso-subtitle text-xs text-muted-foreground">{t('insurance.portal', 'Portal aseguradora')}</p>}
      </div>
      <div className="insurance-company flex items-center gap-2 mx-3 p-2 rounded-xl border border-border/50 bg-white">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName || 'Company'} className="insurance-company-mark w-10 h-10 rounded-xl object-contain bg-background p-1 flex-shrink-0" />
        ) : (
          <div className="insurance-company-placeholder w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        )}
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <p title={companyName || 'Insurance'} className="font-semibold text-xs leading-snug">{companyName || 'Insurance'}</p>
            <p className="text-[11px] text-muted-foreground">{t('insurance.insideWeso', 'Dentro de Weso')}</p>
          </div>
        )}
      </div>


      {multiCompany && !collapsed && (
        <div className="px-3 pt-3 animate-fade-in">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5 px-1">
            {t('insurance.switchCompany', 'Compañía')}
          </p>
          <SearchableSelect
            value={activeCompanyId != null ? String(activeCompanyId) : null}
            onChange={(value) => onSelectCompany?.(Number(value))}
            options={companies.map((company) => ({
              value: String(company.id),
              label: company.name,
              searchText: company.name,
            }))}
            placeholder={t('insurance.switchCompany', 'Compañía')}
            searchPlaceholder={t('insurance.searchCompany', 'Buscar compañía…')}
            emptyMessage={t('insurance.noCompaniesFound', 'No se encontraron compañías.')}
            triggerClassName="h-9 text-sm rounded-xl bg-white"
          />
        </div>
      )}


      <Button
        variant="glass"
        size="icon"
        onClick={onToggle}
        aria-label={collapsed ? t('insurance.expandMenu', 'Expandir menú') : t('insurance.collapseMenu', 'Contraer menú')}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full shadow-glass-sm"
      >
        <ChevronLeft className={cn('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')} />
      </Button>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          const firstDetail = item.group === 'details' && navItems.findIndex((navItem) => navItem.group === 'details') === index;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/insurance'}
              title={item.label}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 overflow-hidden',
                firstDetail && 'mt-5 border-t border-border/50 pt-4',
                active
                  ? 'font-semibold'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm animate-fade-in">{item.label}</span>}
            </NavLink>
          );
        })}

      </nav>

      <div className="p-3 border-t border-border/50 space-y-1">
        <Separator className="my-2" />
        {showPortalSwitch && (
          <Button
            variant="ghost"
            className={cn('w-full justify-start gap-3 px-3 py-2.5 h-auto text-muted-foreground hover:bg-secondary/80 hover:text-foreground', collapsed && 'justify-center px-0')}
            onClick={() => navigate('/')}
            aria-label={t('insurance.switchPortal', 'Cambiar portal')}
          >
            <LayoutGrid className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">{t('nav.portals', 'Portales')}</span>}
          </Button>
        )}
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3 px-3 py-2.5 h-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive', collapsed && 'justify-center px-0')}
          onClick={async () => { await signOut(); navigate('/'); }}
          aria-label={t('common.logout', 'Cerrar sesión')}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">{t('nav.logout', 'Cerrar sesión')}</span>}
        </Button>
      </div>
    </aside>
  );
};

export default InsuranceSidebar;
