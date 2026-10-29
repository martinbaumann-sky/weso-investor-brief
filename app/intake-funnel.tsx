"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChartColumnIncreasing, Database, FileWarning, Headset, Search } from "lucide-react";
import type { Copy } from "./content";

const requestIcons = [Headset, FileWarning];
const outputIcons = [ChartColumnIncreasing, Database, Search];

export function IntakeFunnel({ t }: { t: Copy["intake"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const diagramRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const diagram = diagramRef.current;
    if (!section || !diagram) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 861px) and (min-height: 600px)");
    let frame = 0;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const ease = (value: number) => value * value * (3 - 2 * value);
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const pinned = desktop.matches && !reduced.matches;
      section.dataset.scrollPinned = String(pinned);
      const layoutHeight = layoutRef.current?.offsetHeight ?? 1;
      section.style.setProperty("--funnel-fit", String(pinned ? Math.min(1, Math.max(1, viewport - 124) / layoutHeight) : 1));
      const sectionBounds = section.getBoundingClientRect();
      const progress = clamp(-sectionBounds.top / Math.max(1, section.offsetHeight - viewport));
      const bounds = diagram.getBoundingClientRect();
      const revealAt = (fraction: number) => reduced.matches ? 1 : ease(pinned
        ? clamp((progress - fraction * .78) / .2)
        : clamp((viewport * .94 - bounds.top - bounds.height * fraction) / (viewport * .32)));
      const intro = reduced.matches ? 1 : ease(clamp((viewport * .94 - section.getBoundingClientRect().top) / (viewport * .25)));
      const inputs = revealAt(.04);
      const hub = revealAt(.37);
      const results = revealAt(.73);
      section.style.setProperty("--funnel-intro", String(intro));
      section.style.setProperty("--funnel-inputs", String(inputs));
      section.style.setProperty("--funnel-hub", String(hub));
      section.style.setProperty("--funnel-title", String(results));
      for (let index = 0; index < 3; index++) section.style.setProperty(`--funnel-result-${index}`, String(revealAt(.79 + index * .045)));
      const route = reduced.matches ? 1 : pinned ? clamp((progress - .07) / .76) : clamp((viewport * .83 - bounds.top) / bounds.height);
      section.style.setProperty("--funnel-route", String(route));
      section.dataset.scrollReady = "true";
      setActiveStage(results > .35 ? 2 : hub > .35 ? 1 : 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    if (layoutRef.current) observer.observe(layoutRef.current);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    desktop.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, []);

  const goToStage = (index: number) => {
    const diagram = diagramRef.current;
    if (!diagram) return;
    const bounds = diagram.getBoundingClientRect();
    const fraction = [.04, .37, .86][index];
    const section = sectionRef.current;
    const pinned = section?.dataset.scrollPinned === "true";
    const target = pinned && section
      ? window.scrollY + section.getBoundingClientRect().top + [.23, .5, .94][index] * (section.offsetHeight - window.innerHeight)
      : window.scrollY + bounds.top + bounds.height * fraction - window.innerHeight * .54;
    window.scrollTo({ top: Math.max(0, target), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const [leadStart, leadEnd] = t.lead.split(": ");
  const outputTitle = t.outTitle.replace(/\.$/, "");

  return <section className={`intake-section funnel-stage-${activeStage}`} id="funnel" lang={t.lang} ref={sectionRef} aria-labelledby="funnel-title">
    <div className="funnel-pin">
    <div className="funnel-layout" ref={layoutRef}>
      <div className="funnel-copy">
        <p className="eyebrow">{t.label}</p>
        <h2 id="funnel-title">{t.titleA}<br />{t.titleB}<span>.</span></h2>
        <p className="funnel-lead">{leadStart}:<br />{leadEnd}</p>
        <ol className="funnel-stages">{t.stages.map((stage, index) => <li key={stage}>
          <button type="button" className={index === activeStage ? "is-current" : ""} aria-pressed={index === activeStage} onClick={() => goToStage(index)}>
            <span className="funnel-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="funnel-step-copy"><strong>{stage}</strong><span>{t.stageDetails[index]}</span></span>
          </button>
        </li>)}</ol>
      </div>
      <div className="funnel-diagram" ref={diagramRef}>
        <Image className="funnel-routing" src="/assets/intake-routing.png" alt="" width={780} height={900} unoptimized />
        <ul className="funnel-inputs" aria-label={t.inLabel}>{t.requests.map((request, index) => {
          const Icon = requestIcons[index];
          return <li key={request}><span className="funnel-input-icon"><Icon strokeWidth={1.8} aria-hidden="true" /></span><strong>{request}</strong></li>;
        })}</ul>
        <div className="funnel-hub"><Image src="/assets/p1-2.png" alt="Weso" width={400} height={400} unoptimized /></div>
        <h3 className="funnel-result-title">{outputTitle}<span>.</span></h3>
        <ul className="funnel-results">{t.outputs.map((output, index) => {
          const Icon = outputIcons[index];
          return <li key={output}><span className="funnel-output-icon"><Icon strokeWidth={2} aria-hidden="true" /></span><span>{output}</span></li>;
        })}</ul>
      </div>
    </div>
    </div>
  </section>;
}
