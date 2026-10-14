"use client";

import { useRef } from "react";
import type { Copy } from "./content";
import { useScrollProgress } from "./use-scroll-progress";

export function ClaimsModule({ t }: { t: Copy["claims"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(sectionRef, phoneRef);

  const lastStep = t.steps.length - 1;
  const step = Math.min(lastStep, Math.floor(progress * t.steps.length));
  const filled = t.fields.filter(([, , fieldStep]) => fieldStep <= step).length;

  return (
    <section className="claims-chapter" id="claims" ref={sectionRef}>
      <div className="claims-sticky">
        <div className="claims-copy">
          <div data-scroll-reveal="heading">
            <p className="eyebrow">{t.label}</p>
            <h2>{t.titleA}<br />{t.titleB}<span>.</span></h2>
            <p className="claims-lead">{t.lead}</p>
          </div>
          <ol className="claims-steps">
            {t.steps.map((title, index) => (
              <li className={index < step ? "is-done" : index === step ? "is-current" : ""} aria-current={index === step ? "step" : undefined} key={title}>
                <b>{index < step ? "✓" : String(index + 1).padStart(2, "0")}</b><span>{title}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="claims-phone-wrap">
          <div className="claims-phone" ref={phoneRef}>
            <div className="claims-screen">
              <header><i aria-hidden="true">W</i><div><b>{t.chatName}</b><small>{t.chatStatus}</small></div></header>
              <ol className="claims-thread" aria-live="polite">
                {t.chat.map((message) => (
                  <li className={`from-${message.from} ${message.step <= step ? "is-on" : ""}`} key={message.text}>
                    <div>
                      <div className="claims-bubble">
                        {message.kind === "location" && <span className="claims-map" aria-hidden="true"><i /></span>}
                        {message.kind === "photos" && <span className="claims-photos" aria-hidden="true"><i /><i /><i /><i /></span>}
                        <p>{message.text}</p>
                        {message.kind === "tracking" && <span className="claims-track" aria-hidden="true"><i /></span>}
                      </div>
                    </div>
                  </li>
                ))}
                <li className={`from-weso claims-typing ${step < lastStep ? "is-on" : ""}`} aria-hidden="true"><div><div className="claims-bubble"><i /><i /><i /></div></div></li>
              </ol>
              <footer><span>{t.composer}</span><i aria-hidden="true">↑</i></footer>
            </div>
          </div>
          <p className="claims-sample">{t.sample}</p>
        </div>

        <div className="claims-file">
          <header><div><p>{t.fileTitle}</p><b>{t.fileId}</b></div><span className="claims-status" key={step}>{t.statuses[step]}</span></header>
          <dl>
            {t.fields.map(([label, value, fieldStep]) => {
              const isFilled = fieldStep <= step;
              return <div className={isFilled ? "is-filled" : ""} key={label}><dt>{label}</dt><dd>{isFilled ? value : "—"}</dd><i aria-hidden="true">{isFilled ? "✓" : ""}</i></div>;
            })}
          </dl>
          <div className="claims-meter" aria-hidden="true"><i style={{ width: `${(filled / t.fields.length) * 100}%` }} /></div>
        </div>
      </div>
    </section>
  );
}
