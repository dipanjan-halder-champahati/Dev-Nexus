import { useState, useEffect, useRef, useCallback } from "react";
import {
  PenToolIcon,
  EraserIcon,
  Undo2Icon,
  Redo2Icon,
  Trash2Icon,
  DownloadIcon,
  MaximizeIcon,
  MinimizeIcon,
  Loader2Icon,
} from "lucide-react";
import { sessionApi } from "../api/sessions";
import { exportNotesPDF } from "../lib/exportPDF";
import toast from "react-hot-toast";

/* ─── Config ─────────────────────────────────────────────── */
const DEBOUNCE_MS = 3000;

const CHALK_COLORS = [
  { name: "White",  hex: "#e8e8e8" },
  { name: "Yellow", hex: "#fde68a" },
  { name: "Cyan",   hex: "#67e8f9" },
  { name: "Green",  hex: "#86efac" },
  { name: "Red",    hex: "#fca5a5" },
  { name: "Orange", hex: "#fdba74" },
  { name: "Pink",   hex: "#f0abfc" },
  { name: "Blue",   hex: "#93c5fd" },
];

const STROKE_SIZES = [
  { label: "S", value: 2 },
  { label: "M", value: 4 },
  { label: "L", value: 7 },
  { label: "XL", value: 12 },
];

const BOARD_BG = "#1a1f2e";

/* ─── Component ──────────────────────────────────────────── */
function NotesPanel({
  sessionId,
  sessionName,
  problemTitle,
  difficulty,
  userName,
  code,
  aiReview,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Drawing state
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(CHALK_COLORS[0].hex);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [expanded, setExpanded] = useState(false);

  // Persistence
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Force-render counter for undo/redo button disabled state
  const [, forceRender] = useState(0);

  // Undo / Redo stacks — each entry is an array of strokes
  const strokesRef = useRef([]);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  // Drawing tracking
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef(null);
  const debounceRef = useRef(null);
  const skipSaveRef = useRef(true);

  /* ═══════════════════════════════════════════════════════════
     Canvas sizing
     ═══════════════════════════════════════════════════════════ */
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation =
        stroke.tool === "eraser" ? "destination-out" : "source-over";

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        const prev = stroke.points[i - 1];
        const cur = stroke.points[i];
        const mx = (prev.x + cur.x) / 2;
        const my = (prev.y + cur.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Replay all strokes at new size
    redrawAll();
  }, [redrawAll]);

  useEffect(() => {
    // Small delay to let the container settle
    const t = setTimeout(resizeCanvas, 50);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [resizeCanvas, expanded]);

  /* ═══════════════════════════════════════════════════════════
     Get pointer position relative to canvas
     ═══════════════════════════════════════════════════════════ */
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  /* ═══════════════════════════════════════════════════════════
     Drawing handlers
     ═══════════════════════════════════════════════════════════ */
  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
    isDrawingRef.current = true;
    currentStrokeRef.current = {
      tool,
      color: tool === "eraser" ? "#000" : color,
      width: tool === "eraser" ? strokeWidth * 4 : strokeWidth,
      points: [pos],
    };
  }, [tool, color, strokeWidth, getPos]);

  const draw = useCallback((e) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    currentStrokeRef.current.points.push(pos);

    // Live draw the current stroke segment
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pts = currentStrokeRef.current.points;
    const stroke = currentStrokeRef.current;

    if (pts.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation =
      stroke.tool === "eraser" ? "destination-out" : "source-over";

    const prev = pts[pts.length - 2];
    const cur = pts[pts.length - 1];
    const mx = (prev.x + cur.x) / 2;
    const my = (prev.y + cur.y) / 2;
    ctx.moveTo(prev.x, prev.y);
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  }, [getPos]);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    isDrawingRef.current = false;

    if (currentStrokeRef.current.points.length > 1) {
      // Push undo snapshot
      undoStackRef.current.push([...strokesRef.current]);
      redoStackRef.current = [];
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
      forceRender((n) => n + 1);
      triggerAutoSave();
    }
    currentStrokeRef.current = null;
  }, []);

  /* ═══════════════════════════════════════════════════════════
     Undo / Redo / Clear
     ═══════════════════════════════════════════════════════════ */
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    redoStackRef.current.push([...strokesRef.current]);
    strokesRef.current = undoStackRef.current.pop();
    redrawAll();
    forceRender((n) => n + 1);
    triggerAutoSave();
  }, [redrawAll]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    undoStackRef.current.push([...strokesRef.current]);
    strokesRef.current = redoStackRef.current.pop();
    redrawAll();
    forceRender((n) => n + 1);
    triggerAutoSave();
  }, [redrawAll]);

  const handleClear = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    undoStackRef.current.push([...strokesRef.current]);
    redoStackRef.current = [];
    strokesRef.current = [];
    redrawAll();
    forceRender((n) => n + 1);
    triggerAutoSave();
  }, [redrawAll]);

  /* ═══════════════════════════════════════════════════════════
     Keyboard shortcuts (Ctrl+Z / Ctrl+Y)
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo]);

  /* ═══════════════════════════════════════════════════════════
     Auto-save (strokes → JSON → backend)
     ═══════════════════════════════════════════════════════════ */
  const saveBoard = useCallback(async () => {
    if (!sessionId) return;
    setIsSaving(true);
    try {
      const data = JSON.stringify(strokesRef.current);
      await sessionApi.saveNote(sessionId, data);
      setLastSaved(new Date());
    } catch {
      // silent
    } finally {
      setIsSaving(false);
    }
  }, [sessionId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerAutoSave = useCallback(() => {
    if (skipSaveRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveBoard(), DEBOUNCE_MS);
  }, [saveBoard]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     Load saved strokes
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await sessionApi.getNote(sessionId);
        if (!cancelled && data?.note?.content) {
          try {
            const parsed = JSON.parse(data.note.content);
            if (Array.isArray(parsed)) {
              strokesRef.current = parsed;
              // Wait for canvas to be sized, then draw
              setTimeout(() => redrawAll(), 120);
            }
          } catch {
            // legacy text notes — ignore
          }
        }
      } catch {
        // no notes yet
      } finally {
        if (!cancelled) {
          setLoaded(true);
          setTimeout(() => { skipSaveRef.current = false; }, 800);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, redrawAll]);

  /* ═══════════════════════════════════════════════════════════
     Export PDF — capture canvas as image
     ═══════════════════════════════════════════════════════════ */
  const handleExportPDF = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export canvas with board background baked in
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = w * 2;
    exportCanvas.height = h * 2;
    const ectx = exportCanvas.getContext("2d");
    ectx.scale(2, 2);
    ectx.fillStyle = BOARD_BG;
    ectx.fillRect(0, 0, w, h);
    ectx.drawImage(canvas, 0, 0, w, h);

    const imgData = exportCanvas.toDataURL("image/png");

    exportNotesPDF({
      platformName: "DevNexus",
      sessionName,
      problemTitle,
      difficulty,
      userName,
      boardImage: imgData,
      code,
      aiReview,
    });
    toast.success("PDF downloaded!");
  }, [sessionName, problemTitle, difficulty, userName, code, aiReview]);

  /* ═══════════════════════════════════════════════════════════
     Status labels
     ═══════════════════════════════════════════════════════════ */
  const saveStatusLabel = isSaving
    ? "Saving..."
    : lastSaved
      ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : loaded
        ? "Ready"
        : "Loading...";

  /* ═══════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        /* ── Board shell ── */
        .board-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #0d0e14;
          font-family: 'Plus Jakarta Sans', sans-serif;
          user-select: none;
        }
        .board-panel.expanded {
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        /* ── Toolbar ── */
        .board-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #0d0e14;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .board-toolbar-section {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .board-toolbar-divider {
          width: 1px;
          height: 22px;
          background: rgba(255,255,255,0.08);
          margin: 0 4px;
        }
        .board-tool-btn {
          width: 30px; height: 30px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: #94a3b8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .board-tool-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
        }
        .board-tool-btn.active {
          background: rgba(99,102,241,0.18);
          border-color: rgba(99,102,241,0.35);
          color: #a5b4fc;
        }
        .board-tool-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* ── Color swatches ── */
        .board-swatch {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .board-swatch:hover { transform: scale(1.2); }
        .board-swatch.active {
          border-color: rgba(255,255,255,0.7);
          box-shadow: 0 0 8px rgba(255,255,255,0.2);
          transform: scale(1.2);
        }

        /* ── Stroke size buttons ── */
        .board-size-btn {
          min-width: 26px; height: 26px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .board-size-btn:hover { color: #e2e8f0; }
        .board-size-btn.active {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }

        /* ── Canvas area ── */
        .board-canvas-wrap {
          flex: 1;
          overflow: hidden;
          position: relative;
          background: ${BOARD_BG};
        }
        .board-canvas-wrap.pen-mode   { cursor: crosshair; }
        .board-canvas-wrap.erase-mode { cursor: cell; }
        .board-canvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          touch-action: none;
        }

        /* Subtle grid */
        .board-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        /* Dashed centre-lines */
        .board-grid::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
          background-size: 50% 50%;
          background-position: center center;
          pointer-events: none;
        }

        /* ── Footer ── */
        .board-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 12px;
          background: #0d0e14;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .board-save-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
        }
        .save-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }
        .save-dot.saving { background: #f59e0b; animation: dotPulse 1s ease infinite; }
        .save-dot.saved  { background: #22c55e; }
        .save-dot.ready  { background: #6366f1; }
        @keyframes dotPulse { 0%,100% { opacity:1; } 50% { opacity:.35; } }

        .board-export-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99,102,241,0.25);
          transition: all 0.2s;
        }
        .board-export-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
        }

        .board-stroke-label {
          font-size: 10px;
          color: #334155;
          font-weight: 600;
          margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className={`board-panel${expanded ? " expanded" : ""}`}>
        {/* ── Toolbar ── */}
        <div className="board-toolbar">
          {/* Pen / Eraser */}
          <div className="board-toolbar-section">
            <button
              className={`board-tool-btn ${tool === "pen" ? "active" : ""}`}
              title="Pen"
              onClick={() => setTool("pen")}
            >
              <PenToolIcon size={14} />
            </button>
            <button
              className={`board-tool-btn ${tool === "eraser" ? "active" : ""}`}
              title="Eraser"
              onClick={() => setTool("eraser")}
            >
              <EraserIcon size={14} />
            </button>
          </div>

          <div className="board-toolbar-divider" />

          {/* Color palette */}
          <div className="board-toolbar-section">
            {CHALK_COLORS.map((c) => (
              <div
                key={c.hex}
                className={`board-swatch ${color === c.hex ? "active" : ""}`}
                style={{ background: c.hex }}
                title={c.name}
                onClick={() => { setColor(c.hex); setTool("pen"); }}
              />
            ))}
          </div>

          <div className="board-toolbar-divider" />

          {/* Stroke sizes */}
          <div className="board-toolbar-section">
            {STROKE_SIZES.map((s) => (
              <button
                key={s.label}
                className={`board-size-btn ${strokeWidth === s.value ? "active" : ""}`}
                title={`${s.label} stroke`}
                onClick={() => setStrokeWidth(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="board-toolbar-divider" />

          {/* Undo / Redo / Clear */}
          <div className="board-toolbar-section">
            <button className="board-tool-btn" title="Undo" onClick={handleUndo}>
              <Undo2Icon size={14} />
            </button>
            <button className="board-tool-btn" title="Redo" onClick={handleRedo}>
              <Redo2Icon size={14} />
            </button>
            <button className="board-tool-btn" title="Clear board" onClick={handleClear}>
              <Trash2Icon size={14} />
            </button>
          </div>

          <div style={{ flex: 1 }} />

          {/* Fullscreen toggle */}
          <button
            className="board-tool-btn"
            title={expanded ? "Minimize" : "Fullscreen"}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <MinimizeIcon size={14} /> : <MaximizeIcon size={14} />}
          </button>
        </div>

        {/* ── Canvas ── */}
        <div
          ref={containerRef}
          className={`board-canvas-wrap ${tool === "eraser" ? "erase-mode" : "pen-mode"}`}
        >
          <div className="board-grid" />
          <canvas
            ref={canvasRef}
            className="board-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* ── Footer ── */}
        <div className="board-footer">
          <div className="board-save-status">
            <span className={`save-dot ${isSaving ? "saving" : lastSaved ? "saved" : "ready"}`} />
            {isSaving && (
              <Loader2Icon size={10} style={{ animation: "spin 1s linear infinite" }} />
            )}
            <span>{saveStatusLabel}</span>
            <span className="board-stroke-label">
              {strokesRef.current.length} stroke{strokesRef.current.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button className="board-export-btn" onClick={handleExportPDF}>
            <DownloadIcon size={12} />
            Export PDF
          </button>
        </div>
      </div>
    </>
  );
}

export default NotesPanel;
