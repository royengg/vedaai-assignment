import { z } from "zod";

export const qpSchema = z.object({
  document_id: z.string(),
  paper_meta: z.object({
    institution_name: z.string(),
    subject: z.string(),
    class_name: z.string(),
    time_allowed: z.string(),
    max_marks: z.number(),
    general_instructions: z.string(),
  }),
  sections: z.array(
    z.object({
      section_id: z.string(),
      section_title: z.string(),
      instructions: z.string(),
      questions: z.array(
        z.object({
          qid: z.string(),
          question_text: z.string(),
          difficulty: z.enum(["Easy", "Moderate", "Challenging"]),
          marks: z.number(),
        }),
      ),
    }),
  ),
  answer_key: z.array(
    z.object({
      qid: z.string(),
      answer_text: z.string(),
    }),
  ),
});

export type QP = z.infer<typeof qpSchema>;
