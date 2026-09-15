"use client";

import { useState, type CSSProperties } from "react";
import type { Lang } from "./content";
import { Brush, Utensils, Snowflake, PaintRoller, Waves, House, Bath, CookingPot, Laptop, Smile, KeyRound, Scale, Wallet, Heart, Repeat, Hospital, Ambulance, Car, Package, Plane, Brain, GraduationCap, Truck, ConciergeBell, PawPrint, Stethoscope, BadgePercent, Wrench, Droplet, Sprout, PanelsTopLeft, Zap, type LucideIcon } from "lucide-react";

const categories: [LucideIcon, string, string][] = [
  [Brush, "Limpieza", "Cleaning"], [Utensils, "Catering", "Catering"],
  [Snowflake, "Aire acondicionado", "Air conditioning"], [PaintRoller, "Pintura", "Painting"], [Waves, "Piscina", "Pool care"],
  [House, "Hogar y propiedades", "Home & property"], [Bath, "Baño", "Bathroom"], [CookingPot, "Cocina", "Kitchen"],
  [Laptop, "Tecnología", "Technology"], [Smile, "Odontología", "Dental care"], [KeyRound, "Cerrajero", "Locksmith"],
  [Scale, "Abogado", "Legal assistance"], [Wallet, "Finanzas personales", "Personal finance"], [Heart, "Bienestar", "Wellness"],
  [Repeat, "Suscripciones", "Subscriptions"], [Hospital, "Red médica", "Medical network"], [Ambulance, "Ambulancia", "Ambulance"],
  [Car, "Asistencia en ruta", "Roadside assistance"], [Package, "Mudanza", "Moving"], [Plane, "Asistencia en viaje", "Travel assistance"],
  [Brain, "Psicología", "Psychology"], [GraduationCap, "Educación", "Education"], [Truck, "Asistencia a pesados", "Heavy vehicle assistance"],
  [ConciergeBell, "Estilo de vida", "Lifestyle"], [PawPrint, "Veterinario", "Veterinary care"], [Stethoscope, "Servicios médicos", "Medical services"],
  [BadgePercent, "Beneficios y descuentos", "Benefits & discounts"], [Wrench, "Maestro general", "Handyman"], [Droplet, "Plomero", "Plumbing"],
  [Sprout, "Jardinería y paisajismo", "Gardening & landscaping"], [PanelsTopLeft, "Techos y canales", "Roofs & gutters"], [Zap, "Electricidad y luces", "Electrical & lighting"],
];

export default function ServiceUniverse({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState<number | null>(null);
  const verticals = [
    { Icon: Car, name: "Mobility", color: "#315bd6", es: "Siempre en movimiento.", en: "Keep moving.", examples: [17, 22] },
    { Icon: House, name: "Home & Property", color: "#9b5833", es: "Tu espacio, en buenas manos.", en: "Your space. In good hands.", examples: [10, 28, 31] },
    { Icon: Plane, name: "Travel Assist", color: "#6750c8", es: "Contigo, donde estés.", en: "With you. Wherever you go.", examples: [19] },
    { Icon: PawPrint, name: "Pet Care", color: "#b44779", es: "Cuidado para toda la familia.", en: "Care for every family member.", examples: [24] },
    { Icon: ConciergeBell, name: "Life Style & Concierge", color: "#846324", es: "Más tiempo para vivir.", en: "More time for living.", examples: [23, 26] },
    { Icon: Heart, name: "Health Care", color: "#20806e", es: "Bienestar que te acompaña.", en: "Wellbeing, by your side.", examples: [15, 16, 25] },
  ];

  return <section className="service-universe verticals-section" aria-labelledby="service-universe-title">
    <div className="service-universe-sticky">
      <div className="service-universe-copy">
        <p className="eyebrow">{lang === "es" ? "Una plataforma. Todo un universo de servicios." : "One platform. A world of services."}</p>
        <h2 id="service-universe-title"><span>6</span> {lang === "es" ? "verticales" : "verticals"}</h2>
        <p className="verticals-intro">{lang === "es" ? "Un ecosistema conectado para resolver lo que importa." : "One connected ecosystem. For the moments that matter."}</p>
        <div className="service-universe-metrics"><p><strong>32</strong> {lang === "es" ? "categorías" : "categories"}</p><p><strong>+600</strong> {lang === "es" ? "servicios" : "services"}</p></div>
      </div>
      <div className="verticals-grid">
        {verticals.map(({ Icon, name, color, es, en, examples }, index) => <article className={`vertical-card${selected === index ? " is-selected" : ""}`} key={name} style={{ "--vertical-color": color } as CSSProperties}>
          <button type="button" aria-expanded={selected === index} aria-controls={`vertical-detail-${index}`} onClick={() => setSelected(selected === index ? null : index)}>
            <span className="vertical-card-top"><span className="vertical-icon"><Icon size={30} strokeWidth={1.7} aria-hidden="true" /></span><span className="vertical-number">0{index + 1}</span></span>
            <span className="vertical-name">{name}</span>
            <span className="vertical-tagline">{lang === "es" ? es : en}</span>
            <span className="vertical-action">{lang === "es" ? "Explorar" : "Explore"}<span aria-hidden="true">{selected === index ? "−" : "↗"}</span></span>
          </button>
          <div id={`vertical-detail-${index}`} hidden={selected !== index} className="vertical-detail"><p>{lang === "es" ? "Servicios destacados" : "Featured services"}</p><ul>{examples.map(i => <li key={i}>{categories[i][lang === "es" ? 1 : 2]}</li>)}</ul></div>
        </article>)}
      </div>
      <details className="verticals-catalog">
        <summary>{lang === "es" ? "Explorar las 32 categorías" : "Explore all 32 categories"}<span aria-hidden="true">+</span></summary>
        <ul id="service-cloud-categories" className="service-universe-grid" aria-label={lang === "es" ? "Servicios de la plataforma" : "Platform services"}>
          {categories.map(([Icon, es, en], index) => <li className="service-tile" key={en} style={{ "--tile-order": index } as CSSProperties}><Icon className="service-tile-icon" size={20} strokeWidth={1.5} aria-hidden="true" /><p>{lang === "es" ? es : en}</p></li>)}
        </ul>
      </details>
    </div>
  </section>;
}
