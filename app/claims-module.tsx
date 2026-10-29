"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, CheckCheck, FileImage, MapPin, Mic, MoreVertical, Phone, Plus, Search, Send, Signal, BatteryMedium, Wifi, Truck } from "lucide-react";
import type { Copy } from "./content";
import { useScrollProgress } from "./use-scroll-progress";

export function ClaimsModule({ t }: { t: Copy["claims"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLOListElement>(null);
  const progress = useScrollProgress(sectionRef, phoneRef);

  const lastStep = t.steps.length - 1;
  const step = Math.min(lastStep, Math.floor(progress * t.steps.length));
  const filled = t.fields.filter(([, , fieldStep]) => fieldStep <= step).length;
  const visibleMessages = t.chat.filter(message => message.step <= step);
  const chatClock = `14:${String(16 + Math.floor((visibleMessages.length - 1) / 2)).padStart(2, "0")}`;

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTo({ top: thread.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [step]);

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
            <span className="claims-device-button claims-device-silent" aria-hidden="true" />
            <span className="claims-device-button claims-device-volume-up" aria-hidden="true" />
            <span className="claims-device-button claims-device-volume-down" aria-hidden="true" />
            <span className="claims-device-button claims-device-power" aria-hidden="true" />
            <span className="claims-device-island" aria-hidden="true"><span /></span>
            <div className="claims-screen">
              <div className="claims-chat-chrome">
              <div className="claims-device-status" aria-hidden="true"><span>{chatClock}</span><div><Signal size={12} /><Wifi size={12} /><BatteryMedium size={17} /></div></div>
              <header className="claims-chat-header">
                <div className="claims-chat-nav">
                  <ArrowLeft size={17} aria-hidden="true" />
                  <span className="claims-chat-avatar"><Image src="/assets/p1-2.png" alt="Weso" width={400} height={400} unoptimized /></span>
                  <div className="claims-chat-identity"><b>{t.chatName}</b><small>{t.chatStatus}</small></div>
                  <Search size={17} aria-hidden="true" /><MoreVertical size={17} aria-hidden="true" />
                </div>
                <h3>{t.chatGreeting}</h3>
              </header>
              </div>
              <ol className="claims-thread" ref={threadRef} aria-live="polite" aria-relevant="additions">
                {visibleMessages.map((message, index) => (
                  <li className={`from-${message.from} is-on`} key={message.text}>
                    <div>
                      <div className="claims-bubble">
                        {message.kind === "location" && <span className="claims-attachment"><MapPin size={16} aria-hidden="true" />{t.fields[0][1]}</span>}
                        {message.kind === "photos" && <span className="claims-attachment"><FileImage size={16} aria-hidden="true" />{t.fields[1][1]}</span>}
                        <p>{message.text}</p>
                        {message.kind === "tracking" && <span className="claims-attachment claims-tracking-status"><Truck size={16} aria-hidden="true" />{t.fields[4][1]}</span>}
                        <div className="claims-message-meta">
                          {message.from === "weso" && <span className="claims-message-avatar" aria-hidden="true"><Image src="/assets/p1-2.png" alt="" width={400} height={400} unoptimized /></span>}
                          <time>{`14:${String(16 + Math.floor(index / 2)).padStart(2, "0")}`}</time>
                          {message.from === "user" && <CheckCheck size={12} aria-hidden="true" />}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <footer className="claims-compose" aria-hidden="true"><Plus size={17} /><span>{t.composer}</span><Mic size={15} /><Phone size={15} /><span className="claims-compose-send"><Send size={18} /></span></footer>
              <div className="claims-device-home" aria-hidden="true"><span /></div>
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
