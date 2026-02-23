import { Link } from "react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  Code2Icon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  TerminalIcon,
  BrainCircuitIcon,
  GlobeIcon,
  StarIcon,
  RocketIcon,
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";

/* ── Typing-effect code block ── */
const TYPING_LINES = [
  { text: "// ",           cls: "p"  },
  { text: "Welcome to DevNexus", cls: "kw" },
  { text: "\n\n",          cls: "p"  },
  { text: "const",         cls: "kw" },
  { text: " session",      cls: "var"},
  { text: " = ",           cls: "p"  },
  { text: "await ",        cls: "kw" },
  { text: "create",        cls: "fn" },
  { text: "({",            cls: "p"  },
  { text: "\n  ",          cls: "p"  },
  { text: "type",          cls: "var"},
  { text: ": ",            cls: "p"  },
  { text: "'video'",       cls: "kw" },
  { text: ",",             cls: "p"  },
  { text: "\n  ",          cls: "p"  },
  { text: "mode",          cls: "var"},
  { text: ": ",            cls: "p"  },
  { text: "'collaborative'", cls: "kw" },
  { text: "\n",            cls: "p"  },
  { text: "});",           cls: "p"  },
  { text: "\n\n",          cls: "p"  },
  { text: "// ",           cls: "p"  },
  { text: "Ready to code together!", cls: "kw" },
];

function TypingCode() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    let i = 0;
    const el = ref.current;
    el.innerHTML = "";
    const type = () => {
      if (cancelled) return;
      if (i >= TYPING_LINES.length) {
        setTimeout(() => {
          if (cancelled) return;
          el.innerHTML = "";
          i = 0;
          type();
        }, 2000);
        return;
      }
      const { text, cls } = TYPING_LINES[i];
      const span = document.createElement("span");
      span.className = `tok-${cls}`;
      span.textContent = text;
      el.appendChild(span);
      el.scrollTop = el.scrollHeight;
      i++;
      setTimeout(type, 70 + Math.random() * 50);
    };
    type();
    return () => { cancelled = true; };
  }, []);
  return <code ref={ref} className="typing-code" />;
}

/* ── Scroll Reveal Hook ── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          obs.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = "", delay = 0 }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Feature Card with mouse-follow glow ── */
function FeatureCard({ icon, title, desc, bg, glow, line }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  return (
    <div
      ref={ref}
      className="feature-card"
      style={{ "--card-glow": glow, "--card-line": line }}
      onMouseMove={onMove}
    >
      <div
        className="feature-icon-box"
        style={{ background: bg, boxShadow: `0 8px 24px ${glow}` }}
      >
        {icon}
      </div>
      <div className="feature-card-title">{title}</div>
      <div className="feature-card-desc">{desc}</div>
    </div>
  );
}

function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  /* Track scroll for navbar */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Mouse-follow glow on navbar */
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const handler = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <>
      <style>{`
        /* ── Fonts ── */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap');

        /* ── Root ── */
        .home-root {
          font-family: 'DM Sans', sans-serif;
          background: #060710;
          color: #e8eaf0;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* ── Animated grid background ── */
        .home-root::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(108,79,246,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,79,246,.05) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          animation: gridPulse 8s ease-in-out infinite;
        }
        @keyframes gridPulse {
          0%, 100% { opacity: .5; }
          50% { opacity: 1; }
        }

        /* ── Mesh gradient blobs ── */
        .blob-1, .blob-2, .blob-3, .blob-4 {
          position: fixed; border-radius: 50%;
          filter: blur(120px); pointer-events: none; z-index: 0;
        }
        .blob-1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, #6c4ff640 0%, transparent 70%);
          top: -200px; left: -150px;
          animation: blobFloat 20s ease-in-out infinite;
        }
        .blob-2 {
          width: 550px; height: 550px;
          background: radial-gradient(circle, #0ea5e925 0%, transparent 70%);
          top: 35%; right: -180px;
          animation: blobFloat 25s ease-in-out infinite reverse;
        }
        .blob-3 {
          width: 450px; height: 450px;
          background: radial-gradient(circle, #f472b618 0%, transparent 70%);
          bottom: 2%; left: 25%;
          animation: blobFloat 22s ease-in-out infinite 3s;
        }
        .blob-4 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #34d39915 0%, transparent 70%);
          top: 20%; left: 50%;
          animation: blobFloat 18s ease-in-out infinite 6s;
        }
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(.95); }
        }

        /* ── Scroll Reveal ── */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1);
        }
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ════════════════════════════════════
           MAGICAL NAVBAR
           ════════════════════════════════════ */
        .home-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all .4s cubic-bezier(.22,1,.36,1);
        }
        .home-nav::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(6, 7, 16, .6);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          z-index: -1;
          transition: all .4s;
        }
        .home-nav.scrolled::before {
          background: rgba(6, 7, 16, .88);
        }

        /* Animated rainbow gradient bottom border */
        .home-nav::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #6c4ff680 15%,
            #38bdf880 30%,
            #f472b680 50%,
            #34d39980 70%,
            #fbbf2480 85%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: navBorderFlow 4s linear infinite;
          opacity: .5;
          transition: opacity .4s;
        }
        .home-nav.scrolled::after { opacity: 1; }
        @keyframes navBorderFlow {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }

        /* Mouse-follow glow */
        .home-nav .nav-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: -1;
          background: radial-gradient(
            350px circle at var(--mx, -999px) var(--my, -999px),
            rgba(108,79,246,.1) 0%,
            transparent 60%
          );
          transition: opacity .3s;
          opacity: 0;
        }
        .home-nav:hover .nav-glow { opacity: 1; }

        .home-nav-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .logo-wrap {
          display: flex; align-items: center; gap: 0.75rem;
          text-decoration: none;
          transition: all .3s;
        }
        .logo-wrap:hover { transform: scale(1.03); }
        .logo-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6c4ff6, #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px #6c4ff650, inset 0 1px 0 rgba(255,255,255,.2);
          position: relative;
          overflow: hidden;
          animation: logoPulse 3s ease-in-out infinite;
        }
        .logo-icon::after {
          content: "";
          position: absolute;
          width: 20px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent);
          top: 0; left: -30px;
          animation: logoShimmer 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 20px #6c4ff650; }
          50% { box-shadow: 0 0 35px #6c4ff680, 0 0 60px #0ea5e930; }
        }
        @keyframes logoShimmer {
          0%, 100% { left: -30px; }
          50% { left: 50px; }
        }

        .logo-name {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 1.25rem;
          background: linear-gradient(135deg, #c4b5fd, #67e8f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: .03em;
        }
        .logo-sub {
          font-size: 0.6rem;
          color: rgba(232,234,240,.3);
          letter-spacing: .12em;
          text-transform: uppercase;
          margin-top: -2px;
        }

        /* Nav links with gradient underline */
        .nav-links {
          display: flex; align-items: center; gap: 2.5rem;
          list-style: none; margin: 0; padding: 0;
        }
        .nav-links a {
          font-size: .88rem; font-weight: 500;
          color: rgba(232,234,240,.5);
          text-decoration: none;
          position: relative;
          padding: .3rem 0;
          transition: color .3s;
        }
        .nav-links a::after {
          content: "";
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 2px;
          border-radius: 1px;
          background: linear-gradient(90deg, #6c4ff6, #38bdf8);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform .3s cubic-bezier(.22,1,.36,1);
        }
        .nav-links a:hover { color: #c4b5fd; }
        .nav-links a:hover::after { transform: scaleX(1); }
        @media (max-width: 768px) { .nav-links { display: none; } }

        /* Nav CTA button with shimmer */
        .nav-cta {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .65rem 1.5rem;
          background: linear-gradient(135deg, #6c4ff6, #0ea5e9);
          border-radius: 12px;
          font-size: .85rem;
          font-weight: 600;
          color: #fff;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all .3s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 4px 20px #6c4ff640;
        }
        .nav-cta::before {
          content: "";
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(135deg, #a78bfa, #38bdf8, #f472b6, #6c4ff6);
          background-size: 300% 300%;
          border-radius: 14px;
          z-index: -1;
          animation: btnBorderAnim 3s ease infinite;
          opacity: 0;
          transition: opacity .3s;
        }
        .nav-cta:hover::before { opacity: 1; }
        .nav-cta::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,.2) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform .5s;
        }
        .nav-cta:hover::after { transform: translateX(100%); }
        .nav-cta:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 32px #6c4ff670;
        }
        @keyframes btnBorderAnim {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ════════════════════════════════════
           HERO SECTION
           ════════════════════════════════════ */
        .hero-section {
          position: relative;
          z-index: 1;
          max-width: 1320px;
          margin: 0 auto;
          padding: 5rem 2rem 4rem;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 4rem;
          align-items: center;
          min-height: calc(100vh - 72px);
        }
        @media (max-width: 960px) {
          .hero-section { grid-template-columns: 1fr; padding: 3rem 1.5rem 2rem; min-height: auto; }
          .hero-right { display: none !important; }
        }

        /* Eyebrow */
        .eyebrow {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .4rem 1.1rem;
          border-radius: 999px;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          border: 1px solid rgba(108,79,246,.3);
          background: rgba(108,79,246,.08);
          color: #c4b5fd;
          margin-bottom: 2rem;
          backdrop-filter: blur(8px);
          animation: eyebrowGlow 3s ease-in-out infinite;
        }
        @keyframes eyebrowGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(108,79,246,0); }
          50% { box-shadow: 0 0 20px rgba(108,79,246,.15); }
        }
        .eyebrow-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 8px #a78bfa;
          animation: blink 2s ease infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: .3; }
        }

        /* Hero headline */
        .hero-h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 5.5vw, 4.5rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -.03em;
          margin: 0 0 1.5rem;
        }
        .hero-h1-gradient {
          background: linear-gradient(135deg, #c4b5fd 0%, #67e8f9 40%, #f9a8d4 80%);
          background-size: 200% auto;
          animation: textShine 4s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes textShine {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .hero-h1-plain { color: #e8eaf0; }

        .hero-desc {
          font-size: 1.08rem;
          line-height: 1.8;
          color: rgba(232,234,240,.48);
          max-width: 500px;
          margin-bottom: 2rem;
        }

        /* Feature pills */
        .feature-pills { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 2.5rem; }
        .pill {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .4rem 1rem;
          border-radius: 999px;
          font-size: .78rem;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.03);
          color: rgba(232,234,240,.6);
          backdrop-filter: blur(4px);
          transition: all .3s;
        }
        .pill:hover {
          border-color: rgba(108,79,246,.35);
          background: rgba(108,79,246,.1);
          color: #c4b5fd;
          transform: translateY(-1px);
        }
        .pill-check { color: #34d399; }

        /* CTA buttons */
        .cta-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 3rem; }
        .btn-primary-hero {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .95rem 2.4rem;
          background: linear-gradient(135deg, #6c4ff6, #0ea5e9);
          border-radius: 14px;
          font-weight: 700;
          font-size: .95rem;
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 32px #6c4ff650, inset 0 1px 0 rgba(255,255,255,.2);
          transition: all .3s cubic-bezier(.22,1,.36,1);
          position: relative;
          overflow: hidden;
        }
        .btn-primary-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,.18) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform .6s;
        }
        .btn-primary-hero:hover::before { transform: translateX(100%); }
        .btn-primary-hero:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 48px #6c4ff660, 0 0 0 1px rgba(108,79,246,.3);
        }

        .btn-outline-hero {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .95rem 2.4rem;
          background: rgba(255,255,255,.03);
          border-radius: 14px;
          font-weight: 600;
          font-size: .95rem;
          color: rgba(232,234,240,.6);
          border: 1px solid rgba(255,255,255,.1);
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: all .3s cubic-bezier(.22,1,.36,1);
        }
        .btn-outline-hero:hover {
          border-color: rgba(167,139,250,.4);
          color: #c4b5fd;
          background: rgba(108,79,246,.08);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(108,79,246,.15);
        }

        /* Stats */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          overflow: hidden;
          max-width: 440px;
          backdrop-filter: blur(8px);
          position: relative;
        }
        .stats-row::before {
          content: "";
          position: absolute; inset: -1px;
          border-radius: 17px;
          background: linear-gradient(135deg, rgba(108,79,246,.2), transparent 50%, rgba(56,189,248,.2));
          z-index: -1;
          opacity: 0;
          transition: opacity .4s;
        }
        .stats-row:hover::before { opacity: 1; }
        .stat-cell {
          padding: 1.4rem 1rem;
          text-align: center;
          position: relative;
        }
        .stat-cell + .stat-cell::before {
          content: "";
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: rgba(255,255,255,.07);
        }
        .stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 1.7rem;
          font-weight: 900;
          display: block;
          line-height: 1;
          margin-bottom: .35rem;
        }
        .stat-lbl {
          font-size: .7rem;
          color: rgba(232,234,240,.35);
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        /* ════════════════════════════════════
           HERO RIGHT SIDE — FIXED LAYOUT
           ════════════════════════════════════ */
        .hero-right {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 540px;
        }

        /* Glow ring — centered behind image */
        .hero-glow-ring {
          position: absolute;
          width: 380px; height: 380px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: conic-gradient(from 0deg, #6c4ff630, #0ea5e920, #f472b620, #34d39920, #6c4ff630);
          filter: blur(55px);
          animation: glowSpin 10s linear infinite;
          z-index: 1;
          pointer-events: none;
        }
        @keyframes glowSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Decorative dashed rings */
        .hero-ring-outline {
          position: absolute;
          width: 440px; height: 440px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px dashed rgba(108,79,246,.18);
          animation: ringRotate 30s linear infinite;
          z-index: 2;
          pointer-events: none;
        }
        .hero-ring-outline-2 {
          position: absolute;
          width: 340px; height: 340px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px dashed rgba(56,189,248,.12);
          animation: ringRotate 22s linear infinite reverse;
          z-index: 2;
          pointer-events: none;
        }
        @keyframes ringRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Main hero image */
        .hero-coder-img {
          width: 78%;
          max-width: 400px;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,.5));
          animation: heroFloat 6s ease-in-out infinite;
          position: relative;
          z-index: 5;
          pointer-events: none;
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }

        /* Orbiting dots container — centered at image center */
        .orbit-container {
          position: absolute;
          top: 50%; left: 50%;
          width: 0; height: 0;
          z-index: 4;
          pointer-events: none;
        }
        .orbit-dot {
          position: absolute;
          width: 7px; height: 7px;
          border-radius: 50%;
          top: 0; left: 0;
          transform-origin: 0 0;
          animation: orbit var(--dur) linear infinite;
          box-shadow: 0 0 14px currentColor;
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(var(--radius)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--radius)) rotate(-360deg); }
        }

        /* Code terminal — positioned just below navbar */
        .code-terminal {
          position: absolute;
          top: -80px;
          left: -20px;
          background: rgba(10,10,22,.94);
          border: 1px solid rgba(108,79,246,.2);
          border-radius: 14px;
          width: 240px;
          box-shadow: 0 20px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(108,79,246,.08);
          backdrop-filter: blur(20px);
          z-index: 10;
          overflow: hidden;
          animation: slideUpFade .7s .3s ease both;
        }
        .code-terminal-bar {
          display: flex; align-items: center; gap: 5px;
          padding: 8px 12px;
          background: rgba(255,255,255,.04);
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .terminal-dot { width: 8px; height: 8px; border-radius: 50%; }
        .code-terminal-body {
          padding: 10px 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: .64rem;
          line-height: 1.65;
          max-height: 145px;
          overflow: hidden;
          color: #cdd6f4;
          white-space: pre-wrap;
        }
        .typing-code { display: inline; }
        .tok-kw  { color: #c792ea; }
        .tok-fn  { color: #82aaff; }
        .tok-var { color: #f78c6c; }
        .tok-p   { color: #a6accd; }

        /* Floating badges */
        .float-badge {
          position: absolute;
          background: rgba(10,10,22,.9);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          padding: .55rem .85rem;
          display: flex; align-items: center; gap: .5rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 12px 36px rgba(0,0,0,.4);
          z-index: 10;
          font-size: .74rem;
          font-weight: 600;
          color: #e8eaf0;
          pointer-events: none;
        }
        .float-badge-icon {
          width: 28px; height: 28px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .badge-top-right {
          top: 20px; right: -5px;
          animation: slideUpFade .6s .5s ease both, badgeBob 4s ease-in-out infinite .6s;
        }
        .badge-bottom-right {
          bottom: 20px; right: -5px;
          animation: slideUpFade .6s .7s ease both, badgeBob 5s ease-in-out infinite .8s;
        }
        @keyframes badgeBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ════════════════════════════════════
           FEATURES SECTION
           ════════════════════════════════════ */
        .features-section {
          position: relative;
          z-index: 1;
          max-width: 1320px;
          margin: 0 auto;
          padding: 6rem 2rem 8rem;
        }
        .features-header { text-align: center; margin-bottom: 4.5rem; }
        .features-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          margin-bottom: 1rem;
          color: #e8eaf0;
        }
        .features-title span {
          font-family: 'JetBrains Mono', monospace;
          background: linear-gradient(135deg, #c4b5fd, #67e8f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .features-sub {
          color: rgba(232,234,240,.4);
          font-size: 1.05rem;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .feature-grid { grid-template-columns: 1fr; }
        }

        /* Feature card with mouse-follow glow */
        .feature-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 20px;
          padding: 2.25rem 2rem;
          position: relative;
          overflow: hidden;
          transition: all .35s cubic-bezier(.22,1,.36,1);
          cursor: default;
        }
        .feature-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            300px circle at var(--mx, 50%) var(--my, 50%),
            var(--card-glow) 0%, transparent 60%
          );
          opacity: 0;
          transition: opacity .4s;
          pointer-events: none;
        }
        .feature-card:hover {
          border-color: rgba(255,255,255,.12);
          transform: translateY(-8px);
          box-shadow: 0 28px 70px rgba(0,0,0,.3);
        }
        .feature-card:hover::before { opacity: 1; }

        .feature-icon-box {
          width: 56px; height: 56px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
          position: relative; z-index: 1;
          transition: transform .3s, box-shadow .3s;
        }
        .feature-card:hover .feature-icon-box {
          transform: scale(1.1) rotate(-3deg);
        }
        .feature-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.18rem;
          font-weight: 800;
          margin-bottom: .6rem;
          color: #e8eaf0;
          position: relative; z-index: 1;
        }
        .feature-card-desc {
          font-size: .88rem;
          line-height: 1.7;
          color: rgba(232,234,240,.42);
          position: relative; z-index: 1;
        }
        .feature-card::after {
          content: "";
          position: absolute;
          bottom: 0; left: 15%; right: 15%;
          height: 1px;
          background: var(--card-line);
          opacity: 0;
          transition: opacity .35s;
        }
        .feature-card:hover::after { opacity: 1; }

        /* ── How it Works ── */
        .how-section {
          position: relative;
          z-index: 1;
          max-width: 1320px;
          margin: 0 auto;
          padding: 4rem 2rem 8rem;
        }
        .how-header { text-align: center; margin-bottom: 4rem; }
        .how-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 800;
          color: #e8eaf0;
          margin-bottom: .8rem;
        }
        .how-sub {
          color: rgba(232,234,240,.38);
          font-size: 1rem;
          max-width: 480px;
          margin: 0 auto;
        }
        .how-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
        }
        @media (max-width: 768px) {
          .how-steps { grid-template-columns: 1fr; gap: 2rem; }
        }
        .how-step { text-align: center; }
        .how-step-num {
          font-family: 'Syne', sans-serif;
          font-size: 3.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, rgba(108,79,246,.35), rgba(56,189,248,.2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: .75rem;
        }
        .how-step-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          color: #e8eaf0;
          margin-bottom: .5rem;
        }
        .how-step-desc {
          font-size: .88rem;
          color: rgba(232,234,240,.4);
          line-height: 1.7;
          max-width: 280px;
          margin: 0 auto;
        }

        /* ── Trust strip ── */
        .trust-strip {
          position: relative; z-index: 1;
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 2rem 5rem;
          text-align: center;
        }
        .trust-label {
          font-size: .72rem;
          font-weight: 600;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: rgba(232,234,240,.22);
          margin-bottom: 1.5rem;
        }
        .trust-logos {
          display: flex; justify-content: center; align-items: center;
          gap: 3rem; flex-wrap: wrap;
        }
        .trust-logos span {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.2rem;
          color: rgba(232,234,240,.15);
          letter-spacing: .04em;
          transition: color .4s, text-shadow .4s;
        }
        .trust-logos span:hover {
          color: rgba(232,234,240,.4);
          text-shadow: 0 0 20px rgba(108,79,246,.3);
        }

        /* ── CTA Banner ── */
        .cta-banner {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto 5rem;
          padding: 4rem 3rem;
          text-align: center;
          background: linear-gradient(135deg, rgba(108,79,246,.08), rgba(14,165,233,.06));
          border: 1px solid rgba(108,79,246,.12);
          border-radius: 28px;
          overflow: hidden;
        }
        .cta-banner::before {
          content: "";
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(108,79,246,.05), transparent, rgba(56,189,248,.03), transparent);
          animation: bannerGlow 8s linear infinite;
          pointer-events: none;
        }
        @keyframes bannerGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .cta-banner-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800;
          color: #e8eaf0;
          margin-bottom: .8rem;
          position: relative;
        }
        .cta-banner-desc {
          color: rgba(232,234,240,.4);
          font-size: 1rem;
          margin-bottom: 2rem;
          position: relative;
        }

        /* ── Footer ── */
        .home-footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid rgba(255,255,255,.05);
          text-align: center;
          padding: 2.5rem 2rem;
          font-size: .78rem;
          color: rgba(232,234,240,.18);
          letter-spacing: .04em;
        }

        /* ── Utility animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp .7s ease both; }
        .fade-up-2 { animation: fadeUp .7s .2s ease both; }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #060710; }
        ::-webkit-scrollbar-thumb { background: #6c4ff640; border-radius: 3px; }
      `}</style>

      <div className="home-root">
        {/* Background blobs */}
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />
        <div className="blob-4" />

        {/* ════════════  MAGICAL NAVBAR  ════════════ */}
        <nav ref={navRef} className={`home-nav${scrolled ? " scrolled" : ""}`}>
          <div className="nav-glow" />
          <div className="home-nav-inner">
            <Link to="/" className="logo-wrap">
              <div className="logo-icon">
                <SparklesIcon size={18} color="white" />
              </div>
              <div>
                <div className="logo-name">DevNexus</div>
                <div className="logo-sub">Code Together</div>
              </div>
            </Link>

            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how">How It Works</a></li>
              <li><a href="#trust">About</a></li>
            </ul>

            <SignInButton mode="modal" afterSignInUrl="/dashboard">
              <button className="nav-cta">
                <RocketIcon size={15} />
                Get Started
                <ArrowRightIcon size={15} />
              </button>
            </SignInButton>
          </div>
        </nav>

        {/* ════════════  HERO  ════════════ */}
        <section className="hero-section">
          {/* Left content */}
          <div className="fade-up">
            <div className="eyebrow">
              <div className="eyebrow-dot" />
              Real-time Collaboration Platform
            </div>

            <h1 className="hero-h1">
              <span className="hero-h1-gradient">Code Together,</span>
              <br />
              <span className="hero-h1-plain">Learn Together</span>
            </h1>

            <p className="hero-desc">
              The ultimate platform for collaborative coding interviews and pair programming.
              Connect face-to-face, code in real-time, and ace your technical interviews.
            </p>

            <div className="feature-pills">
              {[
                "Live Video Chat",
                "Code Editor",
                "Multi-Language",
                "AI Powered",
              ].map((label) => (
                <span key={label} className="pill">
                  <CheckIcon size={12} className="pill-check" />
                  {label}
                </span>
              ))}
            </div>

            <div className="cta-row">
              <SignInButton mode="modal" afterSignInUrl="/dashboard">
                <button className="btn-primary-hero">
                  Start Coding Now
                  <ArrowRightIcon size={17} />
                </button>
              </SignInButton>
              <Link to="/problems" className="btn-outline-hero" style={{ textDecoration: "none" }}>
                <Code2Icon size={17} />
                Browse Problems
              </Link>
            </div>

            <div className="stats-row">
              {[
                { val: "10K+", lbl: "Active Users",  color: "#c4b5fd" },
                { val: "50K+", lbl: "Sessions",       color: "#67e8f9" },
                { val: "99.9%", lbl: "Uptime",        color: "#f9a8d4" },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} className="stat-cell">
                  <span className="stat-val" style={{ color }}>{val}</span>
                  <span className="stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right side: 3D Coder image + decorations ── */}
          <div className="hero-right fade-up-2">
            {/* Glow behind image */}
            <div className="hero-glow-ring" />

            {/* Dashed orbiting rings */}
            <div className="hero-ring-outline" />
            <div className="hero-ring-outline-2" />

            {/* Main 3D coder image */}
            <img
              src="/hero.png"
              alt="Developer coding"
              className="hero-coder-img"
            />

            {/* Orbiting particles — centered */}
            <div className="orbit-container">
              {[
                { color: "#a78bfa", radius: "210px", dur: "9s"  },
                { color: "#38bdf8", radius: "185px", dur: "13s" },
                { color: "#f472b6", radius: "230px", dur: "11s" },
                { color: "#34d399", radius: "170px", dur: "15s" },
              ].map(({ color, radius, dur }, i) => (
                <div
                  key={i}
                  className="orbit-dot"
                  style={{
                    color,
                    background: color,
                    "--radius": radius,
                    "--dur": dur,
                    animationDelay: `${i * -2.5}s`,
                  }}
                />
              ))}
            </div>

            {/* Code terminal — top left */}
            <div className="code-terminal">
              <div className="code-terminal-bar">
                <div className="terminal-dot" style={{ background: "#ff5f57" }} />
                <div className="terminal-dot" style={{ background: "#febc2e" }} />
                <div className="terminal-dot" style={{ background: "#28c840" }} />
                <span style={{ marginLeft: "auto", fontSize: ".63rem", color: "rgba(232,234,240,.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                  session.js
                </span>
              </div>
              <div className="code-terminal-body">
                <TypingCode />
              </div>
            </div>

            {/* Badge: Interview Ready — top right */}
            <div className="float-badge badge-top-right">
              <div className="float-badge-icon" style={{ background: "linear-gradient(135deg, #34d399, #0ea5e9)" }}>
                <ShieldCheckIcon size={14} color="white" />
              </div>
              <div>
                <div style={{ fontSize: ".72rem", fontWeight: 700 }}>Interview Ready</div>
                <div style={{ fontSize: ".6rem", color: "rgba(232,234,240,.4)" }}>Real-time feedback</div>
              </div>
            </div>

            {/* Badge: Users Online — bottom right */}
            <div className="float-badge badge-bottom-right">
              <div className="float-badge-icon" style={{ background: "linear-gradient(135deg, #6c4ff6, #a78bfa)" }}>
                <UsersIcon size={14} color="white" />
              </div>
              <div>
                <div style={{ fontSize: ".72rem", fontWeight: 700 }}>1.2K Online</div>
                <div style={{ fontSize: ".6rem", color: "rgba(232,234,240,.4)" }}>Coding right now</div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════  FEATURES  ════════════ */}
        <section id="features" className="features-section">
          <RevealSection>
            <div className="features-header">
              <h2 className="features-title">
                Everything You Need to <span>Succeed</span>
              </h2>
              <p className="features-sub">
                Powerful features designed to make your coding interviews seamless, productive, and enjoyable.
              </p>
            </div>
          </RevealSection>

          <div className="feature-grid">
            {[
              {
                icon: <VideoIcon size={24} color="#a78bfa" />,
                title: "HD Video Calls",
                desc: "Crystal clear video and audio for seamless face-to-face communication throughout your interview session.",
                bg: "linear-gradient(135deg, #6c4ff6, #a78bfa)",
                glow: "rgba(108,79,246,.18)",
                line: "linear-gradient(90deg, transparent, #a78bfa60, transparent)",
              },
              {
                icon: <Code2Icon size={24} color="#38bdf8" />,
                title: "Live Code Editor",
                desc: "Collaborate in real-time with syntax highlighting, IntelliSense, and support for 10+ programming languages.",
                bg: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                glow: "rgba(14,165,233,.15)",
                line: "linear-gradient(90deg, transparent, #38bdf860, transparent)",
              },
              {
                icon: <UsersIcon size={24} color="#f472b6" />,
                title: "Easy Collaboration",
                desc: "Share your screen, discuss solutions, whiteboard ideas, and learn from each other in real-time.",
                bg: "linear-gradient(135deg, #ec4899, #f472b6)",
                glow: "rgba(236,72,153,.15)",
                line: "linear-gradient(90deg, transparent, #f472b660, transparent)",
              },
              {
                icon: <TerminalIcon size={24} color="#34d399" />,
                title: "Code Execution",
                desc: "Run your code instantly with our built-in compiler. Support for JavaScript, Python, C++, Java, and more.",
                bg: "linear-gradient(135deg, #059669, #34d399)",
                glow: "rgba(5,150,105,.15)",
                line: "linear-gradient(90deg, transparent, #34d39960, transparent)",
              },
              {
                icon: <ZapIcon size={24} color="#fbbf24" />,
                title: "Instant Sessions",
                desc: "Create or join coding sessions in seconds. No setup, no downloads — just start coding immediately.",
                bg: "linear-gradient(135deg, #d97706, #fbbf24)",
                glow: "rgba(217,119,6,.15)",
                line: "linear-gradient(90deg, transparent, #fbbf2460, transparent)",
              },
              {
                icon: <TrendingUpIcon size={24} color="#60a5fa" />,
                title: "Track Progress",
                desc: "Review your session history, track solved problems, and monitor your growth over time.",
                bg: "linear-gradient(135deg, #2563eb, #60a5fa)",
                glow: "rgba(37,99,235,.15)",
                line: "linear-gradient(90deg, transparent, #60a5fa60, transparent)",
              },
            ].map(({ icon, title, desc, bg, glow, line }, i) => (
              <RevealSection key={title} delay={i * 80}>
                <FeatureCard icon={icon} title={title} desc={desc} bg={bg} glow={glow} line={line} />
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ════════════  HOW IT WORKS  ════════════ */}
        <section id="how" className="how-section">
          <RevealSection>
            <div className="how-header">
              <h2 className="how-title">Get Started in 3 Steps</h2>
              <p className="how-sub">From sign-up to your first session in under a minute.</p>
            </div>
          </RevealSection>

          <div className="how-steps">
            {[
              { num: "01", title: "Sign Up Free", desc: "Create your account in seconds with one click. No credit card required." },
              { num: "02", title: "Create a Session", desc: "Pick a problem, choose your language, and invite a collaborator to join." },
              { num: "03", title: "Code & Succeed", desc: "Collaborate live with video, chat, and a shared editor. Nail that interview." },
            ].map(({ num, title, desc }, i) => (
              <RevealSection key={num} delay={i * 120}>
                <div className="how-step">
                  <div className="how-step-num">{num}</div>
                  <div className="how-step-title">{title}</div>
                  <div className="how-step-desc">{desc}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ════════════  TRUST  ════════════ */}
        <RevealSection>
          <div id="trust" className="trust-strip">
            <div className="trust-label">Trusted by developers worldwide</div>
            <div className="trust-logos">
              <span>Google</span>
              <span>Meta</span>
              <span>Amazon</span>
              <span>Microsoft</span>
              <span>Netflix</span>
            </div>
          </div>
        </RevealSection>

        {/* ════════════  CTA BANNER  ════════════ */}
        <RevealSection>
          <div className="cta-banner" style={{ marginLeft: "auto", marginRight: "auto", maxWidth: 900 }}>
            <h2 className="cta-banner-title">Ready to Level Up Your Interviews?</h2>
            <p className="cta-banner-desc">
              Join thousands of developers who are already acing their technical interviews with DevNexus.
            </p>
            <SignInButton mode="modal" afterSignInUrl="/dashboard">
              <button className="btn-primary-hero" style={{ position: "relative" }}>
                <StarIcon size={17} />
                Get Started — It's Free
                <ArrowRightIcon size={17} />
              </button>
            </SignInButton>
          </div>
        </RevealSection>

        {/* ════════════  FOOTER  ════════════ */}
        <div className="home-footer">
          © {new Date().getFullYear()} DevNexus · Built for engineers, by engineers
        </div>
      </div>
    </>
  );
}

export default HomePage;
