import { prisma } from "../config/db";
import { Jobs } from "../types/job.types";
import { Job } from "bullmq";
import { jobSchema } from "../schemas/job.schema";
import { buildAIPrompt } from "../lib/prompt";
import { runLLM } from "../services/qpgenerator";

export async function processGenerateJob(job: Job<Jobs>) {
  const parsedJob = jobSchema.safeParse(job.data);
  if (!parsedJob.success) {
    throw new Error("Failed to parse job data");
  }
  const { assignmentId } = parsedJob.data;

  try {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const {
      subjectName,
      schoolName,
      className,
      duration,
      dueDate,
      additionalInstructions,
      totalMarks,
    } = assignment;

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
      where: { id: assignmentId },
      data: { status: "COMPLETED" },
    });
  } catch (error) {
    console.error("Error processing job:", error);
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
