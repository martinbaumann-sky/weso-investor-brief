import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import CorporateDashboard from './pages/admin/CorporateDashboard';
import InsuranceSidebar from './components/layout/InsuranceSidebar';
import es from './i18n/locales/es.json';
import en from './i18n/locales/en.json';
import './index.css';
import './components/insurance/executive.css';

const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
i18n.use(initReactI18next).init({ resources: { es: { translation: es }, en: { translation: en } }, lng: lang, fallbackLng: 'es', interpolation: { escapeValue: false } });

function Portal() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 640);
  return <MemoryRouter initialEntries={['/insurance']}><div className="insurance-shell brand-scope min-h-screen bg-background">
    <InsuranceSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} companyName="Nova Seguros · Demo" visibleItemIds={['summary']} showPortalSwitch={false} />
    <main className={`insurance-main relative min-h-screen transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
      <header className="sticky top-0 z-30 glass-header px-6 py-4"><h1 className="text-xl font-semibold text-foreground">{i18n.t('corpDash.title')}</h1><p className="text-sm text-muted-foreground">{i18n.t('corpDash.subtitleWith', {name:'Nova Seguros · Demo'})}</p></header>
      <CorporateDashboard lockedCompanyId={1} hideHeader />
    </main>
  </div></MemoryRouter>;
}
createRoot(document.getElementById('root')!).render(<Portal />);
