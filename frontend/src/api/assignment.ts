import axios from "axios";
import { apiClient } from "./client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface QuestionTypeInput {
  type: string;
  count: number;
  marks: number;
}

export interface CreateAssignmentInput {
  subjectName: string;
  schoolName: string;
  className: string;
  duration: string;
  dueDate: string;
  questionTypes: QuestionTypeInput[];
  additionalInstructions?: string;
}

export interface Assignment {
  id: string;
  subjectName: string;
  schoolName: string;
  className: string;
  duration: string;
  dueDate: string;
  questionTypes: QuestionTypeInput[];
  additionalInstructions?: string;
  totalQuestions: number;
  totalMarks: number;
  status: string;
  createdAt: string;
}

export interface QuestionPaper {
  id: string;
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
      difficulty: "Easy" | "Moderate" | "Challenging";
      marks: number;
    }>;
  }>;
  answerKey: Array<{
    qid: string;
    answer_text: string;
  }>;
  createdAt: string;
}

export const assignmentApi = {
  create: async (
    data: CreateAssignmentInput,
  ): Promise<{ success: boolean; assignment: Assignment }> => {
    const response = await apiClient.post("/assignment/create", data);
    return response.data;
  },

  list: async (): Promise<{ success: boolean; assignments: Assignment[] }> => {
    const response = await apiClient.get("/assignment");
    return response.data;
  },

  getById: async (
    id: string,
  ): Promise<{
    success: boolean;
    assignment: Assignment & { questionPaper?: QuestionPaper };
  }> => {
    const response = await apiClient.get(`/assignment/${id}`);
    return response.data;
  },

  generate: async (id: string) => {
    const response = await apiClient.post(`/assignment/${id}/generate`);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/assignment/${id}`);
    return response.data;
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await axios.get(`${API_BASE_URL}/assignment/${id}/pdf`, {
      responseType: "blob",
      withCredentials: true,
    });
    return response.data;
  },
};
