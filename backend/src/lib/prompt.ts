export function buildAIPrompt(params: {
  subjectName: string;
  schoolName: string;
  className: string;
  duration: string;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  additionalInstructions?: string | null;
  totalMarks: number;
}): string {
  const {
    subjectName,
    schoolName,
    className,
    duration,
    questionTypes,
    additionalInstructions,
    totalMarks,
  } = params;

  const questionTypesStr = questionTypes
    .map((qt) => `- ${qt.type}: ${qt.count} questions, ${qt.marks} marks each`)
    .join("\n");

  return `Generate a comprehensive question paper for the following specifications:

Institution: ${schoolName}
Subject: ${subjectName}
Class: ${className}
Duration: ${duration}
Maximum Marks: ${totalMarks}

Question Type Distribution:
${questionTypesStr}

${additionalInstructions ? `Additional Instructions:\n${additionalInstructions}\n` : ""}

Requirements:
1. Create well-structured sections (A, B, C, etc.) based on question types and difficulty levels
2. Include a mix of Easy, Moderate, and Challenging questions
3. Each question should have a unique question ID (qid)
4. Provide an answer key for all questions
5. Include general instructions for students
6. Make questions relevant to the subject and class level
7. Ensure total marks match the specified maximum

Generate the question paper in the exact JSON format specified.`;
}
