import { Router } from "express";
import { prisma } from "../lib/db";
import { createAssignmentSchema } from "../schemas/assignment.schema";

export const assignmentRouter = Router();

assignmentRouter.post("/create", async (req, res) => {
  const parsed = await createAssignmentSchema.safeParseAsync(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }
  const {
    dueDate,
    questionTypes,
    fileUpload,
    additionalInstructions,
    subjectName,
    schoolName,
  } = parsed.data;
});
