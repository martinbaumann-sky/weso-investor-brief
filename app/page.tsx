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
        <h1 data-reveal>{t.hero.titleA}<br /><em>{t.hero.titleB}</em></h1>
        <a className="hero-scroll" href="#problem" aria-label={t.hero.explore}>↓</a>
      </section>

      <section className="story-section light-section" id="problem">
        <div className="section-screen intro-screen" data-reveal><p className="eyebrow">{t.problem.label}</p><h2>{t.problem.title}</h2><p>{t.problem.lead}</p></div>
        {t.problem.cards.map(([title, body], index) => <article className="section-screen text-moment" key={title} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}
      </section>

      <section className="story-section dark-section" id="solution">
        <div className="section-screen intro-screen" data-reveal><p className="eyebrow">{t.solution.label}</p><h2>{t.solution.title}</h2></div>
        {t.solution.flow.map((step, index) => <article className="section-screen flow-moment" key={step} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{step}</h3></article>)}
        {t.solution.pillars.map(([title, body], index) => <article className="section-screen text-moment pillar-moment" key={title} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}
      </section>

      <section className="story-section market-story" id="market">
        <div className="market-background" aria-hidden="true"><Image src="/media/roadside.jpg" alt="" fill sizes="100vw" /></div>
        <div className="section-screen intro-screen" data-reveal><p className="eyebrow">{t.market.label}</p><h2>{t.market.title}</h2></div>
        {t.market.stats.map(([value, label, note], index) => <article className="section-screen metric-moment" key={`${value}-${label}`} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><strong>{value}</strong><h3>{label}</h3><p>{note}</p></article>)}
      </section>

      <section className="story-section light-section" id="economics">
        <div className="section-screen intro-screen" data-reveal><p className="eyebrow">{t.economics.label}</p><h2>{t.economics.title}</h2><p>{t.economics.intro}</p></div>
        <article className="section-screen text-moment economics-moment" data-reveal><span>{t.scale.today}</span><h3>{t.economics.from}</h3></article>
        <article className="section-screen text-moment economics-moment accent-moment" data-reveal><span>{t.scale.weso}</span><h3>{t.economics.to}</h3></article>
        <article className="section-screen metric-moment plain-metric" data-reveal><strong>{t.economics.savingsValue}</strong><h3>{t.economics.savings}</h3></article>
        <article className="section-screen metric-moment plain-metric" data-reveal><strong>{t.economics.feeValue}</strong><h3>{t.economics.fee}</h3></article>
        {t.economics.badges.map((badge, index) => <article className="section-screen badge-moment" key={badge} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{badge}</h3></article>)}
      </section>

      <section className="story-section dark-section" id="scale">
        <div className="section-screen intro-screen" data-reveal><p className="eyebrow">{t.scale.label}</p><h2>{t.scale.title}</h2><p>{t.scale.lead}</p></div>
        <article className="section-screen scale-moment" data-reveal><span>01 · {t.scale.today}</span><h3>{t.scale.todaySub}</h3><strong>{t.scale.paysLegacy}</strong><p>{t.scale.legacyTerms}</p><div>{t.scale.legacyNodes.map((item) => <i key={item}>{item}</i>)}</div></article>
        <article className="section-screen scale-moment accent-moment" data-reveal><span>02 · {t.scale.weso}</span><h3>{t.scale.wesoSub}</h3><strong>{t.scale.paysWeso}</strong><p>{t.scale.wesoTerms}</p></article>
        {t.scale.capabilities.map((item, index) => <article className="section-screen capability-moment" key={item} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3><p>{t.scale.infrastructure}</p></article>)}
      </section>

      <section className="story-section team-story" id="team">
        <div className="section-screen intro-screen" data-reveal><p className="eyebrow">{t.team.label}</p><h2>{t.team.title}</h2></div>
        {t.team.members.map(([name, role, country, image]) => <article className="section-screen team-moment" key={name} data-reveal><Image src={image} alt="" fill sizes="(max-width: 800px) 92vw, 760px" unoptimized /><div><span>{country}</span><h3>{name}</h3><p>{role}</p></div></article>)}
      </section>

      <section className="story-section round-story" id="round">
        <div className="section-screen intro-screen" data-reveal><p className="eyebrow">{t.round.label}</p><h2>{t.round.title}</h2></div>
        {t.round.terms.map(([value, label], index) => <article className="section-screen metric-moment" key={label} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><strong>{value}</strong><h3>{label}</h3></article>)}
        <div className="section-screen chapter-screen" data-reveal><p className="eyebrow">{t.round.months}</p></div>
        {t.round.pipeline.map(([value, label], index) => <article className="section-screen metric-moment" key={label} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><strong>{value}</strong><h3>{label}</h3></article>)}
        {t.round.uses.map(([title, body], index) => <article className="section-screen text-moment" key={title} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}
        <footer className="section-screen closing" data-reveal><h2>{t.round.closing}</h2><div><a href={`mailto:${t.round.emailAddress}`}>{t.round.email}<span>↗</span></a><a href={t.round.websiteUrl} target="_blank" rel="noreferrer">{t.round.website}<span>↗</span></a></div><p>weso.ai · {t.round.emailAddress}</p></footer>
      </section>
    </main>
  );
}
