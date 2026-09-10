"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "./content";

const categories = [
  ["🧼", "Limpieza", "Cleaning"], ["🍳", "Catering", "Catering"],
  ["❄️", "Aire acondicionado", "Air conditioning"], ["🎨", "Pintura", "Painting"], ["🏊", "Piscina", "Pool care"],
  ["🏡", "Hogar y propiedades", "Home & property"], ["🛁", "Baño", "Bathroom"], ["🍳", "Cocina", "Kitchen"],
  ["💻", "Tecnología", "Technology"], ["🦷", "Odontología", "Dental care"], ["🚪", "Cerrajero", "Locksmith"],
  ["⚖️", "Abogado", "Legal assistance"], ["💰", "Finanzas personales", "Personal finance"], ["🍎", "Bienestar", "Wellness"],
  ["♻️", "Suscripciones", "Subscriptions"], ["🏥", "Red médica", "Medical network"], ["🚑", "Ambulancia", "Ambulance"],
  ["🚗", "Asistencia en ruta", "Roadside assistance"], ["📦", "Mudanza", "Moving"], ["✈️", "Asistencia en viaje", "Travel assistance"],
  ["🪴", "Psicología", "Psychology"], ["📚", "Educación", "Education"], ["🚚", "Asistencia a pesados", "Heavy vehicle assistance"],
  ["🐶", "Estilo de vida", "Lifestyle"], ["🐕", "Veterinario", "Veterinary care"], ["🩺", "Servicios médicos", "Medical services"],
  ["🔔", "Beneficios y descuentos", "Benefits & discounts"], ["👷", "Maestro general", "Handyman"], ["💧", "Plomero", "Plumbing"],
  ["🌿", "Jardinería y paisajismo", "Gardening & landscaping"], ["🏠", "Techos y canales", "Roofs & gutters"], ["⚡", "Electricidad y luces", "Electrical & lighting"],
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
        {categories.map(([icon, es, en]) => <li className="service-tile" key={en}><span aria-hidden="true">{icon}</span><p>{lang === "es" ? es : en}</p></li>)}
      </ul>
    </div>
  </section>;
}
