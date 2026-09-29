"use client";

import type { Lang } from "./content";
import "./insurer-demo.css";

export default function InsurerDemo({ lang }: { lang: Lang }) {
  const es = lang === "es";
  return <section className="insurer-demo" id="insurer-dashboard" aria-labelledby="insurer-title">
    <div className="insurer-intro">
      <div><p className="eyebrow">{es ? "El portal de la aseguradora" : "The insurer portal"}</p><h2 id="insurer-title">{es ? "Tu operación." : "Your operations."}<br /><span>{es ? "En un solo lugar." : "In one place."}</span></h2></div>
      <div className="insurer-intro-note"><p>{es ? "Explora el dashboard que usan las compañías de seguros: resumen ejecutivo, analítica, órdenes y trazabilidad." : "Explore the dashboard insurance companies use: executive summary, analytics, orders and traceability."}</p><span>{es ? "Interfaz real de Weso · Datos de ejemplo" : "Actual Weso interface · Example data"}</span></div>
    </div>
    <iframe key={lang} className="insurer-portal-frame" src={`/insurer-portal/index.html?lang=${lang}`} title={es ? "Demo del dashboard real de la compañía de seguros" : "Demo of the actual insurance company dashboard"} />
    <p className="insurer-bottom-note">{es ? "Prueba los filtros, reorganiza los widgets y abre una orden. Datos ficticios; sin conexión a producción." : "Try the filters, rearrange widgets and open an order. Fictional data; no production connection."}</p>
  </section>;
}
