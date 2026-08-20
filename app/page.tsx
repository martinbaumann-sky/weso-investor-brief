"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { content, type Lang } from "./content";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [progress, setProgress] = useState(0);
  const [solutionStep, setSolutionStep] = useState(0);
  const t = content[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saved = window.localStorage.getItem("weso-lang");
    const initial: Lang = params.get("lang") === "es" || saved === "es" ? "es" : "en";
    document.documentElement.lang = initial;
    setLang(initial);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible"));
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [lang]);

  useEffect(() => {
    const updateSolutionStep = () => {
      const section = document.querySelector<HTMLElement>("#solution");
      if (!section) return;
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travel);
      const next = Math.min(t.solution.flow.length - 1, Math.floor((passed / travel) * t.solution.flow.length));
      setSolutionStep(next);
    };
    updateSolutionStep();
    window.addEventListener("scroll", updateSolutionStep, { passive: true });
    window.addEventListener("resize", updateSolutionStep);
    return () => {
      window.removeEventListener("scroll", updateSolutionStep);
      window.removeEventListener("resize", updateSolutionStep);
    };
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
        <a className="brand-lockup" href="#top" aria-label="Weso home"><Image src="/assets/p1-2.png" alt="Weso" width={400} height={400} priority unoptimized /></a>
        <nav aria-label="Primary navigation">
          <div className="desktop-nav"><a href="#problem">{t.nav.thesis}</a><a href="#market">{t.nav.market}</a><a href="#economics">{t.nav.model}</a><a href="#team">{t.nav.team}</a></div>
          <button className="language-switch" type="button" onClick={switchLanguage} aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}><span className={lang === "en" ? "active" : ""}>EN</span><span className={lang === "es" ? "active" : ""}>ES</span></button>
          <a className="contact-button" href={`mailto:${t.round.emailAddress}`}>{t.nav.contact}<span>↗</span></a>
        </nav>
      </header>

      <section className="hero" id="top">
        <h1 data-reveal>{t.hero.titleA}<br /><em>{t.hero.titleB.replace(/\.$/, "")}<span className="hero-dot">.</span></em></h1>
        <a className="hero-scroll" href="#problem" aria-label={t.hero.explore}>↓</a>
      </section>

      <section className="scroll-chapter problem-chapter" id="problem">
        <div className="chapter-background" aria-hidden="true"><span>01—02</span><strong>weso</strong></div>
        <div className="chapter-panels">
          <article className="chapter-panel problem-sequence-panel">
            <div className="panel-copy problem-copy" data-reveal><p className="eyebrow">{t.problem.label}</p><h2>{t.problem.title}</h2><p className="panel-lead">{t.problem.lead}</p></div>
            <div className="issue-scroll-list">{t.problem.cards.map(([title, body], index) => <article className="issue-scroll-card" data-reveal key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
          </article>
          <article className="chapter-panel solution-panel solution-graphic-panel" id="solution">
            <div className="solution-sticky">
              <div className="panel-copy" data-reveal><p className="eyebrow">{t.solution.label}</p><h2>{t.solution.title}</h2></div>
              <div className="process-visual" style={{ "--flow-progress": `${Math.max(0, solutionStep) / (t.solution.flow.length - 1) * 100}%` } as CSSProperties}>
                <div className="process-graph" role="list" aria-label={t.solution.title}>
                  <div className="process-line" aria-hidden="true"><i /></div>
                  {t.solution.flow.map((step, index) => <div className={`process-node ${index <= solutionStep ? "is-shown" : ""} ${index === solutionStep ? "is-current" : ""}`} role="listitem" aria-current={index === solutionStep ? "step" : undefined} key={step}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></div>)}
                </div>
                <p className="process-caption" aria-live="polite">{solutionStep >= 0 ? t.solution.flow[solutionStep] : t.solution.title}</p>
              </div>
              <div className="compact-grid pillars-grid">{t.solution.pillars.map(([title, body], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></div>)}</div>
            </div>
          </article>
        </div>
      </section>

      <section className="scroll-chapter market-chapter" id="market">
        <div className="chapter-background photo-background" aria-hidden="true"><Image src="/media/roadside.jpg" alt="" fill sizes="100vw" /><span>03</span><strong>global</strong></div>
        <div className="chapter-panels">
          <article className="chapter-panel market-panel market-proof-panel" data-reveal>
            <div className="panel-copy"><p className="eyebrow">{t.market.label}</p><h2>{t.market.title}</h2></div>
            <div className="market-proof">
              <div className="market-base">{t.market.stats.slice(0, 2).map(([value, label, note]) => <div key={label}><strong>{value}</strong><h3>{label}</h3><p>{note}</p></div>)}</div>
              <div className="tam-context"><strong>{t.market.stats[2][0]}</strong><div><h3>{t.market.stats[2][1]}</h3><p>{t.market.stats[2][2]}</p></div></div>
              <div className="market-equation">{t.market.stats.slice(3).map(([value, label, note], index) => <div className={index === 3 ? "revenue-result" : ""} key={label}><span>{index === 0 ? "×" : index === 1 ? "=" : "→"}</span><strong>{value}</strong><h3>{label}</h3><p>{note}</p></div>)}</div>
            </div>
          </article>
        </div>
      </section>

      <section className="scroll-chapter economics-chapter" id="economics">
        <div className="chapter-background economics-background" aria-hidden="true"><span>{t.market.bridge}</span><strong>→</strong><span>{t.market.bridgeTo}</span></div>
        <div className="chapter-panels">
          <article className="chapter-panel economics-panel" data-reveal>
            <div className="panel-copy"><p className="eyebrow">{t.economics.label}</p><h2>{t.economics.title}</h2><p className="panel-lead">{t.economics.intro}</p></div>
            <div className="economics-compare"><div><span>FROM</span><h3>{t.economics.from}</h3></div><b>→</b><div className="economics-to"><span>TO</span><h3>{t.economics.to}</h3><p>{t.economics.changed}</p></div></div>
          </article>
          <article className="chapter-panel economics-panel results-panel" data-reveal>
            <div className="savings-focus">
              <div className="savings-result"><strong>{t.economics.savingsValue}</strong><p>{t.economics.savings}</p></div>
              <p className="business-model-note">{t.economics.modelNote}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="scroll-chapter scale-chapter" id="scale">
        <div className="chapter-background scale-background" aria-hidden="true"><span>05</span><strong>scale</strong></div>
        <div className="chapter-panels">
          <article className="chapter-panel scale-panel" data-reveal>
            <div className="panel-copy"><p className="eyebrow">{t.scale.label}</p><h2>{t.scale.title}</h2><p className="panel-lead">{t.scale.lead}</p></div>
            <div className="stack-compare"><div><span>{t.scale.today}</span><h3>{t.scale.todaySub}</h3><strong>{t.scale.paysLegacy}</strong><p>{t.scale.legacyTerms}</p></div><div className="weso-stack"><span>{t.scale.weso}</span><h3>{t.scale.wesoSub}</h3><strong>{t.scale.paysWeso}</strong><p>{t.scale.wesoTerms}</p></div><div className="capability-row">{t.scale.capabilities.map((item) => <i key={item}>{item}</i>)}</div></div>
          </article>
          <article className="chapter-panel team-panel" id="team" data-reveal>
            <div className="panel-copy"><p className="eyebrow">{t.team.label}</p><h2>{t.team.title}</h2></div>
            <div className="compact-team">{t.team.members.map(([name, role, country, image]) => <div key={name}><Image src={image} alt="" fill sizes="180px" unoptimized /><div><span>{country}</span><h3>{name}</h3><p>{role}</p></div></div>)}</div>
          </article>
        </div>
      </section>

      <section className="compact-round" id="round">
        <div className="round-inner" data-reveal>
          <div className="round-heading"><p className="eyebrow">{t.round.label}</p><h2>{t.round.title}</h2></div>
          <div className="round-data"><div className="round-terms-compact">{t.round.terms.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><p className="pipeline-label">{t.round.months}</p><div className="pipeline-compact">{t.round.pipeline.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></div>
          <div className="uses-compact">{t.round.uses.map(([title, body]) => <div key={title}><h3>{title}</h3><p>{body}</p></div>)}</div>
          <footer className="round-footer"><h3>{t.round.closing}</h3><div><a href={`mailto:${t.round.emailAddress}`}>{t.round.email}<span>↗</span></a><a href={t.round.websiteUrl} target="_blank" rel="noreferrer">{t.round.website}<span>↗</span></a></div></footer>
        </div>
      </section>
    </main>
  );
}
