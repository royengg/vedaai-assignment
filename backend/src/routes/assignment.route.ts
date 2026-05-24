import { Router } from "express";
import { prisma } from "../config/db.config";
import { createAssignmentSchema } from "../schemas/assignment.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { enqueueAnalysisJob } from "../queues/generation.queue";
import { renderQuestionPaperToPdfBuffer } from "../services/render";

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

    const jobData = {
      assignmentId: id,
    };

    const enqueuedJob = await enqueueAnalysisJob("generateJobs", jobData);

    return res.status(201).json({ message: "Job Queued" });
  } catch (error) {
    console.error("Generate QP error:", error);
    await prisma.assignment.update({
      where: { id: req.params.id },
      data: { status: "FAILED to queue job" },
    });
    return res.status(500).json({ error: "Failed to queue job" });
  }
});

assignmentRouter.get("/:id/pdf", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Missing assignment ID" });
  }

  try {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: id,
      },
      include: {
        questionPaper: true,
      },
    });
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const questionPaper = assignment.questionPaper;

    if (!questionPaper) {
      return res.status(404).json({ error: "Question Paper not found" });
    }
    const { buffer } = await renderQuestionPaperToPdfBuffer({
      ...questionPaper,
      sections: questionPaper.sections as any,
      answerKey: questionPaper.answerKey as any,
    });
    res.set("Content-Type", "application/pdf");
    res.set(
      "Content-Disposition",
      `attachment; filename="${questionPaper.documentId}.pdf"`,
    );
    res.set("Content-Length", String(buffer.length));
    res.send(buffer);
  } catch (error) {
    console.error("PDF render error:", error);
    res
      .status(500)
      .json({ message: "Failed to render assignment", error: String(error) });
  }
});

assignmentRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    await prisma.assignment.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "Assignment deleted" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return res.status(500).json({ error: "Failed to delete assignment" });
  }
});
