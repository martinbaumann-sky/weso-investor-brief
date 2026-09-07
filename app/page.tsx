"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { content, type Lang } from "./content";

type InvestorBriefProps = {
  compact?: boolean;
};

function CoreChannelGraphic({ index }: { index: number }) {
  const svgProps = { viewBox: "0 0 72 72", role: "presentation", focusable: false } as const;

  if (index === 0) {
    return <svg {...svgProps}><path d="M12 36h48M36 12v48" /><circle cx="36" cy="36" r="18" /><circle cx="36" cy="36" r="5" fill="currentColor" stroke="none" /><circle cx="19" cy="19" r="3" fill="currentColor" stroke="none" /><circle cx="53" cy="19" r="3" fill="currentColor" stroke="none" /><circle cx="19" cy="53" r="3" fill="currentColor" stroke="none" /><circle cx="53" cy="53" r="3" fill="currentColor" stroke="none" /></svg>;
  }

  if (index === 1) {
    return <svg {...svgProps}><path d="M9 39c5 0 5-15 10-15s5 25 10 25 5-38 10-38 5 39 10 39 5-24 10-24 5 13 10 13" /><path d="M9 56h54" opacity=".3" /></svg>;
  }

  if (index === 2) {
    return <svg {...svgProps}><path d="M10 18h38a9 9 0 0 1 9 9v14a9 9 0 0 1-9 9H29l-11 9 2-9h-10a9 9 0 0 1-9-9V27a9 9 0 0 1 9-9Z" /><path d="M23 32h20M23 40h13" /></svg>;
  }

  if (index === 3) {
    return <svg {...svgProps}><circle cx="36" cy="34" r="24" /><path d="M23 25c2-3 4-3 6-1l4 5c1 2 0 4-2 5l-2 1c3 5 6 8 11 10l1-2c1-2 3-3 5-2l5 3c2 1 2 4 0 6-3 4-8 5-13 3-9-3-18-12-21-21-2-4-1-8 1-10Z" fill="currentColor" stroke="none" /></svg>;
  }

  return <svg {...svgProps}><rect x="20" y="8" width="32" height="56" rx="7" /><path d="M28 18h16M28 27h16M28 36h10" /><circle cx="36" cy="54" r="3" fill="currentColor" stroke="none" /></svg>;
}

export function InvestorBrief({ compact = false }: InvestorBriefProps) {
  const [lang, setLang] = useState<Lang>("en");
  const [progress, setProgress] = useState(0);
  const [solutionStep, setSolutionStep] = useState(0);
  const [solutionProgress, setSolutionProgress] = useState(0);
  const [coreStep, setCoreStep] = useState(0);
  const [economicsRevealProgress, setEconomicsRevealProgress] = useState(0);
  const [performanceProgress, setPerformanceProgress] = useState(0);
  const [savingsPercent, setSavingsPercent] = useState(0);
  const teamCarouselRef = useRef<HTMLDivElement>(null);
  const [teamActiveIndex, setTeamActiveIndex] = useState(0);
  const appDemoRef = useRef<HTMLElement>(null);
  const [appDemoProgress, setAppDemoProgress] = useState(0);
  const t = content[lang];

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = appDemoRef.current;
      if (!section) return;
      const travel = section.offsetHeight - window.innerHeight;
      setAppDemoProgress(Math.max(0, Math.min(1, -section.getBoundingClientRect().top / Math.max(1, travel))));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const getTeamCarouselStep = () => {
    const carousel = teamCarouselRef.current;
    if (!carousel) return 0;
    const card = carousel.querySelector<HTMLElement>("[data-team-card]");
    const track = carousel.querySelector<HTMLElement>(".compact-team");
    const gap = Number.parseFloat(track ? getComputedStyle(track).gap : "10") || 10;
    return card ? card.offsetWidth + gap : carousel.clientWidth;
  };

  const moveTeamCarousel = (direction: number) => {
    const carousel = teamCarouselRef.current;
    const distance = getTeamCarouselStep();
    if (!carousel || !distance) return;
    carousel.scrollBy({ left: distance * direction, behavior: "smooth" });
  };

  const goToTeamMember = (index: number) => {
    const carousel = teamCarouselRef.current;
    const distance = getTeamCarouselStep();
    if (!carousel || !distance) return;
    const maxScroll = Math.max(carousel.scrollWidth - carousel.clientWidth, 0);
    carousel.scrollTo({ left: Math.min(distance * index, maxScroll), behavior: "smooth" });
    setTeamActiveIndex(index);
  };

  useEffect(() => {
    const carousel = teamCarouselRef.current;
    if (!carousel) return;

    const advance = () => {
      const distance = getTeamCarouselStep();
      if (!distance) return;
      const maxScroll = Math.max(carousel.scrollWidth - carousel.clientWidth, 0);
      if (carousel.scrollLeft >= maxScroll - 2) {
        carousel.scrollTo({ left: 0, behavior: "instant" });
      } else {
        carousel.scrollBy({ left: distance, behavior: "smooth" });
      }
    };

    const timer = window.setInterval(advance, 3200);
    return () => {
      window.clearInterval(timer);
    };
  }, [lang, t.team.members.length]);

  useEffect(() => {
    const carousel = teamCarouselRef.current;
    if (!carousel) return;
    const updateActiveIndex = () => {
      const distance = getTeamCarouselStep();
      if (!distance) return;
      setTeamActiveIndex(Math.min(Math.round(carousel.scrollLeft / distance), t.team.members.length - 1));
    };
    updateActiveIndex();
    carousel.addEventListener("scroll", updateActiveIndex, { passive: true });
    return () => carousel.removeEventListener("scroll", updateActiveIndex);
  }, [lang, t.team.members.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saved = window.localStorage.getItem("weso-lang");
    const initial: Lang = params.get("lang") === "es" || saved === "es" ? "es" : "en";
    document.documentElement.lang = initial;
    const timer = window.setTimeout(() => setLang(initial), 0);
    return () => window.clearTimeout(timer);
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
    const nodes = document.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      nodes.forEach((node) => node.classList.add("is-scroll-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-scroll-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -9%" });

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [lang]);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".issue-scroll-card"));
    const phone = window.matchMedia("(max-width: 680px)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const updateCards = () => {
      animationFrame = 0;
      cards.forEach((card) => {
        if (!phone.matches || reduceMotion.matches) {
          card.style.setProperty("--card-opacity", "1");
          card.style.setProperty("--card-shift", "0px");
          card.style.setProperty("--card-scale", "1");
          card.style.setProperty("--card-clip", "0%");
          return;
        }

        const top = card.getBoundingClientRect().top;
        const start = window.innerHeight * 0.96;
        const end = window.innerHeight * 0.5;
        const raw = Math.min(Math.max((start - top) / (start - end), 0), 1);
        const eased = raw * raw * (3 - 2 * raw);
        card.style.setProperty("--card-opacity", String(0.12 + eased * 0.88));
        card.style.setProperty("--card-shift", `${(1 - eased) * 78}px`);
        card.style.setProperty("--card-scale", String(0.91 + eased * 0.09));
        card.style.setProperty("--card-clip", `${(1 - eased) * 14}%`);
      });
    };

    const requestUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateCards);
    };

    updateCards();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    phone.addEventListener("change", requestUpdate);
    reduceMotion.addEventListener("change", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      phone.removeEventListener("change", requestUpdate);
      reduceMotion.removeEventListener("change", requestUpdate);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [lang]);

  useEffect(() => {
    const updateSolutionStep = () => {
      const section = document.querySelector<HTMLElement>("#solution");
      if (!section) return;

      if (window.matchMedia("(max-width: 680px)").matches) {
        const graph = section.querySelector<HTMLElement>(".process-graph");
        if (!graph) return;
        const centerY = graph.getBoundingClientRect().top + graph.offsetHeight / 2;
        const startY = window.innerHeight * 0.56;
        const endY = window.innerHeight * 0.24;
        const mobileProgress = Math.min(Math.max((startY - centerY) / (startY - endY), 0), 1);
        setSolutionProgress(mobileProgress);
        setSolutionStep(Math.min(t.solution.flow.length - 1, Math.round(mobileProgress * (t.solution.flow.length - 1))));
        return;
      }

      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travel);
      const next = Math.min(t.solution.flow.length - 1, Math.floor((passed / travel) * t.solution.flow.length));
      setSolutionProgress(0);
      setSolutionStep(next);
    };
    updateSolutionStep();
    window.addEventListener("scroll", updateSolutionStep, { passive: true });
    window.addEventListener("resize", updateSolutionStep);
    return () => {
      window.removeEventListener("scroll", updateSolutionStep);
      window.removeEventListener("resize", updateSolutionStep);
    };
  }, [lang, t.solution.flow.length]);

  useEffect(() => {
    if (!compact) return;

    const section = document.querySelector<HTMLElement>("#core");
    if (!section) return;

    let animationFrame = 0;
    const updateCoreStep = () => {
      animationFrame = 0;
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travel);
      const next = Math.min(t.core.channels.length - 1, Math.floor((passed / travel) * t.core.channels.length));
      setCoreStep(next);
    };
    const requestUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateCoreStep);
    };

    updateCoreStep();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [compact, t.core.channels.length]);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#economics");
    if (!section) return;

    let animationFrame = 0;
    const updateEconomicsCards = () => {
      animationFrame = 0;
      const panel = section.querySelector<HTMLElement>(".economics-panel:first-child");
      if (!panel) return;

      const travel = Math.max(panel.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-panel.getBoundingClientRect().top, 0), travel);
      const sequenceStart = travel * 0.08;
      const sequenceEnd = travel * 0.42;
      const revealProgress = Math.min(Math.max((passed - sequenceStart) / Math.max(sequenceEnd - sequenceStart, 1), 0), 1);
      setEconomicsRevealProgress(revealProgress);
    };
    const requestUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateEconomicsCards);
    };

    updateEconomicsCards();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [lang]);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#performance");
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    const updatePerformance = () => {
      animationFrame = 0;
      if (reduceMotion.matches || window.matchMedia("(max-width: 860px)").matches) {
        setPerformanceProgress(1);
        return;
      }

      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travel);
      setPerformanceProgress(passed / travel);
    };
    const requestUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updatePerformance);
    };

    updatePerformance();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reduceMotion.addEventListener("change", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reduceMotion.removeEventListener("change", requestUpdate);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [lang]);

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(".savings-result");
    if (!target) return;

    let animationFrame = 0;
    let hasStarted = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasStarted) return;
      hasStarted = true;
      observer.disconnect();

      if (reduceMotion) {
        setSavingsPercent(45);
        return;
      }

      const duration = 1600;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        setSavingsPercent(Math.round(45 * eased));
        if (elapsed < 1) animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }, { threshold: 0.4 });

    observer.observe(target);
    return () => {
      observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

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
          <div className="desktop-nav"><a href="#problem">{t.nav.thesis}</a><a href="#performance">{t.nav.kpis}</a>{compact && <a href="#core">{t.core.label.split(" · ")[1]}</a>}{!compact && <a href="#market">{t.nav.market}</a>}<a href="#economics">{t.nav.model}</a><a href="#team">{t.nav.team}</a></div>
          <button className="language-switch" type="button" onClick={switchLanguage} aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}><span className={lang === "en" ? "active" : ""}>EN</span><span className={lang === "es" ? "active" : ""}>ES</span></button>
          <a className="contact-button" href={`mailto:${t.round.emailAddress}`}>{t.nav.contact}<span>↗</span></a>
        </nav>
      </header>

      <section className="hero" id="top">
        <h1 data-reveal><span className="hero-title-line">{t.hero.titleA}</span><br /><em className="hero-title-line">{t.hero.titleB.replace(/\.$/, "")}<span className="hero-dot">.</span></em></h1>
        <a className="hero-scroll" href="#problem" aria-label={t.hero.explore}>↓</a>
      </section>

      <section className="scroll-chapter problem-chapter" id="problem">
        <div className="chapter-background" aria-hidden="true"><span>01—02</span><strong>weso</strong></div>
        <div className="chapter-panels">
          <article className="chapter-panel problem-sequence-panel">
            <div className="panel-copy problem-copy" data-reveal><p className="eyebrow">{t.problem.label}</p><h2>{t.problem.title}</h2><p className="panel-lead">{t.problem.lead}</p></div>
            <div className="issue-scroll-list">{t.problem.cards.map(([title, body], index) => <article className="issue-scroll-card" data-reveal key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}{compact && <aside className="execution-callout" data-reveal><p className="eyebrow">{t.problem.calloutLabel}</p><h3>{t.problem.calloutTitle}</h3><p>{t.problem.calloutBody}</p></aside>}</div>
          </article>
          <article className="chapter-panel solution-panel solution-graphic-panel" id="solution">
            <div className="solution-sticky">
              <div className="panel-copy" data-reveal><p className="eyebrow">{t.solution.label}</p><h2>{t.solution.title}</h2></div>
              <div className="process-visual" style={{ "--flow-progress": `${Math.max(0, solutionStep) / (t.solution.flow.length - 1) * 100}%` } as CSSProperties}>
                <div className="process-graph" role="list" aria-label={t.solution.title}>
                  <div className="process-line" aria-hidden="true"><i /></div>
                  {t.solution.flow.map((step, index) => {
                    const position = solutionProgress * (t.solution.flow.length - 1);
                    const nodeProgress = index === 0 ? 1 : Math.min(Math.max(position - (index - 1), 0), 1);
                    const nodeActive = Math.min(Math.max(1 - Math.abs(position - index), 0), 1);
                    const base = [23 + (242 - 23) * nodeProgress, 21 + (11 - 21) * nodeProgress, 24 + (143 - 24) * nodeProgress];
                    const color = base.map((channel, channelIndex) => Math.round(channel + ([201, 255, 77][channelIndex] - channel) * nodeActive));
                    const textShade = Math.round(255 - 232 * nodeActive);
                    const nodeStyle = {
                      "--node-bg": `rgb(${color.join(" ")})`,
                      "--node-color": `rgb(${textShade} ${textShade} ${textShade})`,
                      "--node-opacity": 0.58 + nodeProgress * 0.42,
                      "--node-shift": `${(1 - nodeProgress) * 8}px`,
                      "--node-scale": 0.94 + nodeProgress * 0.06,
                      "--node-ring": `${nodeActive * 8}px`,
                    } as CSSProperties;
                    return <div className={`process-node ${index <= solutionStep ? "is-shown" : ""} ${index === solutionStep ? "is-current" : ""}`} style={nodeStyle} role="listitem" aria-current={index === solutionStep ? "step" : undefined} key={step}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></div>;
                  })}
                </div>
                <p className="process-caption" aria-live="polite">{solutionStep >= 0 ? t.solution.flow[solutionStep] : t.solution.title}</p>
              </div>
              <div className="compact-grid pillars-grid">{t.solution.pillars.map(([title, body], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></div>)}</div>
            </div>
          </article>
        </div>
      </section>

      {compact && <section className="core-chapter" id="core">
        <div className="core-inner">
          <div className="core-copy" data-reveal><p className="eyebrow">{t.core.label}</p><h2>{t.core.title}</h2><p>{t.core.lead}</p></div>
          <div className="core-board">
            <div className="core-channel-list" role="list" aria-label={t.core.title}>{t.core.channels.map(([label, body], index) => <article className={`core-channel-card core-channel-card-${index + 1} ${index === coreStep ? "is-active" : ""}`} aria-hidden={index !== coreStep} key={label} role="listitem">
              <div className="core-channel-visual"><CoreChannelGraphic index={index} /></div>
              <div className="core-channel-copy"><h3>{label}</h3><p>{body}</p></div>
            </article>)}</div>
            <div className="core-channel-progress" aria-hidden="true"><div>{t.core.channels.map((channel, index) => <i className={index === coreStep ? "is-active" : ""} key={channel[0]} />)}</div></div>
          </div>
        </div>
      </section>}

      {compact && <section className="human-care" id="human-oversight" aria-labelledby="human-care-title">
        <div className="human-care-inner">
          <div className="human-care-copy">
            <p className="eyebrow">{lang === "es" ? "Tecnología con criterio humano" : "Technology with human judgment"}</p>
            <h2 id="human-care-title">{lang === "es" ? "Inteligencia artificial." : "Artificial intelligence."}<br /><span>{lang === "es" ? "Cuidado humano." : "Human care."}</span></h2>
            <p className="human-care-lead">{lang === "es" ? "La IA coordina el servicio. Nuestro equipo interviene cuando necesitas atención personal." : "AI coordinates the service. Our team steps in when you need personal attention."}</p>
            <dl className="human-care-roles">
              <div><dt>{lang === "es" ? "La IA coordina" : "AI coordinates"}</dt><dd>{lang === "es" ? "Solicitudes, asignaciones y seguimiento." : "Requests, assignments, and tracking."}</dd></div>
              <div><dt>{lang === "es" ? "Las personas acompañan" : "People support you"}</dt><dd>{lang === "es" ? "Atención personal y resolución de casos especiales." : "Personal attention and support for exceptional cases."}</dd></div>
            </dl>
          </div>
          <div className="human-care-portrait"><Image src="/assets/human-care.png" alt={lang === "es" ? "Personaje conversando por teléfono" : "Character talking on the phone"} width={1026} height={1011} sizes="(max-width: 820px) 90vw, 46vw" unoptimized /></div>
        </div>
      </section>}

      <section className="performance-chapter" id="performance">
        <div className="performance-sticky">
          <div className="performance-heading">
            <div>
              <p className="eyebrow">{compact ? t.performance.label.replace("03", "04") : t.performance.label}</p>
              <h2>{t.performance.title}</h2>
            </div>
            <p>{t.performance.lead}</p>
          </div>
          <div className="performance-grid" role="list" aria-label={t.performance.title}>
            {t.performance.metrics.map((metric, index) => {
              const reveal = Math.min(Math.max((performanceProgress - index * 0.065) / 0.42, 0), 1);
              const eased = 1 - Math.pow(1 - reveal, 3);
              const metricStyle = {
                "--metric-opacity": 0.08 + eased * 0.92,
                "--metric-shift": `${(1 - eased) * 52}px`,
                "--metric-scale": 0.94 + eased * 0.06,
              } as CSSProperties;
              return (
                <article className={`performance-card performance-card-${index + 1}`} style={metricStyle} role="listitem" key={metric.title}>
                  <div className="performance-card-top"><span>{String(index + 1).padStart(2, "0")}</span><i aria-hidden="true" /></div>
                  <div>
                    <p>{metric.title}</p>
                    <strong>{metric.value}</strong>
                    {"stars" in metric && metric.stars && <span className="performance-stars" role="img" aria-label="5 stars">★★★★★</span>}
                  </div>
                  <small>{metric.body}</small>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {!compact && <section className="scroll-chapter market-chapter" id="market">
        <div className="chapter-background market-abstract-background" aria-hidden="true" />
        <div className="chapter-panels">
          <article className="chapter-panel market-panel market-proof-panel" data-reveal>
            <div className="panel-copy" data-scroll-reveal="heading"><p className="eyebrow">{t.market.label}</p><h2>{t.market.title}</h2><p className="panel-lead">{t.market.lead}</p></div>
            <div className="market-funnel" aria-label={t.market.title}>
              <ol className="market-funnel-stages">
                {t.market.funnel.map(([value, label, note], index) => (
                  <li
                    className={index === t.market.funnel.length - 1 ? "market-funnel-result" : ""}
                    data-scroll-reveal="pop"
                    style={{ "--funnel-width": `${100 - index * 14}%`, "--reveal-order": index } as CSSProperties}
                    key={label}
                  >
                    <div className="market-funnel-value"><span>{String(index + 1).padStart(2, "0")}</span><strong>{value}</strong></div>
                    <div><h3>{label}</h3><p>{note}</p></div>
                  </li>
                ))}
              </ol>
              <div className="market-funnel-footer" data-scroll-reveal="heading" style={{ "--reveal-order": 3 } as CSSProperties}>
                <div><span>{t.market.fee[1]}</span><strong>{t.market.fee[0]}</strong></div>
                <p>{t.market.basis}</p>
              </div>
            </div>
          </article>
        </div>
      </section>}

      <section className="scroll-chapter economics-chapter" id="economics">
        <div className="chapter-background economics-background" aria-hidden="true"><span>{t.market.bridge}</span><strong>→</strong><span>{t.market.bridgeTo}</span></div>
        <div className="chapter-panels">
          <article className="chapter-panel economics-panel" data-reveal>
            <div className="panel-copy" data-scroll-reveal="heading"><p className="eyebrow">{compact ? t.economics.label.replace("05", "04") : t.economics.label}</p><h2>{t.economics.title}</h2><p className="panel-lead">{t.economics.intro}</p></div>
            <div className="economics-compare" style={{ "--economics-progress": economicsRevealProgress } as CSSProperties}><div style={{ "--economics-reveal-delay": 0 } as CSSProperties}><span>FROM</span><h3>{t.economics.from}</h3></div><b style={{ "--economics-reveal-delay": .34 } as CSSProperties}>→</b><div className="economics-to" style={{ "--economics-reveal-delay": .68 } as CSSProperties}><span>TO</span><h3>{t.economics.to}</h3><p>{t.economics.changed}</p></div></div>
          </article>
          <article className="chapter-panel economics-panel results-panel" data-reveal>
            <div className="savings-focus">
              <div className="savings-result" data-scroll-reveal="pop"><strong aria-label={t.economics.savingsValue}>{savingsPercent}%</strong><p>{t.economics.savings}</p></div>
              <p className="business-model-note" data-scroll-reveal="heading" style={{ "--reveal-order": 1 } as CSSProperties}>{t.economics.modelNote}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="app-demo" id="app-demo" ref={appDemoRef} aria-label={lang === "es" ? "La aplicación Weso" : "The Weso app"}>
        <div className="app-demo-sticky">
          <div className="app-demo-phone">
            <div className="app-demo-screen">
              {[
                [140, 44, 438, 950],
                [705, 53, 438, 957],
                [1287, 41, 438, 957],
              ].map(([x, y, width, height], index) => {
                const opacity = index === 0 ? 1 : Math.max(0, Math.min(1, (appDemoProgress - (index === 1 ? .24 : .61)) / .13));
                const labels = lang === "es" ? ["Inicio y solicitud de servicios", "Perfil del profesional", "Seguimiento del servicio"] : ["Home and service requests", "Professional profile", "Service tracking"];
                return <div className="app-demo-screen-layer" key={index} style={{ opacity }} aria-hidden={index !== (appDemoProgress < .305 ? 0 : appDemoProgress < .675 ? 1 : 2)}>
                  <img src="/assets/app-three-screens.png" alt={labels[index]} draggable={false} style={{ width: `${1847 / width * 100}%`, height: `${1037 / height * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} />
                </div>;
              })}
            </div>
          </div>
          <div className="app-demo-steps" aria-hidden="true">{[0, 1, 2].map(index => <span key={index} className={index === (appDemoProgress < .305 ? 0 : appDemoProgress < .675 ? 1 : 2) ? "is-active" : ""} />)}</div>
        </div>
      </section>

      <section className="scroll-chapter team-chapter" id="team">
        <div className="chapter-background team-background" aria-hidden="true"><span>{compact ? "05" : "06"}</span><strong>team</strong></div>
        <div className="chapter-panels">
          <article className="chapter-panel team-panel" data-reveal>
            <div className="panel-copy" data-scroll-reveal="heading"><p className="eyebrow">{t.team.label}</p><h2>{t.team.title}</h2></div>
            <div className="team-carousel" role="region" aria-roledescription="carousel" aria-label={lang === "es" ? "Carrusel del equipo" : "Team carousel"}>
              <div className="team-carousel-viewport" ref={teamCarouselRef} tabIndex={0} onKeyDown={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  event.preventDefault();
                  moveTeamCarousel(event.key === "ArrowRight" ? 1 : -1);
                }
              }}>
                <div className="compact-team">{t.team.members.map(([name, role, country, image], index) => <div data-team-card data-scroll-reveal="card" style={{ "--reveal-order": index % 3 } as CSSProperties} key={name}><Image src={image} alt={`${name} — ${role}`} fill sizes="180px" unoptimized /><div><span>{country}</span><h3>{name}</h3><p>{role}</p></div></div>)}</div>
              </div>
              <div className="team-carousel-pagination" aria-label={lang === "es" ? "Elegir integrante del equipo" : "Choose a team member"}>{t.team.members.map(([name], index) => <button type="button" key={name} className={index === teamActiveIndex ? "is-active" : ""} aria-label={`${index + 1}. ${name}`} aria-current={index === teamActiveIndex ? "true" : undefined} onClick={() => goToTeamMember(index)} />)}</div>
            </div>
          </article>
        </div>
      </section>

      {!compact && <section className="compact-round" id="round">
        <div className="round-inner" data-reveal>
          <div className="round-heading" data-scroll-reveal="heading"><p className="eyebrow">{t.round.label}</p><h2>{t.round.title}</h2></div>
          <div className="round-data"><p className="pipeline-label" data-scroll-reveal="heading">{t.round.months}</p><div className="pipeline-compact">{t.round.pipeline.map(([value, label], index) => <div data-scroll-reveal="pop" style={{ "--reveal-order": index } as CSSProperties} key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></div>
          <div className="uses-compact">{t.round.uses.map(([title, body], index) => <div data-scroll-reveal="card" style={{ "--reveal-order": index } as CSSProperties} key={title}><h3>{title}</h3><p>{body}</p></div>)}</div>
          <footer className="round-footer" data-scroll-reveal="heading"><h3>{t.round.closing}</h3><div><a href={`mailto:${t.round.emailAddress}`}>{t.round.email}<span>↗</span></a><a href={t.round.websiteUrl} target="_blank" rel="noreferrer">{t.round.website}<span>↗</span></a></div></footer>
        </div>
      </section>}
      <footer className="contact-closing" id="contact" aria-labelledby="closing-title">
        <div className="contact-closing-inner">
          <div className="closing-logo"><Image src="/assets/p1-2.png" alt="Weso" width={240} height={240} unoptimized /></div>
          <h2 id="closing-title">{lang === "es" ? "Transformemos tu operación." : "Transform your operations."}<br /><span>{lang === "es" ? "Juntos." : "Together."}</span></h2>
          <div className="closing-actions">
            <a className="closing-primary" href="mailto:sebastian@weso.ai">{lang === "es" ? "Conversemos" : "Let's talk"}<span aria-hidden="true">↗</span></a>
            <a className="closing-secondary" href="tel:+13053396633">{lang === "es" ? "Llámanos" : "Call us"}<span aria-hidden="true">↗</span></a>
          </div>
          <div className="closing-details">
            <div><a href="mailto:sebastian@weso.ai">sebastian@weso.ai</a><a href="tel:+13053396633">+1 (305) 339-6633</a></div>
            <address>1200 Brickell Av, Suite 1950 #1119<br />Miami, FL 33131, USA</address>
            <a href="https://weso.ai" target="_blank" rel="noreferrer">weso.ai <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return <InvestorBrief compact />;
}
