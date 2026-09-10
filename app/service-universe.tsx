"use client";

import { useEffect, useRef } from "react";
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
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / travel));
      const animate = !motion.matches && window.innerWidth > 820 && window.innerHeight > 700;
      section.querySelectorAll<HTMLElement>(".service-tile").forEach((tile, index) => {
        const reveal = animate ? Math.max(0, Math.min(1, (progress * 1.4 - index / categories.length * .65) / .35)) : 1;
        tile.style.opacity = String(.14 + reveal * .86);
        tile.style.transform = `translateY(${(1 - reveal) * 65}px) scale(${.92 + reveal * .08})`;
      });
      section.style.setProperty("--universe-progress", String(animate ? progress : 1));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return <section className="service-universe" ref={sectionRef} aria-labelledby="service-universe-title">
    <div className="service-universe-sticky">
      <div className="service-universe-copy">
        <p className="eyebrow">{lang === "es" ? "Una plataforma. Todo un universo de servicios." : "One platform. A world of services."}</p>
        <h2 id="service-universe-title"><span>6</span> {lang === "es" ? "verticales" : "verticals"}</h2>
        <ul className="service-verticals">{["Mobility", "Home & Property", "Travel Assist", "Pet Care", "Life Style & Concierge", "Health Care"].map(vertical => <li key={vertical}>{vertical}</li>)}</ul>
        <div className="service-universe-metrics"><p><strong>32</strong> {lang === "es" ? "categorías" : "categories"}</p><p><strong>+600</strong> {lang === "es" ? "servicios" : "services"}</p></div>
        <div className="service-universe-progress" aria-hidden="true"><span /></div>
      </div>
      <ul className="service-universe-grid" aria-label={lang === "es" ? "Servicios de la plataforma" : "Platform services"}>
        {categories.map(([Icon, es, en]) => <li className="service-tile" key={en}><Icon className="service-tile-icon" size={24} strokeWidth={1.5} aria-hidden="true" /><p>{lang === "es" ? es : en}</p></li>)}
      </ul>
    </div>
  </section>;
}
