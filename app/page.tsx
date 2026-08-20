"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { content, type Lang } from "./content";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [progress, setProgress] = useState(0);
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
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">{t.hero.kicker}</p>
          <h1>{t.hero.titleA}<br /><em>{t.hero.titleB}</em></h1>
          <div className="hero-bottom"><p>{t.hero.body}</p><a href="#problem">{t.hero.explore}<span>↓</span></a></div>
        </div>
        <div className="hero-visual" data-reveal>
          <Image src="/media/city-network.jpg" alt="Aerial city road network at night" fill priority sizes="(max-width: 800px) 100vw, 48vw" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="signal-card"><span className="signal-dot" /><small>LIVE OPS</small><strong>03:14</strong><p>AI dispatch → provider matched</p></div>
          <div className="hero-stat"><strong>450M+</strong><span>{t.market.stats[1][1]}</span></div>
          <div className="hero-caption"><span>AI</span><p>{t.hero.signal}</p></div>
        </div>
      </section>

      <section className="problem-section" id="problem">
        <div className="section-heading" data-reveal><p className="eyebrow">{t.problem.label}</p><h2>{t.problem.title}</h2><p>{t.problem.lead}</p></div>
        <div className="problem-layout">
          <figure className="editorial-photo" data-reveal>
            <Image src="/media/operations.jpg" alt="Customer operations team coordinating service requests" fill sizes="(max-width: 800px) 100vw, 50vw" />
            <figcaption><span>Legacy model</span><strong>Manual handoffs.<br />Fragmented ownership.</strong></figcaption>
          </figure>
          <div className="problem-cards">{t.problem.cards.map(([title, body], index) => <article key={title} data-reveal style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
        </div>
      </section>

      <section className="solution-section" id="solution">
        <div className="section-heading inverse" data-reveal><p className="eyebrow">{t.solution.label}</p><h2>{t.solution.title}</h2></div>
        <div className="orchestration" data-reveal>
          <div className="orbit orbit-a" /><div className="orbit orbit-b" />
          <div className="weso-node"><small>ONE LAYER</small><strong>weso</strong><span>AI operations</span></div>
          {t.solution.flow.map((step, index) => <span className={`flow-node n${index + 1}`} key={step}>{step}</span>)}
        </div>
        <div className="pillar-grid">{t.solution.pillars.map(([title, body], index) => <article key={title} data-reveal><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="market-section" id="market">
        <div className="market-photo" data-reveal>
          <Image src="/media/roadside.jpg" alt="Roadside service vehicle carrying a car" fill sizes="(max-width: 800px) 100vw, 48vw" />
          <div className="market-photo-copy"><span>REAL WORLD EXECUTION</span><strong>Every request becomes a coordinated service.</strong></div>
        </div>
        <div className="market-content">
          <div className="section-heading compact" data-reveal><p className="eyebrow">{t.market.label}</p><h2>{t.market.title}</h2></div>
          <div className="market-kpis">{t.market.stats.map(([value, label, note], index) => <article key={`${value}-${label}`} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><strong>{value}</strong><div><h3>{label}</h3><p>{note}</p></div></article>)}</div>
        </div>
      </section>

      <section className="economics-section" id="economics">
        <div className="section-heading" data-reveal><p className="eyebrow">{t.economics.label}</p><h2>{t.economics.title}</h2><p>{t.economics.intro}</p></div>
        <div className="economics-dashboard">
          <div className="economics-shift" data-reveal>
            <article><span>{t.scale.today}</span><h3>{t.economics.from}</h3><div className="cost-line legacy-cost"><i /><i /><i /><i /></div></article><b>→</b>
            <article className="weso-economics"><span>{t.scale.weso}</span><h3>{t.economics.to}</h3><div className="cost-line"><i /><i /></div></article>
          </div>
          <div className="savings-visual" data-reveal><div className="ring"><strong>{t.economics.savingsValue}</strong><span>{t.economics.savings}</span></div><div className="fee"><strong>{t.economics.feeValue}</strong><span>{t.economics.fee}</span></div></div>
        </div>
        <div className="badge-row" data-reveal>{t.economics.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
      </section>

      <section className="scale-section" id="scale">
        <div className="section-heading inverse" data-reveal><p className="eyebrow">{t.scale.label}</p><h2>{t.scale.title}</h2><p>{t.scale.lead}</p></div>
        <div className="flywheel" data-reveal><div className="flywheel-center"><strong>weso</strong><span>{t.scale.infrastructure}</span></div>{t.scale.capabilities.map((item, index) => <div className={`flywheel-item f${index + 1}`} key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}</div>
        <div className="scale-summary">
          <article data-reveal><span>01</span><h3>{t.scale.today}</h3><p>{t.scale.todaySub}</p><strong>{t.scale.paysLegacy}</strong><small>{t.scale.legacyTerms}</small><div>{t.scale.legacyNodes.map((item) => <i key={item}>{item}</i>)}</div></article>
          <article className="weso-summary" data-reveal><span>02</span><h3>{t.scale.weso}</h3><p>{t.scale.wesoSub}</p><strong>{t.scale.paysWeso}</strong><small>{t.scale.wesoTerms}</small><div>{t.scale.capabilities.map((item) => <i key={item}>{item}</i>)}</div></article>
        </div>
      </section>

      <section className="team-section" id="team">
        <div className="section-heading" data-reveal><p className="eyebrow">{t.team.label}</p><h2>{t.team.title}</h2></div>
        <div className="team-grid">{t.team.members.map(([name, role, country, image], index) => <article key={name} data-reveal style={{ "--delay": `${(index % 3) * 60}ms` } as React.CSSProperties}><div className="portrait"><Image src={image} alt={name} width={420} height={520} unoptimized /></div><span>{country}</span><h3>{name}</h3><p>{role}</p></article>)}</div>
      </section>

      <section className="round-section" id="round">
        <div className="round-top">
          <div className="section-heading inverse" data-reveal><p className="eyebrow">{t.round.label}</p><h2>{t.round.title}</h2></div>
          <div className="round-terms">{t.round.terms.map(([value, label]) => <article key={label} data-reveal><strong>{value}</strong><span>{label}</span></article>)}</div>
        </div>
        <div className="pipeline" data-reveal><p>{t.round.months}</p><div>{t.round.pipeline.map(([value, label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div></div>
        <div className="use-grid">{t.round.uses.map(([title, body], index) => <article key={title} data-reveal><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        <footer className="closing" data-reveal><h2>{t.round.closing}</h2><div><a href={`mailto:${t.round.emailAddress}`}>{t.round.email}<span>↗</span></a><a href={t.round.websiteUrl} target="_blank" rel="noreferrer">{t.round.website}<span>↗</span></a></div><p>weso.ai · {t.round.emailAddress}</p></footer>
      </section>
    </main>
  );
}
