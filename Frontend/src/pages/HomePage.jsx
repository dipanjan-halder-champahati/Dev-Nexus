import { Link } from "react-router";
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
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";

function HomePage() {
  return (
    <>
      <style>{`
        /* ── Fonts ── */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');

        .home-root {
          font-family: 'DM Sans', sans-serif;
          background: #08090d;
          color: #e8eaf0;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Noise texture overlay ── */
        .home-root::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: .6;
        }

        /* ── Mesh gradient blobs ── */
        .blob-1, .blob-2, .blob-3 {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .blob-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #6c4ff650 0%, transparent 70%);
          top: -180px; left: -120px;
        }
        .blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #0ea5e930 0%, transparent 70%);
          top: 40%; right: -160px;
        }
        .blob-3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #f472b620 0%, transparent 70%);
          bottom: 5%; left: 30%;
        }

        /* ── Navbar ── */
        .home-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(255,255,255,.06);
          background: rgba(8, 9, 13, .75);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .home-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .logo-wrap {
          display: flex; align-items: center; gap: 0.75rem;
          text-decoration: none;
          transition: opacity .2s;
        }
        .logo-wrap:hover { opacity: .85; }
        .logo-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6c4ff6, #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px #6c4ff640;
        }
        .logo-name {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 1.15rem;
          background: linear-gradient(135deg, #a78bfa, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: .04em;
        }
        .logo-sub {
          font-size: 0.65rem;
          color: rgba(232,234,240,.35);
          letter-spacing: .1em;
          text-transform: uppercase;
          margin-top: -2px;
        }

        /* Nav CTA */
        .nav-cta {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .55rem 1.25rem;
          background: linear-gradient(135deg, #6c4ff6, #0ea5e9);
          border-radius: 10px;
          font-size: .85rem;
          font-weight: 600;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: opacity .2s, transform .2s, box-shadow .2s;
          box-shadow: 0 4px 18px #6c4ff640;
          position: relative;
          z-index: 1;
        }
        .nav-cta:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 8px 24px #6c4ff650; }

        /* ── Hero ── */
        .hero-section {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 7rem 1.5rem 5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        @media (max-width: 900px) {
          .hero-section { grid-template-columns: 1fr; padding: 4rem 1.5rem 3rem; }
          .hero-image-wrap { display: none; }
        }

        /* Eyebrow badge */
        .eyebrow {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .3rem .9rem;
          border-radius: 999px;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          border: 1px solid rgba(108,79,246,.4);
          background: rgba(108,79,246,.12);
          color: #a78bfa;
          margin-bottom: 1.75rem;
        }
        .eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 6px #a78bfa;
          animation: blink 2s ease infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: .3; }
        }

        /* Hero headline */
        .hero-h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -.02em;
          margin: 0 0 1.5rem;
        }
        .hero-h1-gradient {
          background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 60%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-h1-plain { color: #e8eaf0; }

        /* Hero description */
        .hero-desc {
          font-size: 1.05rem;
          line-height: 1.75;
          color: rgba(232,234,240,.55);
          max-width: 480px;
          margin-bottom: 2rem;
        }

        /* Feature pills */
        .feature-pills { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 2.25rem; }
        .pill {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .35rem .9rem;
          border-radius: 999px;
          font-size: .78rem;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
          color: rgba(232,234,240,.7);
        }
        .pill-check { color: #34d399; }

        /* CTA buttons */
        .cta-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 3rem; }
        .btn-primary-hero {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .85rem 2rem;
          background: linear-gradient(135deg, #6c4ff6, #0ea5e9);
          border-radius: 12px;
          font-weight: 700;
          font-size: .95rem;
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 24px #6c4ff650;
          transition: transform .2s, box-shadow .2s, opacity .2s;
        }
        .btn-primary-hero:hover { transform: translateY(-2px); box-shadow: 0 12px 32px #6c4ff660; opacity: .95; }
        .btn-outline-hero {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .85rem 2rem;
          background: transparent;
          border-radius: 12px;
          font-weight: 600;
          font-size: .95rem;
          color: rgba(232,234,240,.7);
          border: 1px solid rgba(255,255,255,.12);
          cursor: pointer;
          transition: border-color .2s, color .2s, background .2s;
        }
        .btn-outline-hero:hover {
          border-color: rgba(167,139,250,.4);
          color: #a78bfa;
          background: rgba(108,79,246,.06);
        }

        /* Stats row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          overflow: hidden;
          max-width: 440px;
        }
        .stat-cell {
          padding: 1.25rem 1rem;
          text-align: center;
          position: relative;
        }
        .stat-cell + .stat-cell::before {
          content: "";
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: rgba(255,255,255,.08);
        }
        .stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 900;
          display: block;
          line-height: 1;
          margin-bottom: .3rem;
        }
        .stat-lbl { font-size: .72rem; color: rgba(232,234,240,.4); font-weight: 500; letter-spacing: .06em; }

        /* Hero image */
        .hero-image-wrap {
          position: relative;
        }
        .hero-image-glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(ellipse at center, #6c4ff625 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-img {
          width: 100%;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 40px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(108,79,246,.2);
          transition: transform .5s ease;
        }
        .hero-img:hover { transform: scale(1.02) rotate(.5deg); }

        /* Floating badge on image */
        .img-badge {
          position: absolute;
          bottom: -16px;
          left: -20px;
          background: linear-gradient(135deg, #1e1f2e, #252638);
          border: 1px solid rgba(108,79,246,.3);
          border-radius: 14px;
          padding: .8rem 1.2rem;
          display: flex; align-items: center; gap: .75rem;
          box-shadow: 0 16px 40px rgba(0,0,0,.4);
          backdrop-filter: blur(20px);
        }
        .img-badge-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #34d399, #0ea5e9);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .img-badge-title { font-size: .8rem; font-weight: 700; color: #e8eaf0; }
        .img-badge-sub { font-size: .68rem; color: rgba(232,234,240,.45); }

        /* ── Features section ── */
        .features-section {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 5rem 1.5rem 7rem;
        }
        .features-header { text-align: center; margin-bottom: 4rem; }
        .features-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          margin-bottom: 1rem;
          color: #e8eaf0;
        }
        .features-title span {
          font-family: 'JetBrains Mono', monospace;
          background: linear-gradient(135deg, #a78bfa, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .features-sub { color: rgba(232,234,240,.45); font-size: 1rem; max-width: 520px; margin: 0 auto; }

        /* Feature grid */
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 768px) {
          .feature-grid { grid-template-columns: 1fr; }
        }

        /* Feature card */
        .feature-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px;
          padding: 2rem 1.75rem;
          position: relative;
          overflow: hidden;
          transition: border-color .25s, transform .25s, box-shadow .25s;
        }
        .feature-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, var(--card-glow) 0%, transparent 60%);
          opacity: 0;
          transition: opacity .3s;
          pointer-events: none;
        }
        .feature-card:hover {
          border-color: rgba(255,255,255,.14);
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0,0,0,.3);
        }
        .feature-card:hover::before { opacity: 1; }

        .feature-icon-box {
          width: 54px; height: 54px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }
        .feature-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: .6rem;
          color: #e8eaf0;
          position: relative; z-index: 1;
        }
        .feature-card-desc {
          font-size: .88rem;
          line-height: 1.65;
          color: rgba(232,234,240,.45);
          position: relative; z-index: 1;
        }

        /* Subtle bottom border glow on cards */
        .feature-card::after {
          content: "";
          position: absolute;
          bottom: 0; left: 15%; right: 15%;
          height: 1px;
          background: var(--card-line);
          opacity: 0;
          transition: opacity .3s;
        }
        .feature-card:hover::after { opacity: 1; }

        /* ── Footer strip ── */
        .home-footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid rgba(255,255,255,.06);
          text-align: center;
          padding: 1.75rem;
          font-size: .78rem;
          color: rgba(232,234,240,.2);
          letter-spacing: .04em;
        }

        /* Fade up animation */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp .55s ease both; }
        .fade-up-2 { animation: fadeUp .55s .1s ease both; }
        .fade-up-3 { animation: fadeUp .55s .2s ease both; }
        .fade-up-4 { animation: fadeUp .55s .3s ease both; }
        .fade-up-5 { animation: fadeUp .55s .4s ease both; }
      `}</style>

      <div className="home-root">
        {/* Background blobs */}
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />

        {/* ── Navbar ── */}
        <nav className="home-nav">
          <div className="home-nav-inner">
            <Link to="/" className="logo-wrap">
              <div className="logo-icon">
                <SparklesIcon size={18} color="white" />
              </div>
              <div>
                <div className="logo-name">Talent IQ</div>
                <div className="logo-sub">Code Together</div>
              </div>
            </Link>

            <SignInButton mode="modal">
              <button className="nav-cta">
                Get Started
                <ArrowRightIcon size={15} />
              </button>
            </SignInButton>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero-section">
          {/* Left content */}
          <div className="fade-up">
            <div className="eyebrow">
              <div className="eyebrow-dot" />
              Real-time Collaboration
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

            {/* Feature pills */}
            <div className="feature-pills">
              {["Live Video Chat", "Code Editor", "Multi-Language"].map((f) => (
                <span key={f} className="pill">
                  <CheckIcon size={13} className="pill-check" />
                  {f}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="cta-row">
              <SignInButton mode="modal">
                <button className="btn-primary-hero">
                  Start Coding Now
                  <ArrowRightIcon size={17} />
                </button>
              </SignInButton>
              <button className="btn-outline-hero">
                <VideoIcon size={17} />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="stats-row">
              {[
                { val: "10K+", lbl: "Active Users",  color: "#a78bfa" },
                { val: "50K+", lbl: "Sessions",       color: "#38bdf8" },
                { val: "99.9%", lbl: "Uptime",        color: "#f472b6" },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} className="stat-cell">
                  <span className="stat-val" style={{ color }}>{val}</span>
                  <span className="stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="hero-image-wrap fade-up-2">
            <div className="hero-image-glow" />
            <img src="/hero.png" alt="Talent IQ Platform" className="hero-img" />
            {/* Floating success badge */}
            <div className="img-badge">
              <div className="img-badge-icon">
                <ShieldCheckIcon size={18} color="white" />
              </div>
              <div>
                <div className="img-badge-title">Interview Ready</div>
                <div className="img-badge-sub">Real-time feedback</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="features-section">
          <div className="features-header fade-up-3">
            <h2 className="features-title">
              Everything You Need to <span>Succeed</span>
            </h2>
            <p className="features-sub">
              Powerful features designed to make your coding interviews seamless and productive
            </p>
          </div>

          <div className="feature-grid fade-up-4">
            {[
              {
                icon: <VideoIcon size={24} color="#a78bfa" />,
                title: "HD Video Call",
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
            ].map(({ icon, title, desc, bg, glow, line }) => (
              <div
                key={title}
                className="feature-card"
                style={{ "--card-glow": glow, "--card-line": line }}
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
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="home-footer fade-up-5">
          © {new Date().getFullYear()} Talent IQ · Built for engineers, by engineers
        </div>
      </div>
    </>
  );
}

export default HomePage;