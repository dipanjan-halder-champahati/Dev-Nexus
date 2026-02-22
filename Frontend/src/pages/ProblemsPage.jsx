import { Link } from "react-router";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { PROBLEMS } from "../data/problems";
import { ChevronRightIcon, Code2Icon, FilterIcon, SearchIcon, ZapIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

const DIFFICULTY_FILTERS = ["All", "Easy", "Medium", "Hard"];

const difficultyMeta = {
  Easy:   { color: "oklch(var(--su))",  bg: "oklch(var(--su) / .1)",  border: "oklch(var(--su) / .3)"  },
  Medium: { color: "oklch(var(--wa))",  bg: "oklch(var(--wa) / .1)",  border: "oklch(var(--wa) / .3)"  },
  Hard:   { color: "oklch(var(--er))",  bg: "oklch(var(--er) / .1)",  border: "oklch(var(--er) / .3)"  },
};

function ProblemsPage() {
  const problems = Object.values(PROBLEMS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const easyCount   = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount   = problems.filter((p) => p.difficulty === "Hard").length;

  const filtered = problems.filter((p) => {
    const matchesDiff   = activeFilter === "All" || p.difficulty === activeFilter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.category?.toLowerCase().includes(search.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  return (
    <>
      <style>{`
        /* ── Page atmosphere ── */
        .problems-bg {
          min-height: 100vh;
          background-color: oklch(var(--b1));
          position: relative;
        }
        .problems-bg::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 45% at 15% -5%,  oklch(var(--p) / .12) 0%, transparent 55%),
            radial-gradient(ellipse 55% 35% at 85% 105%, oklch(var(--s) / .09) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        .problems-bg::after {
          content: "";
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, oklch(var(--bc) / .05) 1px, transparent 1px);
          background-size: 26px 26px;
          pointer-events: none;
          z-index: 0;
        }
        .problems-content { position: relative; z-index: 1; }

        /* ── Hero header ── */
        .hero-header {
          background: linear-gradient(
            135deg,
            oklch(var(--b2)) 0%,
            oklch(var(--b1)) 100%
          );
          border-bottom: 1px solid oklch(var(--bc) / .08);
          padding: 3.5rem 0 3rem;
        }
        .hero-number {
          font-size: 7rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, oklch(var(--p)) 0%, oklch(var(--s)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: .12;
          position: absolute;
          right: 0;
          top: -1rem;
          font-variant-numeric: tabular-nums;
          pointer-events: none;
          user-select: none;
        }

        /* ── Search bar ── */
        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-wrap svg {
          position: absolute;
          left: 1rem;
          color: oklch(var(--bc) / .4);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: .65rem 1rem .65rem 2.75rem;
          background: oklch(var(--b2));
          border: 1px solid oklch(var(--bc) / .12);
          border-radius: 0.85rem;
          font-size: 0.9rem;
          color: oklch(var(--bc));
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .search-input::placeholder { color: oklch(var(--bc) / .35); }
        .search-input:focus {
          border-color: oklch(var(--p) / .5);
          box-shadow: 0 0 0 3px oklch(var(--p) / .12);
        }

        /* ── Filter chips ── */
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid oklch(var(--bc) / .15);
          background: transparent;
          color: oklch(var(--bc) / .6);
          transition: all .18s ease;
        }
        .filter-chip:hover {
          border-color: oklch(var(--p) / .4);
          color: oklch(var(--p));
          background: oklch(var(--p) / .06);
        }
        .filter-chip.active {
          background: oklch(var(--p));
          border-color: oklch(var(--p));
          color: white;
          box-shadow: 0 4px 14px oklch(var(--p) / .35);
        }
        .filter-chip.easy.active   { background: oklch(var(--su)); border-color: oklch(var(--su)); box-shadow: 0 4px 14px oklch(var(--su) / .3); }
        .filter-chip.medium.active { background: oklch(var(--wa)); border-color: oklch(var(--wa)); box-shadow: 0 4px 14px oklch(var(--wa) / .3); }
        .filter-chip.hard.active   { background: oklch(var(--er)); border-color: oklch(var(--er)); box-shadow: 0 4px 14px oklch(var(--er) / .3); }

        /* ── Problem card ── */
        .problem-card {
          background: oklch(var(--b1));
          border: 1px solid oklch(var(--bc) / .09);
          border-radius: 1.1rem;
          padding: 1.4rem 1.6rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          text-decoration: none;
          color: inherit;
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
          position: relative;
          overflow: hidden;
        }
        .problem-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, oklch(var(--p) / .04) 0%, transparent 60%);
          opacity: 0;
          transition: opacity .22s ease;
          pointer-events: none;
        }
        .problem-card:hover {
          transform: translateY(-2px) scale(1.005);
          box-shadow: 0 10px 30px oklch(var(--bc) / .1), 0 0 0 1px oklch(var(--p) / .2);
          border-color: oklch(var(--p) / .25);
        }
        .problem-card:hover::before { opacity: 1; }

        /* Icon box */
        .problem-icon-box {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          border-radius: 0.9rem;
          background: oklch(var(--p) / .1);
          border: 1px solid oklch(var(--p) / .18);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .22s, border-color .22s;
        }
        .problem-card:hover .problem-icon-box {
          background: oklch(var(--p) / .18);
          border-color: oklch(var(--p) / .4);
        }

        /* Difficulty badge inline */
        .diff-pill {
          display: inline-flex;
          align-items: center;
          padding: .2rem .7rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: .04em;
          border: 1px solid;
        }

        /* Solve arrow */
        .solve-arrow {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: oklch(var(--b2));
          border: 1px solid oklch(var(--bc) / .12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: oklch(var(--bc) / .4);
          transition: background .2s, color .2s, transform .2s, box-shadow .2s;
        }
        .problem-card:hover .solve-arrow {
          background: oklch(var(--p));
          border-color: oklch(var(--p));
          color: white;
          transform: translateX(2px);
          box-shadow: 0 4px 12px oklch(var(--p) / .35);
        }

        /* Row number */
        .row-num {
          font-size: 0.75rem;
          font-weight: 700;
          color: oklch(var(--bc) / .22);
          min-width: 2rem;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        /* ── Stats footer ── */
        .stats-footer {
          background: oklch(var(--b2));
          border: 1px solid oklch(var(--bc) / .1);
          border-radius: 1.25rem;
          padding: 1.75rem 2rem;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-top: 3rem;
        }
        @media (max-width: 640px) {
          .stats-footer { grid-template-columns: repeat(2, 1fr); }
        }
        .stat-item {
          text-align: center;
          padding: 1rem 0.5rem;
          position: relative;
        }
        .stat-item + .stat-item::before {
          content: "";
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: oklch(var(--bc) / .1);
        }
        .stat-value {
          font-size: 2.4rem;
          font-weight: 900;
          line-height: 1;
          margin-bottom: .35rem;
        }
        .stat-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: oklch(var(--bc) / .45);
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 5rem 1rem;
          color: oklch(var(--bc) / .4);
        }
        .empty-state svg {
          margin: 0 auto 1.25rem;
          opacity: .3;
        }

        /* Fade-in list */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .problem-card { animation: cardIn .3s ease both; }

        /* Glow divider */
        .glow-line {
          height: 1px;
          border: none;
          background: linear-gradient(90deg, transparent, oklch(var(--p) / .35) 40%, oklch(var(--s) / .35) 60%, transparent);
          margin: 2rem 0;
        }
      `}</style>

      <div className="problems-bg">
        <div className="problems-content">
          <Navbar />

          {/* ── Hero header ── */}
          <div className="hero-header">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 relative">
                {/* Left: title */}
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                    <ZapIcon size={12} />
                    Practice Arena
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3">
                    Practice
                    <br />
                    <span
                      style={{
                        background: "linear-gradient(135deg, oklch(var(--p)), oklch(var(--s)))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Problems
                    </span>
                  </h1>
                  <p className="text-base-content/55 text-base max-w-md leading-relaxed">
                    Sharpen your skills with curated coding challenges. Solve, collaborate, and ace your next technical interview.
                  </p>
                </div>

                {/* Decorative number */}
                <div className="relative">
                  <span className="hero-number">{problems.length}</span>
                </div>

                {/* Right: search + filters */}
                <div className="flex flex-col gap-3 min-w-[280px] lg:min-w-[340px]">
                  <div className="search-wrap">
                    <SearchIcon size={16} />
                    <input
                      className="search-input"
                      placeholder="Search problems..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`filter-chip ${f.toLowerCase()} ${activeFilter === f ? "active" : ""}`}
                      >
                        {f !== "All" && (
                          <span
                            style={{
                              width: 6, height: 6,
                              borderRadius: "50%",
                              background: activeFilter === f ? "currentColor" : (difficultyMeta[f]?.color ?? "transparent"),
                              display: "inline-block",
                            }}
                          />
                        )}
                        {f}
                        {f === "Easy"   && <span className="opacity-60 text-xs">({easyCount})</span>}
                        {f === "Medium" && <span className="opacity-60 text-xs">({mediumCount})</span>}
                        {f === "Hard"   && <span className="opacity-60 text-xs">({hardCount})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Problem list ── */}
          <div className="max-w-6xl mx-auto px-6 py-10">

            {/* Result count */}
            <div className="flex items-center gap-2 mb-5">
              <FilterIcon size={14} className="text-base-content/40" />
              <span className="text-sm text-base-content/45 font-medium">
                Showing <strong className="text-base-content/70">{filtered.length}</strong> problem{filtered.length !== 1 ? "s" : ""}
                {activeFilter !== "All" && ` · ${activeFilter}`}
                {search && ` · "${search}"`}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <Code2Icon size={48} />
                <p className="text-lg font-semibold mb-1">No problems found</p>
                <p className="text-sm">Try adjusting your search or filter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((problem, idx) => {
                  const meta = difficultyMeta[problem.difficulty] ?? {};
                  return (
                    <Link
                      key={problem.id}
                      to={`/problem/${problem.id}`}
                      className="problem-card"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      {/* Row number */}
                      <span className="row-num">{String(idx + 1).padStart(2, "0")}</span>

                      {/* Icon */}
                      <div className="problem-icon-box">
                        <Code2Icon size={22} style={{ color: "oklch(var(--p))" }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-base text-base-content truncate">
                            {problem.title}
                          </span>
                          <span
                            className="diff-pill"
                            style={{
                              color: meta.color,
                              background: meta.bg,
                              borderColor: meta.border,
                            }}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/45 font-medium uppercase tracking-wide mb-1">
                          {problem.category}
                        </p>
                        <p className="text-sm text-base-content/60 line-clamp-1">
                          {problem.description?.text}
                        </p>
                      </div>

                      {/* Solve CTA */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold text-base-content/40 hidden sm:block">
                          Solve
                        </span>
                        <div className="solve-arrow">
                          <ChevronRightIcon size={16} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ── Stats footer ── */}
            <div className="stats-footer">
              <div className="stat-item">
                <div
                  className="stat-value"
                  style={{
                    background: "linear-gradient(135deg, oklch(var(--p)), oklch(var(--s)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {problems.length}
                </div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: "oklch(var(--su))" }}>
                  {easyCount}
                </div>
                <div className="stat-label">Easy</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: "oklch(var(--wa))" }}>
                  {mediumCount}
                </div>
                <div className="stat-label">Medium</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: "oklch(var(--er))" }}>
                  {hardCount}
                </div>
                <div className="stat-label">Hard</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProblemsPage;