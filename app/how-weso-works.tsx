"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Truck, Wrench } from "lucide-react";
import type { Lang } from "./content";

type Coordinate = [number, number];
type Land = { features: { geometry: { type: string; coordinates: Coordinate[][] | Coordinate[][][] } }[] };
const operators: Coordinate[] = [[-70, -33], [-74, 4], [-99, 19], [-80, 26], [-122, 38], [-46, -23], [-3, 40], [2, 49], [28, -26], [55, 25], [77, 28], [139, 36], [151, -34]];

function OperatorGlobe({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    let rings: Coordinate[][] = [];
    let frame = 0;
    let visible = false;
    let elapsed = 0;
    let previous = 0;
    const size = 520;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    context.scale(ratio, ratio);
    const draw = (time: number) => {
      if (previous && !reduced.matches) elapsed += Math.min(time - previous, 50);
      previous = time;
      const rotation = .9 + elapsed / 40000;
      const radius = 208;
      const tilt = .19;
      const project = ([longitude, latitude]: Coordinate) => {
        const lon = longitude * Math.PI / 180 + rotation;
        const lat = latitude * Math.PI / 180;
        const x = Math.cos(lat) * Math.sin(lon);
        const y = Math.sin(lat);
        const z = Math.cos(lat) * Math.cos(lon);
        return [260 + radius * x, 260 - radius * (y * Math.cos(tilt) - z * Math.sin(tilt)), y * Math.sin(tilt) + z * Math.cos(tilt)];
      };
      const line = (points: Coordinate[], color: string, width: number) => {
        context.beginPath();
        let connected = false;
        for (const point of points) {
          const [x, y, z] = project(point);
          if (z < 0) { connected = false; continue; }
          if (connected) context.lineTo(x, y); else context.moveTo(x, y);
          connected = true;
        }
        context.strokeStyle = color;
        context.lineWidth = width;
        context.stroke();
      };
      context.clearRect(0, 0, size, size);
      context.beginPath();
      context.arc(260, 260, radius, 0, Math.PI * 2);
      context.strokeStyle = "#c7c3c6";
      context.lineWidth = 1;
      context.stroke();
      for (let latitude = -60; latitude <= 60; latitude += 30) line(Array.from({ length: 181 }, (_, i) => [i * 2 - 180, latitude]), "#dedbda", .7);
      for (let longitude = -180; longitude < 180; longitude += 30) line(Array.from({ length: 91 }, (_, i) => [longitude, i * 2 - 90]), "#dedbda", .7);
      rings.forEach(ring => line(ring, "#a9a4a8", .9));
      operators.forEach((point, index) => {
        const [x, y, z] = project(point);
        if (z < .05) return;
        const selected = (activeRef.current || reduced.matches) && index === 1;
        context.beginPath();
        context.arc(x, y, selected ? 5.5 : 3.3, 0, Math.PI * 2);
        context.fillStyle = selected ? "#f20b8f" : "#171518";
        context.fill();
        if (selected) {
          context.beginPath();
          context.arc(x, y, 10 + (elapsed % 1800) / 150, 0, Math.PI * 2);
          context.strokeStyle = "#f20b8f55";
          context.stroke();
        }
      });
      if (visible && !reduced.matches) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      previous = 0;
      if (visible) draw(performance.now());
    });
    observer.observe(canvas);
    fetch("/assets/operator-world.geojson", { signal: controller.signal }).then(response => response.json()).then((land: Land) => {
      rings = land.features.flatMap(feature => feature.geometry.type === "Polygon" ? feature.geometry.coordinates as Coordinate[][] : (feature.geometry.coordinates as Coordinate[][][]).flat());
      if (reduced.matches) draw(performance.now());
    }).catch(() => { /* The network grid remains visible if the map is unavailable. */ });
    const onMotion = () => { cancelAnimationFrame(frame); previous = 0; if (visible) draw(performance.now()); };
    reduced.addEventListener("change", onMotion);
    return () => { controller.abort(); observer.disconnect(); cancelAnimationFrame(frame); reduced.removeEventListener("change", onMotion); };
  }, []);
  return <canvas ref={canvasRef} className="how-weso-globe" aria-hidden="true" />;
}

export default function HowWesoWorks({ lang }: { lang: Lang }) {
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const es = lang === "es";
  const steps = es ? [
    ["El usuario solicita", "Pide un servicio desde su celular."],
    ["Weso coordina", "Elige de su red y coordina al operador."],
    ["El operador ejecuta", "Realiza el servicio en terreno."],
  ] : [
    ["The user requests", "Requests a service from their phone."],
    ["Weso coordinates", "Selects from its network and coordinates the operator."],
    ["The operator delivers", "Carries out the service on site."],
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
      <div className="how-weso-flow">
        <div className="how-weso-request">
          <div className="how-weso-phone">
            <Image src="/assets/app-client-home.png" alt={es ? "Solicitud de un servicio en la app Weso" : "Service request in the Weso app"} width={470} height={990} unoptimized />
          </div>
          <button className="how-weso-replay" type="button" onClick={() => { setStep(0); setReplay(current => current + 1); }}>{es ? "Ver recorrido" : "See the journey"}<ArrowRight size={15} aria-hidden="true" /></button>
        </div>
        <div className="how-weso-network">
          <div className="how-weso-wordmark"><Image src="/assets/p1-2.png" alt="Weso" width={400} height={400} unoptimized /></div>
          <span className="how-weso-connection how-weso-connection-in" aria-hidden="true"><i /></span>
          <OperatorGlobe active={step === 1} />
          <span className="how-weso-network-label">{es ? "Red global de operadores" : "Global operator network"}</span>
          <span className="how-weso-connection how-weso-connection-out" aria-hidden="true"><i /><ArrowRight size={18} /></span>
        </div>
        <div className="how-weso-execution" aria-hidden="true">
          <div className="how-weso-service-icons"><Truck strokeWidth={1} /><Wrench strokeWidth={1.2} /></div>
          <span className="how-weso-complete"><Check size={19} strokeWidth={2} /></span>
          <span className="how-weso-service-label">{es ? "Servicio completado" : "Service completed"}</span>
        </div>
      </div>
      <ol className="how-weso-steps">{steps.map(([title, description], index) => <li key={title} className={step === index ? "is-active" : ""}><span className="how-weso-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
    </div>
  </section>;
}
