"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FileUpload } from "./file-upload";
import { DueDateInput } from "./due-date-input";
import { QuestionTypeRow } from "./question-type-row";
import { AdditionalInfo } from "./additional-info";
import { StepNavigation } from "./step-navigation";

interface QuestionType {
  id: string;
  type: string;
  count: number;
  marks: number;
}

const defaultQuestionTypes: QuestionType[] = [
  { id: "1", type: "Multiple Choice Questions", count: 4, marks: 1 },
  { id: "2", type: "Short Questions", count: 3, marks: 2 },
  { id: "3", type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
  { id: "4", type: "Numerical Problems", count: 5, marks: 5 },
];

export function CreateAssignmentForm() {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(defaultQuestionTypes);
  const [dueDate, setDueDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marks), 0);

  const addQuestionType = () => {
    const newId = (questionTypes.length + 1).toString();
    setQuestionTypes([...questionTypes, { id: newId, type: "New Question Type", count: 1, marks: 1 }]);
  };

  const removeQuestionType = (id: string) => {
    setQuestionTypes(questionTypes.filter(qt => qt.id !== id));
  };

  return (
    <div className="w-full md:max-w-2xl md:mx-auto pb-8">
      {/* Progress Indicator */}
      <div className="mb-6 md:mb-8 px-2 md:px-0">
        <div className="flex h-1 gap-1">
          <div className="h-1 w-[48%] bg-[#6b6b6b] rounded-full" />
          <div className="h-1 flex-1 bg-[#d1d1d1] rounded-full" />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm">
        {/* Header - Desktop Only (Mobile header is in page) */}
        <div className="hidden md:block mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Assignment Details
          </h2>
          <p className="text-sm text-gray-500">
            Basic information about your assignment
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-6 md:mb-8">
          <FileUpload />
        </div>

        {/* Due Date */}
        <div className="mb-6 md:mb-8">
          <DueDateInput value={dueDate} onChange={setDueDate} />
        </div>

        {/* Question Types Section */}
        <div className="mb-6 md:mb-8">
          {/* Desktop Headers */}
          <div className="hidden md:flex items-center gap-3 mb-4 px-1">
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-800">Question Type</span>
            </div>
            <div className="w-6" /> {/* Spacer for X button */}
            <div className="w-[120px] text-center">
              <span className="text-sm font-semibold text-gray-800">No. of Questions</span>
            </div>
            <div className="w-[100px] text-center">
              <span className="text-sm font-semibold text-gray-800">Marks</span>
            </div>
          </div>

          {/* Question Type Rows */}
          {questionTypes.map((qt) => (
            <QuestionTypeRow
              key={qt.id}
              type={qt.type}
              count={qt.count}
              marks={qt.marks}
              onRemove={() => removeQuestionType(qt.id)}
            />
          ))}

          {/* Add Question Type Button */}
          <button 
            onClick={addQuestionType}
            className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <div className="w-8 h-8 bg-button-dark rounded-full flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
            <span>Add Question Type</span>
          </button>

          {/* Totals */}
          <div className="mt-6 text-right space-y-1">
            <p className="text-sm font-medium text-gray-700">
              Total Questions: {totalQuestions}
            </p>
            <p className="text-sm font-medium text-gray-700">
              Total Marks: {totalMarks}
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-6 md:mb-8">
          <AdditionalInfo value={additionalInfo} onChange={setAdditionalInfo} />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="mt-6 md:mt-8">
        <StepNavigation />
      </div>
    </div>
  );
}
