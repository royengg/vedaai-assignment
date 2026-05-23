"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, BookOpen, School, Clock } from "lucide-react";
import { FileUpload } from "./file-upload";
import { DueDateInput } from "./due-date-input";
import { QuestionTypeRow } from "./question-type-row";
import { AdditionalInfo } from "./additional-info";
import { z } from "zod";
import { assignmentApi } from "@/api/assignment";

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

const formSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
  schoolName: z.string().min(1, "School name is required"),
  className: z.string().min(1, "Class name is required"),
  duration: z.string().min(1, "Duration is required"),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypes: z.array(z.object({
    id: z.string(),
    type: z.string(),
    count: z.number().min(1, "Count must be at least 1"),
    marks: z.number().min(1, "Marks must be at least 1"),
  })).min(1, "At least one question type is required"),
});

export function CreateAssignmentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [subjectName, setSubjectName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [duration, setDuration] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(defaultQuestionTypes);
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

  const updateQuestionType = (id: string, updates: { type?: string; count?: number; marks?: number }) => {
    setQuestionTypes(prev => prev.map(qt => qt.id === id ? { ...qt, ...updates } : qt));
  };

  const validateForm = () => {
    const result = formSchema.safeParse({
      subjectName,
      schoolName,
      className,
      duration,
      dueDate,
      questionTypes,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError.message);
      return false;
    }

    setError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await assignmentApi.create({
        subjectName,
        schoolName,
        className,
        duration,
        dueDate,
        questionTypes: questionTypes.map(({ id, ...rest }) => rest),
        additionalInstructions: additionalInfo || undefined,
      });

      // Redirect to assignments list
      router.push("/assignments");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:max-w-2xl md:mx-auto h-full flex flex-col">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex-shrink-0">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Form Card */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm">
          {/* Header */}
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

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">
                Subject Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. English"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-full border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
                />
                <BookOpen size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">
                School Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Delhi Public School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-full border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
                />
                <School size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">
                Class Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 5th"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-full border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
                />
                <BookOpen size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">
                Duration
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 45 minutes"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-full border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
                />
                <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
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
              <div className="w-6" />
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
                onUpdate={(updates) => updateQuestionType(qt.id, updates)}
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
      </div>

      {/* Create Button */}
      <div className="mt-4 flex-shrink-0">
        <div className="flex items-center justify-end">
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 bg-button-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Assignment</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
