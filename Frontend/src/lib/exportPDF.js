import jsPDF from "jspdf";

/**
 * Generate a professional PDF from session notes.
 *
 * @param {Object} options
 * @param {string} options.platformName  – e.g. "DevNexus"
 * @param {string} options.sessionName   – session title
 * @param {string} options.problemTitle  – problem being solved
 * @param {string} options.difficulty    – easy / medium / hard
 * @param {string} options.userName      – author
 * @param {string} [options.boardImage]  – smartboard canvas as data URL
 * @param {string} [options.notesHtml]   – rich-text HTML (legacy)
 * @param {string} [options.code]        – final code snapshot
 * @param {Object} [options.aiReview]    – AI review summary
 */
export function exportNotesPDF({
  platformName = "DevNexus",
  sessionName = "",
  problemTitle = "",
  difficulty = "",
  userName = "",
  boardImage = "",
  notesHtml = "",
  code = "",
  aiReview = null,
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const usable = pageW - margin * 2;
  let y = 18;

  const ensureSpace = (need = 20) => {
    if (y + need > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 18;
    }
  };

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(15, 16, 26);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 37, pageW, 1.2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(platformName, margin, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 200);
  doc.text("Collaborative Coding Platform", margin, 23);

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(dateStr, pageW - margin, 16, { align: "right" });

  y = 48;

  // ── Meta info ────────────────────────────────────────────────
  doc.setTextColor(60, 60, 80);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  const metaRows = [];
  if (sessionName) metaRows.push(["Session", sessionName]);
  if (problemTitle) metaRows.push(["Problem", problemTitle]);
  if (difficulty) metaRows.push(["Difficulty", difficulty.charAt(0).toUpperCase() + difficulty.slice(1)]);
  if (userName) metaRows.push(["Author", userName]);

  for (const [label, value] of metaRows) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 120);
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 60);
    doc.text(value, margin + 28, y);
    y += 6;
  }
  y += 4;

  // ── Divider helper ───────────────────────────────────────────
  const drawDivider = () => {
    doc.setDrawColor(210, 210, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  };

  // ── Notes / Smartboard section ─────────────────────────────
  drawDivider();
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 50);
  doc.text("Smartboard Notes", margin, y);
  y += 8;

  if (boardImage) {
    // Embed the smartboard canvas image
    try {
      const imgW = usable;
      const imgH = imgW * 0.55; // roughly 16:9-ish
      ensureSpace(imgH + 8);

      // Dark border around the board snapshot
      doc.setDrawColor(100, 100, 120);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin - 0.5, y - 0.5, imgW + 1, imgH + 1, 2, 2, "S");
      doc.addImage(boardImage, "PNG", margin, y, imgW, imgH);
      y += imgH + 8;
    } catch {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 160);
      doc.text("Board snapshot could not be embedded.", margin, y);
      y += 6;
    }
  } else {
    // Fallback: render plain text from HTML content
    const plainNotes = stripHtml(notesHtml);
    if (plainNotes.trim()) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 70);
      const lines = doc.splitTextToSize(plainNotes, usable);
      for (const line of lines) {
        ensureSpace(6);
        doc.text(line, margin, y);
        y += 5.5;
      }
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 160);
      doc.text("No notes written.", margin, y);
      y += 6;
    }
  }
  y += 6;

  // ── Code snapshot ────────────────────────────────────────────
  if (code && code.trim()) {
    ensureSpace(30);
    drawDivider();
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 50);
    doc.text("Final Code", margin, y);
    y += 8;

    // Code box background
    doc.setFontSize(8.5);
    doc.setFont("courier", "normal");
    doc.setTextColor(60, 60, 80);
    const codeLines = doc.splitTextToSize(code, usable - 8);
    const codeBlockH = Math.min(codeLines.length * 4.5 + 8, 140);

    ensureSpace(codeBlockH + 4);
    doc.setFillColor(240, 240, 248);
    doc.roundedRect(margin, y - 2, usable, codeBlockH, 2, 2, "F");

    let cy = y + 4;
    for (const line of codeLines) {
      if (cy > y - 2 + codeBlockH - 4) break; // clip if too long
      doc.text(line, margin + 4, cy);
      cy += 4.5;
    }
    y += codeBlockH + 6;
  }

  // ── AI Review summary ────────────────────────────────────────
  if (aiReview) {
    ensureSpace(30);
    drawDivider();
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 50);
    doc.text("AI Review Summary", margin, y);
    y += 8;

    doc.setFontSize(10);
    const reviewItems = [];
    if (aiReview.timeComplexity) reviewItems.push(["Time Complexity", aiReview.timeComplexity]);
    if (aiReview.spaceComplexity) reviewItems.push(["Space Complexity", aiReview.spaceComplexity]);
    if (aiReview.optimization) reviewItems.push(["Optimization", aiReview.optimization]);
    if (aiReview.explanation) reviewItems.push(["Explanation", aiReview.explanation]);

    for (const [label, value] of reviewItems) {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 110);
      doc.text(`${label}:`, margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 70);
      const wrapped = doc.splitTextToSize(value, usable - 4);
      for (const wl of wrapped) {
        ensureSpace(6);
        doc.text(wl, margin + 2, y);
        y += 5;
      }
      y += 3;
    }
  }

  // ── Footer ───────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 175);
    const pageH = doc.internal.pageSize.getHeight();
    doc.text(
      `${platformName} — Generated ${dateStr}`,
      margin,
      pageH - 8
    );
    doc.text(`Page ${p} of ${pageCount}`, pageW - margin, pageH - 8, {
      align: "right",
    });
  }

  // ── Download ─────────────────────────────────────────────────
  const filename = `${(sessionName || problemTitle || "notes").replace(/\s+/g, "_")}_notes.pdf`;
  doc.save(filename);
}

/** Strip HTML tags and decode basic entities */
function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}
