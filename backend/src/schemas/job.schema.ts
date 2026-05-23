import { z } from "zod";

export const jobSchema = z.object({
  assignmentId: z.string(),
});

export type Job = z.infer<typeof jobSchema>;