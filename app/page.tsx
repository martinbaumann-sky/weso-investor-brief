"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { content, type Lang } from "./content";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [progress, setProgress] = useState(0);
  const [solutionStep, setSolutionStep] = useState(0);
  const [scaleView, setScaleView] = useState<"today" | "weso">("today");
  const t = content[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    const saved = window.localStorage.getItem("weso-lang");
    const initial: Lang = fromUrl === "es" || fromUrl === "en" ? fromUrl : saved === "es" ? "es" : "en";
    document.documentElement.lang = initial;
    const frame = requestAnimationFrame(() => setLang(initial));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
      document.documentElement.style.setProperty("--page-scroll", `${window.scrollY}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: .12, rootMargin: "0px 0px -6%" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [lang]);

  const switchLanguage = () => {
    const next: Lang = lang === "en" ? "es" : "en";
    setLang(next);
    document.documentElement.lang = next;
    window.localStorage.setItem("weso-lang", next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url);
  };

  return (
    <main>
      <div className="scroll-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Weso home">
          <Image src="/assets/p1-2.png" alt="Weso" width={400} height={400} priority unoptimized />
        </a>
        <nav aria-label="Primary navigation">
          <div className="desktop-nav">
            <a href="#problem">{t.nav.thesis}</a>
            <a href="#market">{t.nav.market}</a>
            <a href="#economics">{t.nav.model}</a>
            <a href="#team">{t.nav.team}</a>
          </div>
          <button className="language-switch" type="button" onClick={switchLanguage} aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}>
            <span className={lang === "en" ? "active" : ""}>EN</span><span className={lang === "es" ? "active" : ""}>ES</span>
          </button>
          <a className="contact-button" href={`mailto:${t.round.emailAddress}`}>{t.nav.contact}<span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="hero-meta" data-reveal>
            <p className="section-kicker">{t.hero.kicker}</p>
            <span aria-hidden="true" />
            <p className="eyebrow">{t.hero.eyebrow}</p>
          </div>
          <h1 data-reveal>{t.hero.titleA}<br /><span>{t.hero.titleB}</span></h1>
          <p className="hero-signal" data-reveal>{t.hero.signal}</p>
          <div className="hero-footer" data-reveal>
            <p>{t.hero.body}</p>
            <a href="#problem" className="scroll-cue">{t.hero.explore}<span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section className="problem-section" id="problem">
        <div className="problem-section-intro">
          <div className="section-heading" data-reveal>
            <p className="section-label">{t.problem.label}</p>
            <h2>{t.problem.title}</h2>
          </div>
          <div className="problem-intro" data-reveal>
            <p className="lead">{t.problem.lead}</p>
            <p>{t.problem.body}</p>
          </div>
          <div className="broken-heading" data-reveal>
            <h3>{t.problem.marketTitle}</h3>
            <p>{t.problem.marketLead}</p>
          </div>
        </div>
        <div className="problem-story">
          {t.problem.cards.map(([title, body], index) => (
            <article className={`problem-slide problem-slide-${index + 1}`} key={title}>
              <div className="problem-slide-inner">
                <header>
                  <span>{t.problem.marketTitle}</span>
                  <div aria-label={`${index + 1} / ${t.problem.cards.length}`}>
                    {t.problem.cards.map((_, dotIndex) => <i className={dotIndex === index ? "active" : ""} key={dotIndex} />)}
                  </div>
                </header>
                <span className="problem-slide-index">0{index + 1}.</span>
                <div className="problem-slide-copy"><h4>{title}</h4><p>{body}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section solution-section" id="solution">
        <div className="section-heading inverse" data-reveal>
          <p className="section-label">{t.solution.label}</p>
          <h2>{t.solution.title}</h2>
        </div>
        <div className="solution-journey" data-reveal>
          <div className="journey-tabs" role="tablist" aria-label={t.solution.flow.join(", ")}>
            {t.solution.flow.map((step, index) => (
              <button type="button" role="tab" aria-selected={solutionStep === index} aria-label={`${index + 1}. ${step}`} className={solutionStep === index ? "active" : ""} onClick={() => setSolutionStep(index)} key={step}>
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <div className="journey-stage" role="tabpanel" aria-live="polite">
            <span>{String(solutionStep + 1).padStart(2, "0")} / {String(t.solution.flow.length).padStart(2, "0")}</span>
            <h3 key={`${lang}-${solutionStep}`}>{t.solution.flow[solutionStep]}</h3>
            <div className="journey-progress" aria-hidden="true"><i style={{ width: `${((solutionStep + 1) / t.solution.flow.length) * 100}%` }} /></div>
            <div className="journey-actions">
              <button type="button" onClick={() => setSolutionStep((solutionStep - 1 + t.solution.flow.length) % t.solution.flow.length)} aria-label="Previous step">←</button>
              <button type="button" onClick={() => setSolutionStep((solutionStep + 1) % t.solution.flow.length)} aria-label="Next step">→</button>
            </div>
          </div>
        </div>
        <div className="pillar-grid">
          {t.solution.pillars.map(([title, body], index) => (
            <article className="pillar-card" key={title} data-reveal style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}>
              <span className="pillar-icon" aria-hidden="true">{index === 0 ? "◎" : index === 1 ? "✦" : "↗"}</span>
              <h3>{title}</h3><p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section market-section" id="market">
        <div className="market-heading" data-reveal>
          <div><p className="section-label">{t.market.label}</p><h2>{t.market.title}</h2></div>
          <p>{t.market.stats[0][2]}</p>
        </div>

        <div className="market-model" data-reveal>
          <div className="market-foundation">
            {t.market.stats.slice(0, 3).map(([value, label, note], index) => (
              <div className="foundation-step" key={`${value}-${label}`}>
                <article className={`foundation-card foundation-card-${index + 1}`}>
                  <span className="model-index">0{index + 1}</span>
                  <strong>{value}</strong>
                  <h3>{label}</h3>
                  <p>{note}</p>
                </article>
                {index < 2 && <span className="foundation-arrow" aria-hidden="true">→</span>}
              </div>
            ))}
          </div>

          <div className="market-capture">
            <article className="capture-target">
              <span>{t.market.stats[3][1]}</span>
              <strong>{t.market.stats[3][0]}</strong>
              <p>{t.market.stats[3][2]}</p>
            </article>
            <div className="capture-connector" aria-hidden="true"><span>↓</span></div>
            <div className="capture-equations">
              {[t.market.stats[5], t.market.stats[6]].map(([value, label, note], index) => (
                <article className={`market-equation ${index === 1 ? "revenue-equation" : ""}`} key={label}>
                  <div className="equation-volume">
                    <strong>{t.market.stats[4][0]}</strong>
                    <span>{t.market.stats[4][1]}</span>
                  </div>
                  <b aria-hidden="true">×</b>
                  <div className="equation-assumption"><span>{note}</span></div>
                  <b aria-hidden="true">=</b>
                  <div className="equation-result">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="bridge-line" data-reveal><span>{t.market.bridge}</span><b aria-hidden="true">→</b><span>{t.market.bridgeTo}</span></div>
      </section>

      <section className="section economics-section" id="economics">
        <div className="section-heading inverse" data-reveal>
          <p className="section-label">{t.economics.label}</p>
          <h2>{t.economics.title}</h2>
          <p className="section-subtitle">{t.economics.intro}</p>
        </div>
        <div className="economy-stage" data-reveal>
          <article className="economy-card legacy"><span>FROM</span><h3>{t.economics.from}</h3></article>
          <div className="economy-arrow" aria-hidden="true"><span>→</span></div>
          <article className="economy-card weso"><span>TO</span><h3>{t.economics.to}</h3><p>{t.economics.changed}</p></article>
          <aside className="economy-badges">{t.economics.badges.map((badge, i) => <span key={badge} className={i === 1 ? "light" : ""}>{badge}</span>)}</aside>
        </div>
        <div className="economy-results" data-reveal>
          <p><strong>{t.economics.savingsValue}</strong><span>{t.economics.savings}</span></p>
          <p><strong>{t.economics.feeValue}</strong><span>{t.economics.fee}</span></p>
        </div>
      </section>

      <section className="section scale-section" id="scale">
        <div className="scale-head" data-reveal>
          <div><p className="section-label">{t.scale.label}</p><h2>{t.scale.title}</h2></div>
          <p>{t.scale.lead}</p>
        </div>
        <div className="comparison-switch" role="tablist" aria-label={`${t.scale.today} / ${t.scale.weso}`} data-reveal>
          <button type="button" role="tab" aria-selected={scaleView === "today"} className={scaleView === "today" ? "active" : ""} onClick={() => setScaleView("today")}><span>01</span>{t.scale.today}</button>
          <button type="button" role="tab" aria-selected={scaleView === "weso"} className={scaleView === "weso" ? "active" : ""} onClick={() => setScaleView("weso")}><span>02</span>{t.scale.weso}</button>
        </div>
        <div className="comparison-stage" role="tabpanel">
          {scaleView === "today" ? <article className="comparison-panel legacy-panel is-active" key="today">
            <header><b>{t.scale.today}</b><span>{t.scale.todaySub}</span></header>
            <div className="diagram-node insurer-node"><strong>{t.scale.insurer}</strong><small>{t.scale.owner}</small></div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-node payment-node"><strong>{t.scale.paysLegacy}</strong><small>{t.scale.legacyTerms}</small></div>
            <div className="legacy-nodes">{t.scale.legacyNodes.map((node) => <span key={node}>{node}</span>)}</div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-node policy-node"><strong>{t.scale.policyholder}</strong><small>{t.scale.receives}</small></div>
          </article> : <article className="comparison-panel weso-panel is-active" key="weso">
            <header><b>{t.scale.weso}</b><span>{t.scale.wesoSub}</span></header>
            <div className="diagram-node insurer-node"><strong>{t.scale.insurer}</strong><small>{t.scale.owner}</small></div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-node payment-node"><strong>{t.scale.paysWeso}</strong><small>{t.scale.wesoTerms}</small></div>
            <div className="weso-core"><strong>weso</strong><span>{t.scale.infrastructure}</span><div>{t.scale.capabilities.map((item) => <small key={item}>{item}</small>)}</div></div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-node policy-node"><strong>{t.scale.policyholder}</strong><small>{t.scale.receives}</small></div>
          </article>}
        </div>
      </section>

      <section className="section team-section" id="team">
        <div className="team-title" data-reveal><p>{t.team.label}</p><h2>{t.team.title}</h2></div>
        <div className="team-grid">
          {t.team.members.map(([name, role, country, image], index) => (
            <article className="team-card" key={name} data-reveal style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}>
              <div className="portrait"><div className="portrait-ring" /><Image src={image} alt={name} width={420} height={520} unoptimized /></div>
              <p>{role}</p><h3>{name}</h3><span>{country}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="round-section" id="round">
        <div className="round-glow" aria-hidden="true" />
        <div className="round-heading" data-reveal><p className="section-label">{t.round.label}</p><h2>{t.round.title}</h2></div>
        <div className="term-grid">{t.round.terms.map(([value, label]) => <article key={label} data-reveal><strong>{value}</strong><span>{label}</span></article>)}</div>
        <p className="pipeline-title" data-reveal>{t.round.months}</p>
        <div className="pipeline-grid">{t.round.pipeline.map(([value, label], index) => (
          <article className={`pipeline-card pipeline-card-${index + 1}`} key={label} data-reveal style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}>
            <div className="pipeline-card-top" aria-hidden="true"><span>0{index + 1}</span><i /></div>
            <strong><span>{value}</span></strong>
            <div className="pipeline-card-meta"><span>{label}</span><b aria-hidden="true">↗</b></div>
          </article>
        ))}</div>
        <div className="use-grid">{t.round.uses.map(([title, body], index) => <article key={title} data-reveal><span>{index === 0 ? "✦" : index === 1 ? "◇" : "◎"}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
        <footer className="closing" data-reveal>
          <h2>{t.round.closing}</h2>
          <div><a href={`mailto:${t.round.emailAddress}`}>{t.round.email}<span>↗</span></a><a href={t.round.websiteUrl} target="_blank" rel="noreferrer">{t.round.website}<span>↗</span></a></div>
          <p>weso.ai · {t.round.emailAddress}</p>
        </footer>
      </section>
    </main>
  );
}
