// Beautiful PDF + Excel export for the Authority Action Center.
// Heavy libs (jsPDF, ExcelJS) are loaded dynamically so they don't bloat the
// initial dashboard bundle.

export type ActionType = "Clean Blocked Drains" | "Deploy Mobile Pumps" | "Upgrade Drainage Capacity";

export interface AuthorityAction {
  action_type: ActionType;
  zone_id: string;
  zone_name: string;
  ward_number: string;
  lat: number;
  lng: number;
  risk_level: string;
  authority: string;
  directive: string;
  urgency: "Immediate" | "High" | "Planned";
  rationale: string;
}

export interface AuthorityReportData {
  generated_at: string;
  rainfall_context: { current_mm_per_hour: number; forecast_3h_mm: number; description: string };
  actions: AuthorityAction[];
}

const ACTION_ORDER: ActionType[] = ["Clean Blocked Drains", "Deploy Mobile Pumps", "Upgrade Drainage Capacity"];

// Brand palette (RGB)
const INDIGO: [number, number, number] = [79, 70, 229];
const SLATE: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];

const URGENCY_RGB: Record<string, [number, number, number]> = {
  Immediate: [220, 38, 38],
  High: [234, 88, 12],
  Planned: [79, 70, 229],
};
// Excel ARGB hex
const URGENCY_HEX: Record<string, string> = {
  Immediate: "FFDC2626",
  High: "FFEA580C",
  Planned: "FF4F46E5",
};
const ACTION_HEX: Record<ActionType, string> = {
  "Clean Blocked Drains": "FF2563EB",
  "Deploy Mobile Pumps": "FFEA580C",
  "Upgrade Drainage Capacity": "FF7C3AED",
};

function fmtDate(iso: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

function fileStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
}

function summarize(actions: AuthorityAction[]) {
  const byType = ACTION_ORDER.map((t) => ({ type: t, count: actions.filter((a) => a.action_type === t).length }));
  const immediate = actions.filter((a) => a.urgency === "Immediate").length;
  const high = actions.filter((a) => a.urgency === "High").length;
  const planned = actions.filter((a) => a.urgency === "Planned").length;
  return { byType, immediate, high, planned };
}

/* ──────────────────────────────────────────────────────────────────────────
 * PDF
 * ──────────────────────────────────────────────────────────────────────── */
export async function downloadAuthorityPDF(data: AuthorityReportData) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // ── Header band ──
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, pageW, 78, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FlowGuard AI", margin, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Authority Action Report — Bengaluru Stormwater Preparedness (BBMP)", margin, 54);
  doc.setFontSize(9);
  doc.text(`Generated: ${fmtDate(data.generated_at)}`, pageW - margin, 34, { align: "right" });
  const rc = data.rainfall_context;
  doc.text(`Live rainfall: ${rc?.current_mm_per_hour ?? 0} mm/h · 3h forecast ${rc?.forecast_3h_mm ?? 0} mm`, pageW - margin, 50, { align: "right" });

  // ── Summary line ──
  const s = summarize(data.actions);
  let y = 104;
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  y += 18;
  doc.text(
    `${data.actions.length} total directives   |   Immediate: ${s.immediate}   High: ${s.high}   Planned: ${s.planned}`,
    margin,
    y,
  );
  y += 14;
  doc.text(
    s.byType.map((b) => `${b.type}: ${b.count}`).join("      "),
    margin,
    y,
  );

  // ── Main table ──
  const body = data.actions.map((a) => [
    a.action_type,
    `${a.zone_name}${a.ward_number && a.ward_number !== "—" ? `\nWard ${a.ward_number}` : ""}`,
    a.risk_level,
    a.urgency,
    a.authority,
    a.directive,
    `${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}`,
  ]);

  autoTable(doc, {
    startY: y + 16,
    margin: { left: margin, right: margin },
    head: [["Action Program", "Location", "Risk", "Urgency", "Responsible Authority", "Directive", "Coordinates"]],
    body,
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 6, valign: "top", lineColor: [238, 242, 247], lineWidth: 0.5, textColor: SLATE },
    headStyles: { fillColor: SLATE, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5, halign: "left" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 95, fontStyle: "bold" },
      1: { cellWidth: 95 },
      2: { cellWidth: 50 },
      3: { cellWidth: 60, fontStyle: "bold" },
      4: { cellWidth: 120 },
      5: { cellWidth: "auto" },
      6: { cellWidth: 80 },
    },
    didParseCell: (hook) => {
      if (hook.section === "body" && hook.column.index === 3) {
        const rgb = URGENCY_RGB[hook.cell.raw as string];
        if (rgb) hook.cell.styles.textColor = rgb;
      }
    },
    didDrawPage: () => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text("FlowGuard AI · AI-generated civic advisory — verify on ground before deployment", margin, h - 18);
      const page = doc.getNumberOfPages();
      doc.text(`Page ${page}`, pageW - margin, h - 18, { align: "right" });
    },
  });

  doc.save(`FlowGuard_Authority_Report_${fileStamp()}.pdf`);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Excel
 * ──────────────────────────────────────────────────────────────────────── */
export async function downloadAuthorityExcel(data: AuthorityReportData) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "FlowGuard AI";
  wb.created = new Date();

  const ws = wb.addWorksheet("Authority Actions", {
    views: [{ state: "frozen", ySplit: 6 }],
    properties: { defaultRowHeight: 18 },
  });

  const columns = [
    { key: "action_type", width: 26 },
    { key: "zone_name", width: 30 },
    { key: "ward", width: 12 },
    { key: "coords", width: 22 },
    { key: "risk", width: 12 },
    { key: "urgency", width: 14 },
    { key: "authority", width: 38 },
    { key: "directive", width: 60 },
    { key: "rationale", width: 50 },
  ];
  ws.columns = columns;
  const lastCol = columns.length;

  // ── Title row ──
  ws.mergeCells(1, 1, 1, lastCol);
  const title = ws.getCell("A1");
  title.value = "FlowGuard AI — Authority Action Report";
  title.font = { name: "Calibri", size: 18, bold: true, color: { argb: "FFFFFFFF" } };
  title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
  ws.getRow(1).height = 34;

  // ── Subtitle ──
  ws.mergeCells(2, 1, 2, lastCol);
  const sub = ws.getCell("A2");
  sub.value = "Bengaluru Stormwater Preparedness (BBMP) — AI-generated civic advisory";
  sub.font = { name: "Calibri", size: 11, color: { argb: "FFFFFFFF" } };
  sub.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sub.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6366F1" } };
  ws.getRow(2).height = 20;

  // ── Meta rows ──
  const rc = data.rainfall_context;
  const s = summarize(data.actions);
  ws.mergeCells(3, 1, 3, lastCol);
  ws.getCell("A3").value = `Generated: ${fmtDate(data.generated_at)}    |    Live rainfall: ${rc?.current_mm_per_hour ?? 0} mm/h, 3h forecast ${rc?.forecast_3h_mm ?? 0} mm (${rc?.description ?? "—"})`;
  ws.getCell("A3").font = { size: 10, color: { argb: "FF64748B" } };
  ws.mergeCells(4, 1, 4, lastCol);
  ws.getCell("A4").value = `Total directives: ${data.actions.length}    |    Immediate: ${s.immediate}    High: ${s.high}    Planned: ${s.planned}    |    ` + s.byType.map((b) => `${b.type}: ${b.count}`).join("   ");
  ws.getCell("A4").font = { size: 10, bold: true, color: { argb: "FF334155" } };
  ws.getRow(5).height = 6; // spacer

  // ── Header row ──
  const headerRowIdx = 6;
  const headers = ["Action Program", "Location", "Ward", "Coordinates", "Risk", "Urgency", "Responsible Authority", "Directive", "Rationale"];
  const headerRow = ws.getRow(headerRowIdx);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    cell.border = { bottom: { style: "thin", color: { argb: "FFCBD5E1" } } };
  });
  headerRow.height = 22;

  // ── Data rows ──
  const ordered = [...data.actions].sort(
    (a, b) => ({ Immediate: 0, High: 1, Planned: 2 }[a.urgency] - { Immediate: 0, High: 1, Planned: 2 }[b.urgency]),
  );
  ordered.forEach((a, idx) => {
    const r = ws.addRow({
      action_type: a.action_type,
      zone_name: a.zone_name,
      ward: a.ward_number,
      coords: `${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}`,
      risk: a.risk_level,
      urgency: a.urgency,
      authority: a.authority,
      directive: a.directive,
      rationale: a.rationale,
    });
    const zebra = idx % 2 === 1;
    r.eachCell((cell) => {
      cell.alignment = { vertical: "top", horizontal: "left", wrapText: true, indent: 1 };
      cell.font = { size: 10, color: { argb: "FF334155" } };
      if (zebra) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      cell.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } };
    });
    // Action program color accent
    r.getCell(1).font = { size: 10, bold: true, color: { argb: ACTION_HEX[a.action_type] } };
    // Urgency badge color
    r.getCell(6).font = { size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    r.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: URGENCY_HEX[a.urgency] || "FF64748B" } };
    r.getCell(6).alignment = { vertical: "middle", horizontal: "center" };
  });

  // ── Footer note ──
  const footIdx = ws.lastRow!.number + 2;
  ws.mergeCells(footIdx, 1, footIdx, lastCol);
  ws.getCell(footIdx, 1).value = "FlowGuard AI · AI-generated civic advisory — verify conditions on ground before field deployment.";
  ws.getCell(footIdx, 1).font = { italic: true, size: 9, color: { argb: "FF94A3B8" } };

  ws.autoFilter = { from: { row: headerRowIdx, column: 1 }, to: { row: headerRowIdx, column: lastCol } };

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `FlowGuard_Authority_Report_${fileStamp()}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
