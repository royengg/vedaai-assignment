import { z } from "zod";

export const createAssignmentSchema = z.object({
  dueDate: z.string(),
  questionTypes: z.array(z.json()),
  fileUpload: z.file().optional(),
  additionalInstructions: z.string().optional(),
  subjectName: z.string(),
  schoolName: z.string(),
});
