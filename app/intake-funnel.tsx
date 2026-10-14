"use client";

import { useRef, type CSSProperties } from "react";
import type { Copy } from "./content";
import { useScrollProgress } from "./use-scroll-progress";

// Request chips sit in a 4-column grid; each column pours into the funnel along its own curve.
const columns = [75, 225, 375, 525];
const flowPath = (x: number) => `M${x} 0 C ${x} 92, 300 112, 300 196 L300 250`;
const stageStarts = [0.36, 0.5, 0.64];
const outputStart = 0.8;

export function IntakeFunnel({ t }: { t: Copy["intake"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(sectionRef, visualRef);

  const activeRequests = Math.min(t.requests.length, Math.floor(Math.min(progress / 0.34, 1) * t.requests.length) + 1);
  const activeStage = stageStarts.filter((start) => progress >= start).length - 1;
  const outputOn = progress >= outputStart;
  const phases = [t.inPhase, ...t.stages, [t.outTitle, t.outBody]];
  const phase = outputOn ? phases.length - 1 : activeStage + 1;

  return (
    <section className="intake-chapter" id="funnel" ref={sectionRef}>
      <div className="intake-sticky">
        <div className="intake-copy">
          <div data-scroll-reveal="heading"><p className="eyebrow">{t.label}</p><h2>{t.title}</h2><p className="intake-lead">{t.lead}</p></div>
          <div className="intake-phase" aria-live="polite">
            <div className="intake-phase-track" aria-hidden="true">{phases.map(([title], index) => <i className={index <= phase ? "is-on" : ""} key={title} />)}</div>
            <span>{String(phase + 1).padStart(2, "0")} / {String(phases.length).padStart(2, "0")}</span>
            <h3 key={`title-${phase}`}>{phases[phase][0]}</h3>
            <p key={`body-${phase}`}>{phases[phase][1]}</p>
          </div>
          <div className="intake-proof">{t.proof.map((item) => <span key={item}>{item}</span>)}</div>
        </div>

        <div className="intake-visual" ref={visualRef} aria-label={t.title}>
          <div className="intake-sources"><p>{t.inLabel}</p><div>{t.channels.map((channel) => <span key={channel}>{channel}</span>)}</div></div>
          <ul className="intake-requests">
            {t.requests.map(([title, note], index) => <li className={index < activeRequests ? "is-on" : ""} key={title}><b>{title}</b><small>{note}</small></li>)}
          </ul>
          <div className="intake-funnel">
            <svg viewBox="0 0 600 250" aria-hidden="true">
              <defs>
                <linearGradient id="intake-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6427ff" stopOpacity=".04" /><stop offset="1" stopColor="#f20b8f" stopOpacity=".18" /></linearGradient>
              </defs>
              <path className="intake-funnel-shape" d="M4 4 H596 L372 196 V248 H228 V196 Z" />
              {columns.map((x, column) => (
                <g className={activeRequests > column ? "is-on" : ""} key={x}>
                  <path className="intake-flow" d={flowPath(x)} pathLength={1} />
                  {[0, 1].map((particle) => <circle r="4.5" key={particle}><animateMotion dur="2.6s" begin={`-${column * 0.35 + particle * 1.3}s`} repeatCount="indefinite" path={flowPath(x)} /></circle>)}
                </g>
              ))}
            </svg>
            <ol className="intake-stages">
              {t.stages.map(([title], index) => {
                const state = outputOn || index < activeStage ? "is-done" : index === activeStage ? "is-current" : "";
                return <li className={state} key={title}><b>{String(index + 1).padStart(2, "0")}</b><span>{title}</span></li>;
              })}
            </ol>
          </div>
          <ol className="intake-stage-list">
            {t.stages.map(([title, body], index) => <li data-scroll-reveal="card" style={{ "--reveal-order": index } as CSSProperties} key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></li>)}
          </ol>
          <div className={`intake-output ${outputOn ? "is-on" : ""}`}>
            <div><p>{t.outLabel}</p><h3>{t.outTitle}</h3></div>
            <ul>{t.outputs.map(([title, body]) => <li key={title}><b>{title}</b><span>{body}</span></li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
