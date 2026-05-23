"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookOpen, School, Clock, Calendar, Loader2, AlertCircle, RefreshCw } from "lucide-react";
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
  const [status, setStatus] = useState<"review" | "generating" | "completed" | "failed" | "timeout">("review");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchAssignment();
    }
  }, [isAuthenticated, id]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const fetchAssignment = async () => {
    try {
      const data = await assignmentApi.getById(id);
      setAssignment(data.assignment);
      
      // If question paper already exists, show it
      if (data.assignment.questionPaper) {
        setQuestionPaper(data.assignment.questionPaper);
        setStatus("completed");
      } else if (data.assignment.status === "FAILED") {
        setStatus("failed");
      }
    } catch (error) {
      console.error("Failed to fetch assignment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    // Reset state
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    setProgress(10);
    
    // Start timer
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
      
      // Simulate progress: 10% -> 90% over 90 seconds, then hold
      const simulatedProgress = Math.min(10 + (elapsed / 90) * 80, 90);
      setProgress(simulatedProgress);
      
      // Timeout after 3 minutes (180 seconds)
      if (elapsed >= 180) {
        stopPolling();
        setStatus("timeout");
      }
    }, 1000);

    // Start polling every 3 seconds
    pollIntervalRef.current = setInterval(async () => {
      try {
        const data = await assignmentApi.getById(id);
        setAssignment(data.assignment);
        
        if (data.assignment.status === "COMPLETED" && data.assignment.questionPaper) {
          setQuestionPaper(data.assignment.questionPaper);
          setProgress(100);
          stopPolling();
          setStatus("completed");
        } else if (data.assignment.status === "FAILED") {
          stopPolling();
          setStatus("failed");
        }
        // If still PROCESSING, continue polling
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleGenerate = async () => {
    setStatus("generating");
    try {
      await assignmentApi.generate(id);
      // Job queued successfully, start polling
      startPolling();
    } catch (error: any) {
      console.error("Failed to enqueue generation:", error);
      setStatus("failed");
      alert(error.message || "Failed to generate question paper");
    }
  };

  const handleRetry = () => {
    setStatus("review");
    setProgress(0);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
              {status === "review" && "Review Assignment"}
              {status === "generating" && "Generating Question Paper"}
              {status === "completed" && "Generated Question Paper"}
              {status === "failed" && "Generation Failed"}
              {status === "timeout" && "Generation Timeout"}
            </h1>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 bg-main-bg overflow-y-auto px-4 md:px-6 pb-24 md:pb-8">
          <div className="max-w-2xl mx-auto">
            
            {/* REVIEW STATE */}
            {status === "review" && (
              <>
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
                    className="flex items-center gap-2 px-8 py-3 bg-button-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <span>Generate Question Paper</span>
                  </button>
                </div>
              </>
            )}

            {/* GENERATING STATE */}
            {status === "generating" && (
              <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  {/* Spinner */}
                  <div className="relative mb-8">
                    <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin" />
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Generating Question Paper
                  </h2>
                  <p className="text-sm text-gray-500 mb-8 max-w-md">
                    Our AI is crafting your customized exam paper. This may take 10-30 seconds depending on complexity.
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full max-w-md mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Processing...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-button-dark rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Elapsed Time */}
                  <p className="text-xs text-gray-400">
                    Elapsed: {formatTime(elapsedTime)}
                  </p>
                </div>
              </div>
            )}

            {/* FAILED STATE */}
            {status === "failed" && (
              <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                    <AlertCircle size={32} className="text-red-600" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Generation Failed
                  </h2>
                  <p className="text-sm text-gray-500 mb-8 max-w-md">
                    Something went wrong while generating your question paper. Please try again.
                  </p>
                  
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-button-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <RefreshCw size={16} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            {/* TIMEOUT STATE */}
            {status === "timeout" && (
              <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
                    <Clock size={32} className="text-yellow-600" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Generation Timeout
                  </h2>
                  <p className="text-sm text-gray-500 mb-8 max-w-md">
                    The generation is taking longer than expected. Please check back later or try again.
                  </p>
                  
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-button-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <RefreshCw size={16} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            {/* COMPLETED STATE */}
            {status === "completed" && questionPaper && (
              <>
                {/* Exam Paper Sheet */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                  <div className="min-w-[320px] p-4 md:p-10">
                  {/* Header */}
                  <div className="text-center mb-6 pb-6 border-b-2 border-gray-300">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-wide">
                      {questionPaper.institutionName}
                    </h1>
                    <div className="space-y-1 mt-4">
                      <p className="text-base md:text-lg text-gray-800">
                        <span className="font-semibold">Subject:</span> {questionPaper.subject}
                      </p>
                      <p className="text-base md:text-lg text-gray-800">
                        <span className="font-semibold">Class:</span> {questionPaper.className}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info Row */}
                  <div className="flex items-center justify-between mb-4 text-sm font-medium text-gray-800">
                    <p>Time Allowed: <span className="font-normal">{questionPaper.timeAllowed}</span></p>
                    <p>Maximum Marks: <span className="font-normal">{questionPaper.maxMarks}</span></p>
                  </div>

                  {/* Instructions */}
                  <p className="text-sm text-gray-700 mb-6 italic leading-relaxed">
                    {questionPaper.generalInstructions}
                  </p>

                  {/* Student Info */}
                  <div className="space-y-3 mb-8 text-sm text-gray-800">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold min-w-[70px] md:min-w-[100px]">Name:</span>
                      <span className="border-b border-gray-400 flex-1 inline-block h-4"></span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold min-w-[70px] md:min-w-[100px]">Roll Number:</span>
                      <span className="border-b border-gray-400 flex-1 inline-block h-4"></span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold min-w-[70px] md:min-w-[100px]">Class:</span>
                      <span>{questionPaper.className}</span>
                      <span className="font-semibold ml-2 md:ml-6">Section:</span>
                      <span className="border-b border-gray-400 w-20 md:w-32 inline-block h-4"></span>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-8">
                    {questionPaper.sections?.map((section: any, sIdx: number) => (
                      <div key={section.section_id}>
                        <h2 className="text-center font-bold text-lg mb-2 tracking-wide text-gray-900">
                          {section.section_title}
                        </h2>
                        <p className="text-sm text-gray-600 italic mb-5 text-center">
                          {section.instructions}
                        </p>

                        {/* Questions */}
                        <div className="space-y-4">
                          {section.questions?.map((q: any) => (
                            <div key={q.qid} className="text-sm text-gray-800">
                              <div className="flex items-start gap-2 mb-1 leading-relaxed">
                                <span className="font-semibold mt-0.5 min-w-[28px]">{q.qid}.</span>
                                <div className="flex-1">
                                  <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600 mr-2 align-middle">
                                    {q.difficulty}
                                  </span>
                                  <span>{q.question_text}</span>
                                  <span className="text-gray-500 ml-1">[{q.marks} Marks]</span>
                                </div>
                              </div>
                              
                              {/* MCQ Options */}
                              {q.options && q.options.length > 0 && (
                                <div className="ml-[36px] mt-2 space-y-1.5">
                                  {q.options.map((option: string, idx: number) => {
                                    const cleanOption = option.replace(/^[A-Da-d][\s.)]\s*/, '');
                                    return (
                                      <p key={idx} className="text-gray-700 pl-1">
                                        {String.fromCharCode(65 + idx)}. {cleanOption}
                                      </p>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Divider between sections */}
                        {sIdx < questionPaper.sections.length - 1 && (
                          <div className="border-t border-gray-200 my-6"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* End Marker */}
                  <div className="mt-8 pt-4 border-t border-gray-300">
                    <p className="text-center font-bold text-sm tracking-wide text-gray-800">
                      End of Question Paper
                    </p>
                  </div>
                </div>
                </div>

                {/* Answer Key */}
                {questionPaper.answerKey && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10 mt-6">
                    <h3 className="text-center font-bold text-lg mb-6 text-gray-900">Answer Key</h3>
                    <div className="space-y-3">
                      {questionPaper.answerKey?.map((ans: any) => (
                        <div key={ans.qid} className="flex items-start gap-3 text-sm">
                          <span className="font-semibold min-w-[28px]">{ans.qid}.</span>
                          <p className="text-gray-700 leading-relaxed">{ans.answer_text}</p>
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
