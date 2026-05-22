import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";
import type { QP } from "../schemas/qp.schema";

const GOOGLE_API_KEY: string = process.env.GOOGLE_API_KEY as string;
if (!GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set");
}

const llm = new GoogleGenerativeAI(GOOGLE_API_KEY);

const outputSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    document_id: { type: SchemaType.STRING },
    paper_meta: {
      type: SchemaType.OBJECT,
      properties: {
        institution_name: { type: SchemaType.STRING },
        subject: { type: SchemaType.STRING },
        class_name: { type: SchemaType.STRING },
        time_allowed: { type: SchemaType.STRING },
        max_marks: { type: SchemaType.NUMBER },
        general_instructions: { type: SchemaType.STRING },
      },
      required: [
        "institution_name",
        "subject",
        "class_name",
        "time_allowed",
        "max_marks",
        "general_instructions",
      ],
    },
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          section_id: { type: SchemaType.STRING },
          section_title: { type: SchemaType.STRING },
          instructions: { type: SchemaType.STRING },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                qid: { type: SchemaType.STRING },
                question_text: { type: SchemaType.STRING },
                difficulty: {
                  type: SchemaType.STRING,
                  format: "enum",
                  enum: ["Easy", "Moderate", "Challenging"],
                },
                marks: { type: SchemaType.NUMBER },
              },
              required: ["qid", "question_text", "difficulty", "marks"],
            },
          },
        },
        required: ["section_id", "section_title", "instructions", "questions"],
      },
    },
    answer_key: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          qid: { type: SchemaType.STRING },
          answer_text: { type: SchemaType.STRING },
        },
        required: ["qid", "answer_text"],
      },
    },
  },
  required: ["document_id", "paper_meta", "sections", "answer_key"],
};

export async function runLLM(pdfData: string): Promise<QP> {
  const config = {
    temperature: 0.2,
    maxOutputTokens: 8000,
    responseMimeType: "application/json",
    responseSchema: outputSchema,
  };
  const prompt = "";

  const model = llm.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: config,
  });
  const res = await model.generateContent(prompt);
  const rawText = res.response.text();

  const cleaned = rawText
    .replace(/```json\n?|```/g, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim();

  return JSON.parse(cleaned);
}
