"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { content, type Lang } from "./content";

function HeroNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const compact = width < 700;
      const startX = compact ? width * 0.08 : width * 0.48;
      const joinX = compact ? width * 0.82 : width * 0.89;
      const joinY = compact ? height * 0.72 : height * 0.51;
      const sourceYs = compact
        ? [0.51, 0.58, 0.65, 0.72, 0.79, 0.86].map((value) => value * height)
        : [0.22, 0.32, 0.41, 0.51, 0.61, 0.72, 0.82].map((value) => value * height);

      context.lineWidth = 1;
      context.strokeStyle = "rgba(25, 23, 25, .07)";
      const gridStart = compact ? width * 0.2 : width * 0.55;
      const gridSize = compact ? 88 : 130;
      for (let x = gridStart; x < width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = compact ? height * 0.48 : height * 0.16; y < height * 0.88; y += gridSize) {
        context.beginPath();
        context.moveTo(gridStart, y);
        context.lineTo(width, y);
        context.stroke();
      }

      const gradient = context.createLinearGradient(startX, 0, joinX, 0);
      gradient.addColorStop(0, "rgba(242, 11, 143, .23)");
      gradient.addColorStop(.55, "rgba(225, 43, 202, .58)");
      gradient.addColorStop(1, "rgba(90, 24, 255, .92)");
      context.strokeStyle = gradient;
      context.lineWidth = compact ? 1.15 : 1.35;

      sourceYs.forEach((sourceY) => {
        context.beginPath();
        context.moveTo(startX, sourceY);
        context.bezierCurveTo(
          startX + (joinX - startX) * .55,
          sourceY,
          startX + (joinX - startX) * .67,
          joinY,
          joinX,
          joinY,
        );
        context.stroke();

        context.beginPath();
        context.fillStyle = "rgba(205, 89, 169, .26)";
        context.arc(startX, sourceY, compact ? 3.5 : 5.5, 0, Math.PI * 2);
        context.fill();
      });

      context.beginPath();
      context.moveTo(joinX, joinY);
      context.lineTo(width, joinY);
      context.strokeStyle = "rgba(90, 24, 255, .88)";
      context.stroke();

      context.beginPath();
      context.fillStyle = "#faf9f6";
      context.strokeStyle = "#6f31ff";
      context.lineWidth = 1.2;
      context.arc(joinX, joinY, compact ? 15 : 22, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      context.beginPath();
      context.fillStyle = "#4c12dc";
      context.arc(joinX, joinY, compact ? 5 : 8, 0, Math.PI * 2);
      context.fill();
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return <canvas ref={canvasRef} className="hero-network" aria-hidden="true" />;
}

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
        <HeroNetwork />
        <div className="hero-inner">
          <h1 data-reveal>{t.hero.titleA}<br /><span>{t.hero.titleB}</span></h1>
          <div className="hero-notes" data-reveal>
            <p className="hero-kicker">{t.hero.kicker}</p>
            <p>{t.hero.body}</p>
            <a href="#problem" aria-label={t.hero.explore}><span>{t.hero.explore}</span>↓</a>
          </div>
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
