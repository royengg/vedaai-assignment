"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookOpen, School, Clock, Calendar, Loader2, ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { assignmentApi } from "@/api/assignment";
import { useAuthStore } from "@/store/auth.store";

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [questionPaper, setQuestionPaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"review" | "generated">("review");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchAssignment();
    }
  }, [isAuthenticated, id]);

  const fetchAssignment = async () => {
    try {
      const data = await assignmentApi.getById(id);
      setAssignment(data.assignment);
      if (data.assignment.questionPaper) {
        setQuestionPaper(data.assignment.questionPaper);
        setStep("generated");
      }
    } catch (error) {
      console.error("Failed to fetch assignment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await assignmentApi.generate(id);
      setQuestionPaper(data.questionPaper);
      setStep("generated");
    } catch (error: any) {
      alert(error.message || "Failed to generate question paper");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-main-bg">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !assignment) {
    return null;
  }

  const questionTypes = assignment.questionTypes || [];
  const totalQuestions = questionTypes.reduce((sum: number, qt: any) => sum + qt.count, 0);
  const totalMarks = questionTypes.reduce((sum: number, qt: any) => sum + (qt.count * qt.marks), 0);

  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col md:ml-[280px]">
        <Header />

        {/* Page Header */}
        <div className="px-4 md:px-6 pt-20 md:pt-24 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              {step === "review" ? "Review Assignment" : "Generated Question Paper"}
            </h1>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 bg-main-bg overflow-y-auto px-4 md:px-6 pb-24 md:pb-8">
          <div className="max-w-2xl mx-auto">
            {step === "review" && (
              <>
                {/* Review Content */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Assignment Details</h2>
                  
                  {/* Info Cards */}
                  <div className="space-y-4 mb-6">
                    <ReviewItem icon={<BookOpen size={18} />} label="Subject" value={assignment.subjectName} />
                    <ReviewItem icon={<School size={18} />} label="School" value={assignment.schoolName} />
                    <ReviewItem icon={<BookOpen size={18} />} label="Class" value={assignment.className} />
                    <ReviewItem icon={<Clock size={18} />} label="Duration" value={assignment.duration} />
                    <ReviewItem icon={<Calendar size={18} />} label="Due Date" value={assignment.dueDate} />
                  </div>

                  {/* Question Types */}
                  <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Question Types</h3>
                    <div className="space-y-3">
                      {questionTypes.map((qt: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                          <span className="text-sm text-gray-700">{qt.type}</span>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{qt.count} questions</span>
                            <span>{qt.marks} marks each</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 text-right space-y-1">
                      <p className="text-sm font-medium text-gray-700">Total Questions: {totalQuestions}</p>
                      <p className="text-sm font-medium text-gray-700">Total Marks: {totalMarks}</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {assignment.additionalInstructions && (
                    <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">Additional Information</h3>
                      <p className="text-sm text-gray-600">{assignment.additionalInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-8 py-3 bg-button-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <span>Generate Question Paper</span>
                    )}
                  </button>
                </div>
              </>
            )}

            {step === "generated" && questionPaper && (
              <>
                {/* Generated Output */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{questionPaper.institutionName}</h1>
                    <p className="text-lg text-gray-700">Subject: {questionPaper.subject}</p>
                    <p className="text-lg text-gray-700">Class: {questionPaper.className}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-700">Time Allowed: {questionPaper.timeAllowed}</p>
                    <p className="text-sm font-medium text-gray-700">Maximum Marks: {questionPaper.maxMarks}</p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{questionPaper.generalInstructions}</p>

                  {/* Student Info */}
                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-medium text-gray-700">Name: _________________</p>
                    <p className="text-sm font-medium text-gray-700">Roll Number: _________________</p>
                    <p className="text-sm font-medium text-gray-700">Class: {questionPaper.className} Section: _______</p>
                  </div>
                </div>

                {/* Sections */}
                {questionPaper.sections?.map((section: any) => (
                  <div key={section.section_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 text-center mb-4">{section.section_title}</h3>
                    <p className="text-sm text-gray-600 mb-4 italic">{section.instructions}</p>
                    
                    <div className="space-y-4">
                      {section.questions?.map((q: any) => (
                        <div key={q.qid} className="flex items-start gap-3">
                          <span className="text-sm font-medium text-gray-700 mt-0.5">{q.qid}.</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">
                              <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600 mr-2">
                                {q.difficulty}
                              </span>
                              {q.question_text}
                              <span className="text-sm text-gray-500 ml-2">[{q.marks} Marks]</span>
                            </p>
                            {/* MCQ Options */}
                            {q.options && q.options.length > 0 && (
                              <div className="mt-2 ml-1 space-y-1">
                                {q.options.map((option: string, idx: number) => (
                                  <p key={idx} className="text-sm text-gray-600">
                                    {String.fromCharCode(65 + idx)}. {option}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Answer Key */}
                {questionPaper.answerKey && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Answer Key</h3>
                    <div className="space-y-3">
                      {questionPaper.answerKey?.map((ans: any) => (
                        <div key={ans.qid} className="flex items-start gap-3">
                          <span className="text-sm font-medium text-gray-700">{ans.qid}.</span>
                          <p className="text-sm text-gray-600">{ans.answer_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

function ReviewItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
      <div className="text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
