import { Router } from "express";
import { prisma } from "../config/db";
import { createAssignmentSchema } from "../schemas/assignment.schema";
import { runLLM } from "../services/qpgenerator";
import { authMiddleware } from "../middleware/auth.middleware";
import { buildAIPrompt } from "../lib/prompt";

export const assignmentRouter = Router();

assignmentRouter.use(authMiddleware);

assignmentRouter.post("/create", async (req, res) => {
  try {
    const parsed = createAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const {
      subjectName,
      schoolName,
      className,
      duration,
      dueDate,
      questionTypes,
      additionalInstructions,
    } = parsed.data;

    const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
    const totalMarks = questionTypes.reduce(
      (sum, qt) => sum + qt.count * qt.marks,
      0,
    );

    const assignment = await prisma.assignment.create({
      data: {
        userId: req.userId as string,
        subjectName,
        schoolName,
        className,
        duration,
        dueDate,
        questionTypes: questionTypes as any,
        additionalInstructions,
        totalQuestions,
        totalMarks,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      assignment: {
        id: assignment.id,
        subjectName: assignment.subjectName,
        schoolName: assignment.schoolName,
        className: assignment.className,
        duration: assignment.duration,
        dueDate: assignment.dueDate,
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
        totalQuestions: assignment.totalQuestions,
        totalMarks: assignment.totalMarks,
        status: assignment.status,
        createdAt: assignment.createdAt,
      },
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    return res.status(500).json({ error: "Failed to create assignment" });
  }
});

assignmentRouter.get("/", async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { userId: req.userId as string },
      orderBy: { createdAt: "desc" },
      include: {
        questionPaper: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      assignments: assignments.map((a) => ({
        id: a.id,
        subjectName: a.subjectName,
        schoolName: a.schoolName,
        className: a.className,
        duration: a.duration,
        dueDate: a.dueDate,
        totalQuestions: a.totalQuestions,
        totalMarks: a.totalMarks,
        status: a.status,
        hasQuestionPaper: !!a.questionPaper,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("List assignments error:", error);
    return res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

assignmentRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await prisma.assignment.findFirst({
      where: {
        id,
        userId: req.userId as string,
      },
      include: {
        questionPaper: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    return res.json({
      success: true,
      assignment: {
        id: assignment.id,
        subjectName: assignment.subjectName,
        schoolName: assignment.schoolName,
        className: assignment.className,
        duration: assignment.duration,
        dueDate: assignment.dueDate,
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
        totalQuestions: assignment.totalQuestions,
        totalMarks: assignment.totalMarks,
        status: assignment.status,
        createdAt: assignment.createdAt,
        questionPaper: assignment.questionPaper
          ? {
              id: assignment.questionPaper.id,
              documentId: assignment.questionPaper.documentId,
              institutionName: assignment.questionPaper.institutionName,
              subject: assignment.questionPaper.subject,
              className: assignment.questionPaper.className,
              timeAllowed: assignment.questionPaper.timeAllowed,
              maxMarks: assignment.questionPaper.maxMarks,
              generalInstructions: assignment.questionPaper.generalInstructions,
              sections: assignment.questionPaper.sections,
              answerKey: assignment.questionPaper.answerKey,
              createdAt: assignment.questionPaper.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get assignment error:", error);
    return res.status(500).json({ error: "Failed to fetch assignment" });
  }
});

assignmentRouter.post("/:id/generate", async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await prisma.assignment.findFirst({
      where: {
        id,
        userId: req.userId as string,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    await prisma.assignment.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    const questionTypes = assignment.questionTypes as Array<{
      type: string;
      count: number;
      marks: number;
    }>;

    const prompt = buildAIPrompt({
      subjectName: assignment.subjectName,
      schoolName: assignment.schoolName,
      className: assignment.className,
      duration: assignment.duration,
      questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      totalMarks: assignment.totalMarks,
    });

    const qpData = await runLLM(prompt);

    const questionPaper = await prisma.questionPaper.create({
      data: {
        assignmentId: assignment.id,
        documentId: qpData.document_id,
        institutionName: qpData.paper_meta.institution_name,
        subject: qpData.paper_meta.subject,
        className: qpData.paper_meta.class_name,
        timeAllowed: qpData.paper_meta.time_allowed,
        maxMarks: qpData.paper_meta.max_marks,
        generalInstructions: qpData.paper_meta.general_instructions,
        sections: qpData.sections as any,
        answerKey: qpData.answer_key as any,
      },
    });

    await prisma.assignment.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return res.json({
      success: true,
      questionPaper: {
        id: questionPaper.id,
        documentId: questionPaper.documentId,
        institutionName: questionPaper.institutionName,
        subject: questionPaper.subject,
        className: questionPaper.className,
        timeAllowed: questionPaper.timeAllowed,
        maxMarks: questionPaper.maxMarks,
        generalInstructions: questionPaper.generalInstructions,
        sections: questionPaper.sections,
        answerKey: questionPaper.answerKey,
        createdAt: questionPaper.createdAt,
      },
    });
  } catch (error) {
    console.error("Generate QP error:", error);
    await prisma.assignment.update({
      where: { id: req.params.id },
      data: { status: "FAILED" },
    });
    return res.status(500).json({ error: "Failed to generate question paper" });
  }
});
