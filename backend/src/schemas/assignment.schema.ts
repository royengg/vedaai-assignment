import { z } from "zod";

const questionTypeSchema = z.object({
  type: z.string(),
  count: z.number().min(1),
  marks: z.number().min(1),
});

export const createAssignmentSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
  schoolName: z.string().min(1, "School name is required"),
  className: z.string().min(1, "Class name is required"),
  duration: z.string().min(1, "Duration is required"),
  dueDate: z.string().min(1, "Due date is required").regex(/\d/, "Due date must contain a number"),
  questionTypes: z.array(questionTypeSchema).min(1, "At least one question type is required"),
  additionalInstructions: z.string().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
