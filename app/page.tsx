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
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
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
            <span className={lang === "en" ? "active" : ""}>EN</span>
            <span className={lang === "es" ? "active" : ""}>ES</span>
          </button>
          <a className="contact-button" href={`mailto:${t.round.emailAddress}`}>{t.nav.contact}<span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-inner">
          <div className="hero-meta" data-reveal><p>{t.hero.kicker}</p><span>{t.hero.signal}</span></div>
          <h1 data-reveal>{t.hero.titleA}<br /><em>{t.hero.titleB}</em></h1>
          <div className="hero-bottom" data-reveal><p>{t.hero.body}</p><a href="#problem">{t.hero.explore}<span aria-hidden="true">↓</span></a></div>
          <p className="hero-eyebrow" data-reveal>{t.hero.eyebrow}</p>
        </div>
      </section>

      <section className="content-section problem-section" id="problem">
        <div className="section-intro" data-reveal><p className="section-label">{t.problem.label}</p><h2>{t.problem.title}</h2><p className="section-lead">{t.problem.lead}</p></div>
        <div className="plain-copy" data-reveal><p>{t.problem.body}</p></div>
        <div className="problem-list">
          <div className="list-heading" data-reveal><h3>{t.problem.marketTitle}</h3><p>{t.problem.marketLead}</p></div>
          {t.problem.cards.map(([title, body], index) => (
            <article key={title} data-reveal style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}>
              <span>0{index + 1}</span><h3>{title}</h3><p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="solution-section" id="solution">
        <div className="solution-shell">
          <div className="section-intro inverse" data-reveal><p className="section-label">{t.solution.label}</p><h2>{t.solution.title}</h2></div>
          <div className="flow-line" aria-label={t.solution.flow.join(", ")}>
            {t.solution.flow.map((step, index) => (
              <div key={step} data-reveal style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>
            ))}
          </div>
          <div className="pillar-list">
            {t.solution.pillars.map(([title, body], index) => (
              <article key={title} data-reveal><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section market-section" id="market">
        <div className="section-intro" data-reveal><p className="section-label">{t.market.label}</p><h2>{t.market.title}</h2></div>
        <div className="market-story">
          {t.market.stats.map(([value, label, note], index) => (
            <article className={index === 2 || index === 6 ? "accent" : ""} key={`${value}-${label}`} data-reveal style={{ "--delay": `${(index % 3) * 70}ms` } as React.CSSProperties}>
              <span>0{index + 1}</span><strong>{value}</strong><h3>{label}</h3><p>{note}</p>
            </article>
          ))}
        </div>
        <div className="bridge" data-reveal><span>{t.market.bridge}</span><i aria-hidden="true" /><b aria-hidden="true">→</b><i aria-hidden="true" /><span>{t.market.bridgeTo}</span></div>
      </section>

      <section className="economics-section" id="economics">
        <div className="economics-shell">
          <div className="section-intro inverse" data-reveal><p className="section-label">{t.economics.label}</p><h2>{t.economics.title}</h2><p className="section-lead">{t.economics.intro}</p></div>
          <div className="economics-change" data-reveal>
            <article><span>{t.scale.today}</span><h3>{t.economics.from}</h3></article><b aria-hidden="true">→</b>
            <article className="is-weso"><span>{t.scale.weso}</span><h3>{t.economics.to}</h3><p>{t.economics.changed}</p></article>
          </div>
          <div className="economics-footer">
            <div className="badge-row" data-reveal>{t.economics.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
            <div className="result-row"><p data-reveal><strong>{t.economics.savingsValue}</strong><span>{t.economics.savings}</span></p><p data-reveal><strong>{t.economics.feeValue}</strong><span>{t.economics.fee}</span></p></div>
          </div>
        </div>
      </section>

      <section className="content-section scale-section" id="scale">
        <div className="section-intro" data-reveal><p className="section-label">{t.scale.label}</p><h2>{t.scale.title}</h2><p className="section-lead">{t.scale.lead}</p></div>
        <div className="comparison-grid">
          <article className="comparison-card legacy" data-reveal>
            <header><span>01</span><div><h3>{t.scale.today}</h3><p>{t.scale.todaySub}</p></div></header>
            <div className="comparison-path"><p><strong>{t.scale.insurer}</strong><small>{t.scale.owner}</small></p><b aria-hidden="true">↓</b><p><strong>{t.scale.paysLegacy}</strong><small>{t.scale.legacyTerms}</small></p><div>{t.scale.legacyNodes.map((node) => <span key={node}>{node}</span>)}</div><b aria-hidden="true">↓</b><p><strong>{t.scale.policyholder}</strong><small>{t.scale.receives}</small></p></div>
          </article>
          <article className="comparison-card weso" data-reveal>
            <header><span>02</span><div><h3>{t.scale.weso}</h3><p>{t.scale.wesoSub}</p></div></header>
            <div className="comparison-path"><p><strong>{t.scale.insurer}</strong><small>{t.scale.owner}</small></p><b aria-hidden="true">↓</b><p><strong>{t.scale.paysWeso}</strong><small>{t.scale.wesoTerms}</small></p><div className="weso-core"><strong>weso</strong><small>{t.scale.infrastructure}</small>{t.scale.capabilities.map((item) => <span key={item}>{item}</span>)}</div><b aria-hidden="true">↓</b><p><strong>{t.scale.policyholder}</strong><small>{t.scale.receives}</small></p></div>
          </article>
        </div>
      </section>

      <section className="content-section team-section" id="team">
        <div className="section-intro" data-reveal><p className="section-label">{t.team.label}</p><h2>{t.team.title}</h2></div>
        <div className="team-grid">
          {t.team.members.map(([name, role, country, image], index) => (
            <article key={name} data-reveal style={{ "--delay": `${(index % 3) * 70}ms` } as React.CSSProperties}><div className="portrait"><Image src={image} alt={name} width={420} height={520} unoptimized /></div><h3>{name}</h3><p>{role}</p><span>{country}</span></article>
          ))}
        </div>
      </section>

      <section className="round-section" id="round">
        <div className="round-shell">
          <div className="section-intro inverse" data-reveal><p className="section-label">{t.round.label}</p><h2>{t.round.title}</h2></div>
          <div className="term-grid">{t.round.terms.map(([value, label], index) => <article key={label} data-reveal style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}><strong>{value}</strong><span>{label}</span></article>)}</div>
          <p className="subsection-label" data-reveal>{t.round.months}</p>
          <div className="pipeline-grid">{t.round.pipeline.map(([value, label], index) => <article key={label} data-reveal><span>0{index + 1}</span><strong>{value}</strong><p>{label}</p></article>)}</div>
          <div className="use-list">{t.round.uses.map(([title, body], index) => <article key={title} data-reveal><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
          <footer className="closing" data-reveal>
            <h2>{t.round.closing}</h2>
            <div><a href={`mailto:${t.round.emailAddress}`}>{t.round.email}<span>↗</span></a><a href={t.round.websiteUrl} target="_blank" rel="noreferrer">{t.round.website}<span>↗</span></a></div>
            <p>weso.ai · {t.round.emailAddress}</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
