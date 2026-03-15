// src/lib/pdfGenerator.ts
// Install: npm install jspdf
// Usage: import { downloadHairReportPDF, downloadSkinReportPDF } from "@/lib/pdfGenerator";

import jsPDF from "jspdf";

const PRIMARY = [46, 139, 87] as [number, number, number];     // green
const DARK    = [30, 30, 30] as [number, number, number];
const MUTED   = [120, 120, 120] as [number, number, number];
const WHITE   = [255, 255, 255] as [number, number, number];
const LIGHT   = [245, 251, 247] as [number, number, number];
const RED     = [220, 53, 69] as [number, number, number];
const YELLOW  = [255, 193, 7] as [number, number, number];
const BLUE    = [13, 110, 253] as [number, number, number];

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  const W = doc.internal.pageSize.getWidth();

  // Green header bar
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 42, "F");

  // DermAI branding
  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("🩺 DermAI", 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Powered Dermatology Assistant · dermai.com.np", 14, 24);

  // Report title
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 35);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, W - 14, 35, { align: "right" });

  return 52; // y position after header
}

function addFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setFillColor(...LIGHT);
  doc.rect(0, H - 22, W, 22, "F");

  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "italic");
  doc.text(
    "⚠ Disclaimer: This report is AI-assisted and for informational purposes only. It is NOT a substitute for professional medical advice.",
    14, H - 13
  );
  doc.text(
    "Always consult a qualified dermatologist at TUTH Kathmandu, B&B Hospital Lalitpur, or Nepal Cancer Hospital for confirmed diagnosis.",
    14, H - 7
  );
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFillColor(...PRIMARY);
  doc.rect(14, y, 3, 7, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(text, 20, y + 6);
  return y + 14;
}

function infoRow(doc: jsPDF, label: string, value: string, y: number, W: number): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUTED);
  doc.text(label, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(value, 80, y);
  return y + 7;
}

function progressBar(doc: jsPDF, label: string, value: number, y: number, W: number, color: [number,number,number] = PRIMARY): number {
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(label, 14, y);

  const pct = `${(value * 100).toFixed(1)}%`;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...color);
  doc.text(pct, W - 14, y, { align: "right" });

  // Bar background
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(14, y + 2, W - 28, 4, 2, 2, "F");

  // Bar fill
  doc.setFillColor(...color);
  doc.roundedRect(14, y + 2, (W - 28) * value, 4, 2, 2, "F");

  return y + 12;
}

// ─────────────────────────────────────────────────────────────────
// HAIR REPORT PDF
// ─────────────────────────────────────────────────────────────────
export function downloadHairReportPDF(report: any) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const date = new Date(report.generatedAt).toLocaleDateString("en-NP", {
    year: "numeric", month: "long", day: "numeric",
  });

  let y = addHeader(doc, "Hair Health Assessment Report", date);

  // ── Patient Info
  y = sectionTitle(doc, "Patient Information", y);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, W - 28, 30, 3, 3, "F");
  y += 7;
  y = infoRow(doc, "Name",   report.user?.name || "N/A", y, W);
  y = infoRow(doc, "Age",    report.user?.age || "N/A", y, W);
  y = infoRow(doc, "Gender", report.user?.gender || "N/A", y, W);
  y = infoRow(doc, "Date",   date, y, W);
  y += 6;

  // ── AI Diagnosis
  y = sectionTitle(doc, "AI Scalp Condition Analysis", y);
  doc.setFillColor(230, 245, 237);
  doc.roundedRect(14, y, W - 28, 28, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY);
  doc.text(report.predictedClass || "N/A", 20, y + 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Predicted Condition (CNN Image Analysis)", 20, y + 17);
  const conf = `${((report.predictedProbability || 0) * 100).toFixed(1)}%`;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY);
  doc.text(conf, W - 18, y + 12, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Confidence", W - 18, y + 19, { align: "right" });
  y += 34;

  // ── Fusion Result
  if (report.fusion_result?.primary_diagnosis) {
    const pd = report.fusion_result.primary_diagnosis;
    y = sectionTitle(doc, "Fusion Model Result (70% Image + 30% Lifestyle)", y);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(14, y, W - 28, 32, 3, 3, "F");
    y += 7;
    y = infoRow(doc, "Primary Diagnosis", pd.disease, y, W);
    y = infoRow(doc, "Final Probability", `${(pd.probability * 100).toFixed(1)}%`, y, W);
    y = infoRow(doc, "Confidence Level", pd.confidence || "N/A", y, W);
    y = infoRow(doc, "Questionnaire Role", report.fusion_result.questionnaire_role || "N/A", y, W);
    y += 4;
  }

  // ── All Predictions
  if (report.allPredictions?.length > 0) {
    y = sectionTitle(doc, "All Condition Probabilities (Top 5)", y);
    report.allPredictions.slice(0, 5).forEach((pred: any, i: number) => {
      const color: [number,number,number] = i === 0 ? PRIMARY : [150, 180, 160];
      y = progressBar(doc, pred.disease, pred.probability, y, W, color);
    });
    y += 2;
  }

  // ── Risk Level
  y = sectionTitle(doc, "Overall Risk Assessment", y);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, W - 28, 18, 3, 3, "F");
  const riskColor: [number,number,number] =
    report.overallRiskLevel === "high" ? RED :
    report.overallRiskLevel === "medium" ? YELLOW : PRIMARY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...riskColor);
  doc.text(
    `${(report.overallRiskLevel || "").toUpperCase()} RISK  —  Score: ${report.riskScore}/100`,
    20, y + 11
  );
  y += 24;

  // ── New page for recommendations
  doc.addPage();
  y = addHeader(doc, "Hair Health Report — Recommendations", date);

  // ── Clinical Summary
  if (report.fusion_result?.clinical_summary) {
    y = sectionTitle(doc, "Clinical Summary", y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(report.fusion_result.clinical_summary, W - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 6;
  }

  // ── Possible Causes
  if (report.possibleCauses?.length > 0) {
    y = sectionTitle(doc, "Identified Factors", y);
    report.possibleCauses.forEach((cause: string) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DARK);
      doc.text("•", 16, y);
      const lines = doc.splitTextToSize(cause, W - 34);
      doc.text(lines, 22, y);
      y += lines.length * 5 + 2;
    });
    y += 4;
  }

  // ── Recommendations
  if (report.recommendations?.length > 0) {
    y = sectionTitle(doc, "Recommendations", y);
    report.recommendations.forEach((rec: string, i: number) => {
      doc.setFillColor(...LIGHT);
      const lines = doc.splitTextToSize(rec, W - 40);
      const boxH = lines.length * 5 + 6;
      doc.roundedRect(14, y, W - 28, boxH, 2, 2, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...PRIMARY);
      doc.text(`${i + 1}.`, 18, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DARK);
      doc.text(lines, 26, y + 6);
      y += boxH + 3;
    });
  }

  // ── Nepal hospitals
  y += 4;
  y = sectionTitle(doc, "Recommended Hospitals in Nepal", y);
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  ["TUTH (Tribhuvan University Teaching Hospital) — Kathmandu",
   "B&B Hospital — Lalitpur",
   "Nepal Cancer Hospital & Research Centre — Lalitpur"].forEach((h) => {
    doc.text(`• ${h}`, 18, y);
    y += 6;
  });

  addFooter(doc);
  doc.save(`DermAI_Hair_Report_${report.user?.name?.replace(/\s+/g, "_") || "Patient"}.pdf`);
}

// ─────────────────────────────────────────────────────────────────
// SKIN REPORT PDF
// ─────────────────────────────────────────────────────────────────

const SKIN_CONDITIONS: Record<string, { severity: string; description: string }> = {
  "Melanocytic nevi":              { severity: "Benign",       description: "Common moles. Usually harmless but monitor for changes in size, shape or color." },
  "Melanoma":                      { severity: "Malignant",    description: "A serious form of skin cancer. Requires immediate consultation with a dermatologist." },
  "Benign keratosis-like lesions": { severity: "Benign",       description: "Non-cancerous skin growths. Generally harmless but can resemble other conditions." },
  "Basal cell carcinoma":          { severity: "Malignant",    description: "The most common skin cancer. Rarely spreads but needs prompt medical treatment." },
  "Actinic keratoses":             { severity: "Precancerous", description: "Rough, scaly patches caused by sun damage. Can develop into skin cancer if untreated." },
  "Vascular lesions":              { severity: "Benign",       description: "Abnormalities of blood vessels in the skin. Usually benign." },
  "Dermatofibroma":                { severity: "Benign",       description: "Harmless skin growths. Usually no treatment needed unless causing discomfort." },
  "Normal":                        { severity: "Normal",       description: "No significant skin condition detected in the image." },
};

export function downloadSkinReportPDF(report: any) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const date = new Date(report.generatedAt).toLocaleDateString("en-NP", {
    year: "numeric", month: "long", day: "numeric",
  });

  let y = addHeader(doc, "Skin Analysis Report", date);

  // ── Patient Info
  y = sectionTitle(doc, "Patient Information", y);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, W - 28, 30, 3, 3, "F");
  y += 7;
  y = infoRow(doc, "Name",   report.user?.name || "N/A", y, W);
  y = infoRow(doc, "Age",    report.user?.age || "N/A", y, W);
  y = infoRow(doc, "Gender", report.user?.gender || "N/A", y, W);
  y = infoRow(doc, "Date",   date, y, W);
  y += 6;

  // ── Primary Detection
  const condition = SKIN_CONDITIONS[report.predictedClass] ?? { severity: "Unknown", description: "Please consult a dermatologist." };
  const sevColor: [number,number,number] =
    condition.severity === "Malignant" ? RED :
    condition.severity === "Precancerous" ? [200, 150, 0] :
    condition.severity === "Normal" ? PRIMARY : BLUE;

  y = sectionTitle(doc, "Primary Detection", y);
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(14, y, W - 28, 36, 3, 3, "F");
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...sevColor);
  doc.text(report.predictedClass || "N/A", 20, y + 11);

  // Severity badge
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.setFillColor(...sevColor);
  doc.roundedRect(20, y + 14, 28, 7, 3, 3, "F");
  doc.text(condition.severity.toUpperCase(), 34, y + 19, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  const descLines = doc.splitTextToSize(condition.description, W - 60);
  doc.text(descLines, 20, y + 26);

  const conf = `${((report.confidence || 0) * 100).toFixed(1)}%`;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...sevColor);
  doc.text(conf, W - 18, y + 14, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("confidence", W - 18, y + 21, { align: "right" });
  y += 42;

  // ── Urgent warning
  if (condition.severity === "Malignant" || condition.severity === "Precancerous") {
    doc.setFillColor(255, 235, 235);
    doc.setDrawColor(...RED);
    doc.roundedRect(14, y, W - 28, 22, 3, 3, "FD");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...RED);
    doc.text("⚠ Urgent: Please See a Doctor Immediately", 20, y + 8);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("This result requires professional medical evaluation as soon as possible.", 20, y + 15);
    y += 28;
  }

  // ── All Predictions
  if (report.allPredictions?.length > 0) {
    y = sectionTitle(doc, "All Detected Probabilities", y);
    report.allPredictions.slice(0, 8).forEach((pred: any, i: number) => {
      const color: [number,number,number] = i === 0 ? sevColor : [150, 160, 175];
      y = progressBar(doc, pred.disease, pred.probability, y, W, color);
    });
    y += 4;
  }

  // ── About HAM10000
  y = sectionTitle(doc, "About This Analysis", y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  const about = "This analysis was performed using a Convolutional Neural Network (CNN) trained on the HAM10000 dataset — a collection of 10,015 dermatoscopic images across 7 skin conditions plus a Normal class. The model uses the Xception architecture with transfer learning and class-balanced training.";
  const aboutLines = doc.splitTextToSize(about, W - 28);
  doc.text(aboutLines, 14, y);
  y += aboutLines.length * 5 + 8;

  // ── Nepal hospitals
  y = sectionTitle(doc, "Recommended Hospitals in Nepal", y);
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  ["TUTH (Tribhuvan University Teaching Hospital) — Kathmandu",
   "B&B Hospital — Lalitpur",
   "Nepal Cancer Hospital & Research Centre — Lalitpur"].forEach((h) => {
    doc.text(`• ${h}`, 18, y);
    y += 6;
  });

  addFooter(doc);
  doc.save(`DermAI_Skin_Report_${report.user?.name?.replace(/\s+/g, "_") || "Patient"}.pdf`);
}