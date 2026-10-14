"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Play, Wrench } from "lucide-react";
import type { Lang } from "./content";

export default function HowWesoWorks({ lang }: { lang: Lang }) {
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const es = lang === "es";
  const steps = es ? [
    ["El usuario solicita", "Pide un servicio desde su celular.", "Solicitud"],
    ["Weso coordina", "Elige de su red y coordina al operador.", "Coordinación"],
    ["El operador ejecuta", "Realiza el servicio en terreno.", "Ejecución"],
  ] : [
    ["The user requests", "Requests a service from their phone.", "Request"],
    ["Weso coordinates", "Selects from its network and coordinates the operator.", "Coordination"],
    ["The operator delivers", "Carries out the service on site.", "Delivery"],
  ];
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting && !reduced.matches) timer = setInterval(() => setStep(current => (current + 1) % 3), 3500);
    }, { threshold: .25 });
    observer.observe(section);
    return () => { observer.disconnect(); clearInterval(timer); };
  }, [replay]);

  return <section className={`how-weso how-weso-step-${step}`} id="how-weso-works" ref={sectionRef} aria-labelledby="how-weso-title">
    <div className="how-weso-inner">
      <header className="how-weso-heading">
        <p className="eyebrow">{es ? "Cómo funciona Weso" : "How Weso works"}</p>
        <h2 id="how-weso-title">{es ? "Una solicitud." : "One request."}<br />{es ? "Toda una red en movimiento" : "An entire network in motion"}<span>.</span></h2>
      </header>
      <ol className="how-weso-flow">{steps.map(([title, description, label], index) => <li key={title} className={`how-weso-stage ${step === index ? "is-active" : ""}`} aria-current={step === index ? "step" : undefined}>
        <div className={`how-weso-visual how-weso-visual-${index}`}>
          {index === 0 && <div className="how-weso-phone"><Image src="/assets/app-client-home.png" alt={es ? "Solicitud de un servicio en la app Weso" : "Service request in the Weso app"} width={470} height={990} unoptimized /></div>}
          {index === 1 && <div className="how-weso-network">
            <Image className="how-weso-network-image" src="/assets/how-weso-network.png" alt="" width={900} height={900} unoptimized />
            <div className="how-weso-wordmark"><Image src="/assets/p1-2.png" alt="Weso" width={400} height={400} unoptimized /></div>
          </div>}
          {index === 2 && <div className="how-weso-execution">
            <Image className="how-weso-van" src="/assets/how-weso-van.png" alt={es ? "Vehículo de un operador de la red Weso" : "Weso network operator service van"} width={1254} height={907} unoptimized />
            <span className="how-weso-complete" aria-hidden="true"><Check size={30} strokeWidth={2.5} /></span>
            <span className="how-weso-tool" aria-hidden="true"><Wrench size={26} strokeWidth={1.6} /></span>
          </div>}
          {index < 2 && <span className="how-weso-connection" aria-hidden="true"><ArrowRight strokeWidth={1.4} /></span>}
        </div>
        <div className="how-weso-caption"><span className="how-weso-number">0{index + 1} / {label}</span><h3>{title}</h3><p>{description}</p></div>
      </li>)}</ol>
      <footer className="how-weso-footer">
        <button className="how-weso-replay" type="button" onClick={() => { setStep(0); setReplay(current => current + 1); }}><Play size={16} fill="currentColor" aria-hidden="true" />{es ? "Ver recorrido" : "See the journey"}</button>
        <div className="how-weso-progress" aria-label={es ? "Etapas del recorrido" : "Journey stages"}>
          {[steps[0][2], steps[1][2], es ? "Servicio completado" : "Service completed"].map((label, index) => <span key={label} className={step === index ? "is-active" : ""}>{index > 0 && <ArrowRight size={18} aria-hidden="true" />}{label}</span>)}
        </div>
      </footer>
    </div>
  </section>;
}
