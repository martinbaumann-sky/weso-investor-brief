"use client";

import { useRef, type CSSProperties } from "react";
import type { Copy } from "./content";
import { useScrollProgress } from "./use-scroll-progress";

export function ClaimsModule({ t }: { t: Copy["claims"] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(sectionRef, phoneRef);

  const lastStep = t.steps.length - 1;
  const step = Math.min(lastStep, Math.floor(progress * t.steps.length));
  const filled = t.fields.filter(([, , fieldStep]) => fieldStep <= step).length;

  return (
    <section className="claims-chapter" id="claims">
      <div className="claims-scroll" ref={sectionRef}>
        <div className="claims-sticky">
          <div className="claims-heading" data-scroll-reveal="heading">
            <div><p className="eyebrow">{t.label}</p><h2>{t.title}</h2></div>
            <p>{t.lead}</p>
          </div>

          <div className="claims-body">
            <ol className="claims-steps">
              {t.steps.map(([title, body], index) => (
                <li className={index < step ? "is-done" : index === step ? "is-current" : ""} aria-current={index === step ? "step" : undefined} key={title}>
                  <b>{index < step ? "✓" : String(index + 1).padStart(2, "0")}</b>
                  <div><h3>{title}</h3><div className="claims-step-body"><p>{body}</p></div></div>
                </li>
              ))}
            </ol>

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
                  return <div className={isFilled ? "is-filled" : ""} key={label}><dt>{label}</dt><dd>{isFilled ? value : t.pending}</dd><i aria-hidden="true">{isFilled ? "✓" : ""}</i></div>;
                })}
              </dl>
              <footer><div className="claims-meter"><i style={{ width: `${(filled / t.fields.length) * 100}%` }} /></div><span>{t.complete} {filled}/{t.fields.length}</span></footer>
            </div>
          </div>
        </div>
      </div>

      <div className="claims-benefits">
        {t.benefits.map(([title, body], index) => <div data-scroll-reveal="card" style={{ "--reveal-order": index } as CSSProperties} key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></div>)}
      </div>
    </section>
  );
}
