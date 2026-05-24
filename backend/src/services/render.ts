import pdfkit from "pdfkit";

function sanitizeForPdf(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(
      /[^\x00-\x7F\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2192]/g,
      " ",
    )
    .replace(/\r\n/g, "\n");
}

interface QuestionPaperData {
  documentId: string;
  institutionName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
  sections: Array<{
    section_id: string;
    section_title: string;
    instructions: string;
    questions: Array<{
      qid: string;
      question_text: string;
      difficulty: string;
      marks: number;
      options?: string[];
    }>;
  }>;
  answerKey: Array<{
    qid: string;
    answer_text: string;
  }>;
}

function addPageIfNeeded(doc: PDFKit.PDFDocument, requiredHeight: number) {
  if (doc.y + requiredHeight > doc.page.height - doc.page.margins.bottom - 20) {
    doc.addPage();
    return true;
  }
  return false;
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Easy":
      return { bg: "#D1FAE5", text: "#059669" };
    case "Moderate":
      return { bg: "#FEF3C7", text: "#D97706" };
    case "Challenging":
      return { bg: "#FEE2E2", text: "#DC2626" };
    default:
      return { bg: "#F3F4F6", text: "#4B5563" };
  }
}

export async function renderQuestionPaperToPdfBuffer(data: QuestionPaperData) {
  const doc = new pdfkit({
    size: "A4",
    margins: { top: 60, bottom: 50, left: 55, right: 55 },
    bufferPages: true,
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));

  // Track page indices manually to avoid bufferedPageRange() phantom pages
  let currentPageIndex = 0;
  const answerKeyPageIndices = new Set<number>();

  // --- HEADER ---
  doc.fontSize(22).font("Helvetica-Bold").fillColor("#111827");
  doc.text(sanitizeForPdf(data.institutionName), { align: "center" });
  doc.moveDown(0.3);

  doc.fontSize(14).font("Helvetica-Bold").fillColor("#374151");
  doc.text(`Subject: ${sanitizeForPdf(data.subject)}`, { align: "center" });
  doc.text(`Class: ${sanitizeForPdf(data.className)}`, { align: "center" });
  doc.moveDown(0.5);

  // Meta row
  doc.fontSize(11).font("Helvetica").fillColor("#4B5563");
  doc.text(`Time Allowed: ${sanitizeForPdf(data.timeAllowed)}`, {
    continued: true,
  });
  doc.text(
    `                                             Maximum Marks: ${data.maxMarks}`,
    { align: "right" },
  );
  doc.moveDown(0.8);

  // Divider
  doc
    .moveTo(55, doc.y)
    .lineTo(doc.page.width - 55, doc.y)
    .lineWidth(1)
    .strokeColor("#E5E7EB")
    .stroke();
  doc.moveDown(0.6);

  // General Instructions
  if (data.generalInstructions) {
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#374151");
    doc.text("General Instructions:", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9).font("Helvetica-Oblique").fillColor("#4B5563");
    doc.text(sanitizeForPdf(data.generalInstructions), {
      align: "left",
      width: doc.page.width - 110,
    });
    doc.moveDown(1);
  }

  // Student Info — pure flow layout
  doc.fontSize(10).font("Helvetica").fillColor("#374151");

  // Name: ___________
  doc.text("Name: ", { continued: true });
  doc.text("________________________________________");
  doc.moveDown(1.2);

  // Roll Number: ___________
  doc.text("Roll Number: ", { continued: true });
  doc.text("________________________________________");
  doc.moveDown(1.2);

  // Class: [value]    Section: ___________
  doc.text("Class: ", { continued: true });
  doc.text(sanitizeForPdf(data.className), { continued: true });
  doc.text("    Section: ", { continued: true });
  doc.text("________________");
  doc.moveDown(1.5);

  // --- SECTIONS ---
  data.sections.forEach((section, sIdx) => {
    if (addPageIfNeeded(doc, 120)) {
      currentPageIndex++;
    }

    // Section title
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#111827");
    doc.text(sanitizeForPdf(section.section_title), { align: "center" });
    doc.moveDown(0.2);

    // Section instructions
    if (section.instructions) {
      doc.fontSize(9).font("Helvetica-Oblique").fillColor("#6B7280");
      doc.text(sanitizeForPdf(section.instructions), {
        align: "center",
        width: doc.page.width - 110,
      });
      doc.moveDown(0.5);
    }

    // Questions
    section.questions.forEach((q, qIdx) => {
      const questionHeight =
        q.options && q.options.length > 0 ? 80 + q.options.length * 16 : 50;
      if (addPageIfNeeded(doc, questionHeight)) {
        currentPageIndex++;
      }

      // Question row
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#111827");
      doc.text(`${q.qid}.`, 55, doc.y, { continued: true });
      doc.font("Helvetica").fillColor("#374151");
      doc.text(` ${sanitizeForPdf(q.question_text)}`, { continued: true });
      doc.fontSize(9).fillColor("#9CA3AF");
      doc.text(` [${q.marks} Marks]`, { align: "right" });
      doc.moveDown(0.3);

      // Difficulty badge with colors
      const colors = getDifficultyColor(q.difficulty);
      doc.save();
      const badgeWidth = doc.widthOfString(q.difficulty) + 8;
      const badgeHeight = 14;
      doc
        .roundedRect(73, doc.y - 2, badgeWidth, badgeHeight, 3)
        .fillColor(colors.bg)
        .fill();
      doc.fontSize(7).font("Helvetica").fillColor(colors.text);
      doc.text(sanitizeForPdf(q.difficulty), 77, doc.y + 1);
      doc.restore();
      doc.moveDown(0.2);

      // Options (if MCQ)
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, idx) => {
          const label = String.fromCharCode(65 + idx);
          doc.fontSize(9).font("Helvetica").fillColor("#374151");
          doc.text(`${label}. ${sanitizeForPdf(opt)}`, { indent: 30 });
        });
        doc.moveDown(0.4);
      }

      // Spacing between questions
      if (qIdx < section.questions.length - 1) {
        doc.moveDown(0.2);
      }
    });

    // Section divider (except last)
    if (sIdx < data.sections.length - 1) {
      doc.moveDown(0.6);
      doc
        .moveTo(55, doc.y)
        .lineTo(doc.page.width - 55, doc.y)
        .lineWidth(0.5)
        .strokeColor("#F3F4F6")
        .stroke();
      doc.moveDown(0.6);
    }
  });

  // --- ANSWER KEY (new page) ---
  if (data.answerKey && data.answerKey.length > 0) {
    doc.addPage();
    currentPageIndex++;
    answerKeyPageIndices.add(currentPageIndex);

    doc.fontSize(16).font("Helvetica-Bold").fillColor("#111827");
    doc.text("Answer Key", { align: "center" });
    doc.moveDown(1);

    data.answerKey.forEach((ans) => {
      if (addPageIfNeeded(doc, 40)) {
        currentPageIndex++;
        answerKeyPageIndices.add(currentPageIndex);
      }

      const startY = doc.y;
      const qid = `${ans.qid}.`;
      const answerText = sanitizeForPdf(ans.answer_text);

      doc.fontSize(10).font("Helvetica-Bold").fillColor("#111827");
      doc.text(qid, 55, startY, { lineBreak: false });

      const qidWidth = doc.widthOfString(qid) + 6;
      doc.fontSize(10).font("Helvetica").fillColor("#374151");
      doc.text(answerText, 55 + qidWidth, startY, {
        width: doc.page.width - 55 - qidWidth - 55,
        align: "left",
      });

      doc.moveDown(0.4);
    });
  }

  // --- FOOTERS ---
  const totalPages = currentPageIndex + 1;

  for (let i = 0; i < totalPages; i++) {
    try {
      doc.switchToPage(i);
      const pageLabel = answerKeyPageIndices.has(i)
        ? "Answer Key"
        : "Question Paper";
      doc.fontSize(8).font("Helvetica").fillColor("#9CA3AF");
      doc.text(
        `${sanitizeForPdf(data.subject)} • ${pageLabel} • Page ${i + 1} of ${totalPages}`,
        0,
        doc.page.height - 35,
        {
          align: "center",
          width: doc.page.width,
          lineBreak: false,
        },
      );
    } catch {
      // Page doesn't exist, stop writing footers
      break;
    }
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    doc.on("end", resolve);
    doc.on("error", reject);
  });

  return { buffer: Buffer.concat(chunks), pages: totalPages };
}
