// ─── A5 Shipping Label PDF Generation ──────────────────────────────
// Generates a print-ready A5 shipping label with:
//   - Business header (logo, name, address, phone, date, courier)
//   - Code 128 barcode from waybill ID
//   - Receiver (customer) information
//   - COD value prominently highlighted
//   - Handling instruction icons
//
// Supports both single-label and combined multi-label PDF generation.
//
// Uses jsPDF for PDF generation + jsbarcode/svg2pdf for barcode.
//
// VISUAL SYSTEM
// A single THEME object below acts as the "global stylesheet" for the
// label — every color, weight and spacing decision on the page reads
// from it. Change a value there and it propagates everywhere. Palette
// is intentionally restricted to black / white / one accent blue.

import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import "svg2pdf.js";
import { formatCurrency, formatPhoneNumber, formatDate } from "@/lib/formatters";
import type {
  ShippingLabelData,
  LabelGenerationResult,
  CombinedLabelGenerationResult,
  HandlingInstruction,
} from "./types";
import { HANDLING_INSTRUCTION_LABELS } from "./types";

// ─── Constants ─────────────────────────────────────────────────────
// A5 portrait dimensions in mm
const PAGE_WIDTH = 148;
const PAGE_HEIGHT = 210;
const MARGIN = 9; // safe print margin (8-10mm)

// Content area
const CONTENT_X = MARGIN;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ─── Global theme ("global CSS" for the label) ─────────────────────
type RGB = [number, number, number];

const THEME = {
  color: {
    ink: [17, 17, 17] as RGB, // near-black, used for primary text
    paper: [255, 255, 255] as RGB,
    accent: [17, 17, 17] as RGB, // was brand blue — now black, per black & white only
    accentSoft: [240, 240, 240] as RGB, // pale neutral fill
    muted: [120, 120, 120] as RGB, // secondary text
    subtle: [165, 168, 173] as RGB, // tertiary / footer text
    line: [223, 225, 229] as RGB, // hairline dividers
    panel: [247, 248, 250] as RGB, // light neutral fill
  },
  // Modular type scale — every text element on the label pulls its
  // size from here so the hierarchy stays consistent and intentional.
  type: {
    micro: 7, // footer / order number
    label: 7.5, // small caps section labels (WAYBILL ID, DELIVER TO...)
    small: 8, // secondary metadata (sender phone, date, chips)
    body: 9, // chip text, running copy
    base: 10, // receiver address
    emphasis: 11, // note callout
    subheading: 14, // waybill ID, receiver name
    phone: 14, // receiver contact number — deliberately prominent
    heading: 16, // business name
    value: 20, // COD amount
  },
  // Spacing scale (mm) — vertical rhythm reads from here so gaps between
  // blocks stay deliberate instead of one-off magic numbers.
  space: {
    xs: 2, // tight — inside a text block (label to its value)
    sm: 3.5, // between related lines (e.g. date to order number)
    md: 5, // before/after a divider
    lg: 7, // between major sections
  },
  radius: 2,
  topBarHeight: 3,
} as const;

// ─── Color helpers (keep every draw call reading from THEME) ──────
function ink(doc: jsPDF, c: RGB) {
  doc.setTextColor(c[0], c[1], c[2]);
}
function fillColor(doc: jsPDF, c: RGB) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function strokeColor(doc: jsPDF, c: RGB) {
  doc.setDrawColor(c[0], c[1], c[2]);
}

// ─── Helper: Create a temporary SVG element for barcode ───────────
function createBarcodeSvg(value: string): SVGSVGElement {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");

  JsBarcode(svg as unknown as HTMLElement, value, {
    format: "CODE128",
    width: 1.2,
    height: 40,
    displayValue: false,
    margin: 5,
    background: "#ffffff",
    lineColor: "#000000",
  });

  return svg;
}

// ─── Helper: Draw wrapped text ────────────────────────────────────
function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  options?: { fontSize?: number; fontStyle?: "normal" | "bold" | "italic" },
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.setFont("helvetica", options?.fontStyle || "normal");
  if (options?.fontSize) doc.setFontSize(options.fontSize);

  for (const line of lines) {
    doc.text(String(line), x, y);
    y += lineHeight;
  }
  return y;
}

// ─── Helper: Draw a thin hairline divider ─────────────────────────
function drawDivider(doc: jsPDF, y: number): number {
  strokeColor(doc, THEME.color.line);
  doc.setLineWidth(0.25);
  doc.line(CONTENT_X, y, CONTENT_X + CONTENT_WIDTH, y);
  return y + 5;
}

// ─── Helper: Draw a small blue caps section label with an accent tick ──
function drawSectionLabel(doc: jsPDF, label: string, y: number): number {
  // short accent tick to the left of the label
  fillColor(doc, THEME.color.accent);
  doc.rect(CONTENT_X, y - 2.6, 2.4, 2.4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(THEME.type.label);
  ink(doc, THEME.color.accent);
  doc.text(label.toUpperCase(), CONTENT_X + 4.5, y);
  return y + 4.5;
}

// ─── Helper: Draw a bordered pill/chip and return its right edge ──
function drawChip(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  opts?: { filled?: boolean; fontSize?: number },
): number {
  const fontSize = opts?.fontSize ?? THEME.type.body;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  const padX = 3;
  const textWidth = doc.getTextWidth(text);
  const chipHeight = fontSize * 0.75 + 2.2;
  const chipWidth = textWidth + padX * 2;

  if (opts?.filled) {
    fillColor(doc, THEME.color.accent);
    doc.roundedRect(x, y, chipWidth, chipHeight, chipHeight / 2, chipHeight / 2, "F");
    ink(doc, THEME.color.paper);
  } else {
    fillColor(doc, THEME.color.paper);
    strokeColor(doc, THEME.color.accent);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, chipWidth, chipHeight, chipHeight / 2, chipHeight / 2, "FD");
    ink(doc, THEME.color.accent);
  }

  doc.text(text, x + padX, y + chipHeight * 0.68);
  return x + chipWidth;
}

// ─── Helper: Render a single label on a jsPDF document ──────────
// Renders the complete A5 label starting at the top of the current page.
// Does NOT call addPage() — the caller is responsible for page management.
async function renderLabelOnDoc(
  doc: jsPDF,
  data: ShippingLabelData,
): Promise<void> {
  // ── White background ──────────────────────────────────────
  fillColor(doc, THEME.color.paper);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  // ── Full-bleed accent bar (brand signature) ────────────────
  fillColor(doc, THEME.color.accent);
  doc.rect(0, 0, PAGE_WIDTH, THEME.topBarHeight, "F");

  let y = THEME.topBarHeight + MARGIN + 2;

  // ═══════════════════════════════════════════════════════════
  // 1. BUSINESS HEADER — Logo, Name, Address, Phone, Date, Courier
  // ═══════════════════════════════════════════════════════════

  // --- Logo (left side, small) ---
  let headerLeftX = CONTENT_X;
  if (data.sender.businessLogoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = data.sender.businessLogoUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load logo"));
        setTimeout(() => reject(new Error("Logo load timeout")), 2000);
      });

      const logoSize = 13; // mm
      doc.addImage(
        img,
        "PNG",
        CONTENT_X,
        y - 1,
        logoSize,
        logoSize,
        undefined,
        "FAST",
      );
      headerLeftX = CONTENT_X + logoSize + 4;
    } catch {
      // Silently skip logo if it fails to load
    }
  }
  const headerWidth = CONTENT_WIDTH - (headerLeftX - CONTENT_X);

  // --- Business Name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(THEME.type.heading);
  ink(doc, THEME.color.ink);
  doc.text(data.sender.businessName, headerLeftX, y + 6);

  y += 11;

  // --- Business Address ---
  if (data.sender.businessAddress) {
    ink(doc, THEME.color.muted);
    y = drawWrappedText(
      doc,
      data.sender.businessAddress,
      headerLeftX,
      y,
      headerWidth,
      3.5,
      { fontSize: THEME.type.small, fontStyle: "normal" },
    ) + 1;
  }

  // --- Phone ---
  const phoneRowY = y + 3;
  if (data.sender.businessPhone) {
    const phoneDisplay =
      formatPhoneNumber(data.sender.businessPhone) ||
      data.sender.businessPhone;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(THEME.type.small);
    ink(doc, THEME.color.ink);
    doc.text(phoneDisplay, headerLeftX, phoneRowY);
    y = phoneRowY + 5;
  } else {
    y = phoneRowY + 2;
  }

  // --- Courier chip ---
  if (data.courierName) {
    drawChip(doc, `Courier: ${data.courierName}`, CONTENT_X, y, { filled: false, fontSize: THEME.type.small });
    y += 9;
  } else {
    y += 3;
  }

  // --- Divider ---
  y = drawDivider(doc, y) + 1;

  // ═══════════════════════════════════════════════════════════
  // 2. WAYBILL SECTION — visually dominant
  // ═══════════════════════════════════════════════════════════

  // --- Date, right above the waybill ID section ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(THEME.type.small);
  ink(doc, THEME.color.ink);
  doc.text(`Date: ${formatDate(data.labelDate)}`, CONTENT_X, y);
  y += 5;

  y = drawSectionLabel(doc, "Waybill ID", y);
  y += 1.5;

  // --- Barcode panel (barcode + human-readable ID both live inside it) ---
  const barcodeHeight = 10;
  const barcodeTopPad = 4;
  const idFontSize = THEME.type.subheading;
  const panelHeight = barcodeTopPad + barcodeHeight + 4 + idFontSize * 0.42 + 4;

  fillColor(doc, THEME.color.panel);
  strokeColor(doc, THEME.color.line);
  doc.setLineWidth(0.3);
  doc.roundedRect(CONTENT_X, y, CONTENT_WIDTH, panelHeight, THEME.radius, THEME.radius, "FD");

  try {
    const barcodeSvg = createBarcodeSvg(data.waybillId);
    const barcodeWidth = CONTENT_WIDTH * 0.62;
    const barcodeX = CONTENT_X + (CONTENT_WIDTH - barcodeWidth) / 2;
    const barcodeY = y + barcodeTopPad;

    await doc.svg(barcodeSvg, {
      x: barcodeX,
      y: barcodeY,
      width: barcodeWidth,
      height: barcodeHeight,
    });
  } catch (err) {
    console.error("Barcode generation error:", err);
  }

  // --- Human-readable Waybill ID, inside the panel below the barcode ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(idFontSize);
  ink(doc, THEME.color.ink);
  doc.text(
    data.waybillId,
    CONTENT_X + CONTENT_WIDTH / 2,
    y + barcodeTopPad + barcodeHeight + 5,
    { align: "center" },
  );

  y += panelHeight + 5;

  // --- Divider ---
  y = drawDivider(doc, y) + 1;

  // ═══════════════════════════════════════════════════════════
  // 3. RECEIVER SECTION
  // ═══════════════════════════════════════════════════════════
  y = drawSectionLabel(doc, "Deliver To", y);
  y += 2;

  // --- Receiver Name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(THEME.type.subheading);
  ink(doc, THEME.color.ink);
  y = drawWrappedText(doc, data.receiver.customerName, CONTENT_X, y, CONTENT_WIDTH, 5.5, {
    fontSize: THEME.type.subheading,
    fontStyle: "bold",
  });
  y += 2;

  // --- Address ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(THEME.type.base);
  ink(doc, [60, 60, 60]);
  y = drawWrappedText(doc, data.receiver.address, CONTENT_X, y, CONTENT_WIDTH, 4.5, {
    fontSize: THEME.type.base,
    fontStyle: "normal",
  });
  y += 3;

  // --- Contact Number — deliberately the most visible line in this block ---
  const contactDisplay = data.contactNumber
    ? formatPhoneNumber(data.contactNumber) || data.contactNumber
    : "";

  if (contactDisplay) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(THEME.type.phone);
    ink(doc, THEME.color.ink);
    doc.text(contactDisplay, CONTENT_X, y);
    y += 9;
  } else {
    y += 1.5;
  }

  // ═══════════════════════════════════════════════════════════
  // COD VALUE — full-width outlined panel with accent edge, no fill
  // ═══════════════════════════════════════════════════════════
  const codFormatted = formatCurrency(data.receiver.codAmount);
  const codBoxY = y;
  const codBoxHeight = 20;
  const codPadX = 8;

  strokeColor(doc, THEME.color.ink);
  doc.setLineWidth(0.4);
  doc.roundedRect(CONTENT_X, codBoxY, CONTENT_WIDTH, codBoxHeight, THEME.radius, THEME.radius, "D");

  // accent edge on the left of the panel
  fillColor(doc, THEME.color.accent);
  doc.rect(CONTENT_X, codBoxY + 1.5, 2.2, codBoxHeight - 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(THEME.type.label);
  ink(doc, THEME.color.muted);
  doc.text("COD TO COLLECT", CONTENT_X + codPadX, codBoxY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(THEME.type.value);
  ink(doc, THEME.color.ink);
  doc.text(codFormatted, CONTENT_X + codPadX, codBoxY + 16);

  y = codBoxY + codBoxHeight + 4;

  // --- Optional Note — boxed and bold so it doesn't get missed ---
  if (data.optionalNote) {
    const noteBoxY = y;
    const notePadX = 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(THEME.type.emphasis);
    const noteLines: string[] = doc.splitTextToSize(data.optionalNote, CONTENT_WIDTH - notePadX * 2);
    const noteBoxHeight = 9 + noteLines.length * 5;

    fillColor(doc, THEME.color.panel);
    strokeColor(doc, THEME.color.ink);
    doc.setLineWidth(0.35);
    doc.roundedRect(CONTENT_X, noteBoxY, CONTENT_WIDTH, noteBoxHeight, THEME.radius, THEME.radius, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(THEME.type.label);
    ink(doc, THEME.color.muted);
    doc.text("NOTE", CONTENT_X + notePadX, noteBoxY + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(THEME.type.emphasis);
    ink(doc, THEME.color.ink);
    let noteLineY = noteBoxY + 10.5;
    for (const line of noteLines) {
      doc.text(String(line), CONTENT_X + notePadX, noteLineY);
      noteLineY += 5;
    }

    y = noteBoxY + noteBoxHeight + 4;
  }

  // ═══════════════════════════════════════════════════════════
  // 4. HANDLING INSTRUCTION CHIPS (bottom section)
  // ═══════════════════════════════════════════════════════════
  if (data.handlingInstructions.length > 0) {
    y = drawDivider(doc, y + 1) + 2;

    const chipFontSize = THEME.type.body;
    let chipX = CONTENT_X;
    const chipGapX = 3;
    const chipRowHeight = chipFontSize * 0.75 + 2.2 + 3;
    const maxChipX = CONTENT_X + CONTENT_WIDTH;

    for (const instruction of data.handlingInstructions) {
      const label = HANDLING_INSTRUCTION_LABELS[instruction];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(chipFontSize);
      const projectedWidth = doc.getTextWidth(label) + 6;

      if (chipX + projectedWidth > maxChipX) {
        chipX = CONTENT_X;
        y += chipRowHeight;
      }

      const rightEdge = drawChip(doc, label, chipX, y, { filled: false, fontSize: chipFontSize });
      chipX = rightEdge + chipGapX;
    }

    y += chipRowHeight;
  }

  // ── Footer: accent hairline + order number ──────────────────
  const footerY = PAGE_HEIGHT - MARGIN - 3;
  strokeColor(doc, THEME.color.line);
  doc.setLineWidth(0.25);
  doc.line(CONTENT_X, footerY, PAGE_WIDTH - MARGIN, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(THEME.type.micro);
  ink(doc, THEME.color.subtle);
  doc.text(`Order #${data.orderNumber}`, PAGE_WIDTH - MARGIN, footerY + 4, {
    align: "right",
  });
}

// ─── Main: Generate Single A5 Shipping Label PDF ─────────────────
export async function generateShippingLabelPdf(
  data: ShippingLabelData,
): Promise<LabelGenerationResult> {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a5",
  });

  await renderLabelOnDoc(doc, data);

  const pdfBlob = doc.output("blob");
  const dataUrl = doc.output("datauristring");

  return {
    pdfBlob,
    dataUrl,
    waybillId: data.waybillId,
  };
}

// ─── Combined: Generate Multi-Page A5 Shipping Labels PDF ─────────
// Creates a single PDF with one A5 label per page, stacked vertically.
// Each label gets its own page for easy printing.
export async function generateCombinedShippingLabelsPdf(
  labels: ShippingLabelData[],
): Promise<CombinedLabelGenerationResult> {
  if (labels.length === 0) {
    throw new Error("No labels to generate");
  }

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a5",
  });

  const waybills: string[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < labels.length; i++) {
    try {
      // Add a new page for each label after the first
      if (i > 0) {
        doc.addPage();
      }

      await renderLabelOnDoc(doc, labels[i]);
      waybills.push(labels[i].waybillId);
      successCount++;
    } catch (err) {
      console.error(`Combined label error for ${labels[i].orderNumber}:`, err);
      failCount++;
    }
  }

  const pdfBlob = doc.output("blob");
  const dataUrl = doc.output("datauristring");

  return {
    pdfBlob,
    dataUrl,
    successCount,
    failCount,
    waybills,
  };
}