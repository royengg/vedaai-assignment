"use client";

import { FileDown } from "lucide-react";
import { assignmentApi } from "@/api/assignment";

interface DownloadPdfCardProps {
  assignmentId: string;
  subject: string;
  className: string;
}

export function DownloadPdfCard({
  assignmentId,
  subject,
  className,
}: DownloadPdfCardProps) {
  const handleDownload = async () => {
    try {
      const blob = await assignmentApi.downloadPdf(assignmentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `question-paper-${subject}-${className}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div className="bg-[#1C1C1E] rounded-3xl p-6 md:p-8 lg:p-10 mb-6">
      <p className="text-white text-lg md:text-xl font-semibold leading-relaxed mb-6 break-words">
        Here is your customized{" "}
        <span className="underline underline-offset-4 decoration-white/50">
          Question Paper
        </span>{" "}
        for your {subject} - {className}:
      </p>

      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#1C1C1E] rounded-full text-base font-medium hover:bg-gray-100 transition-colors"
      >
        <FileDown size={20} strokeWidth={2} />
        <span>Download as PDF</span>
      </button>
    </div>
  );
}
