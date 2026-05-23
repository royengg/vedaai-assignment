"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
}

export function StepNavigation({ onPrevious, onNext }: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6">
      <button
        onClick={onPrevious}
        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Previous</span>
      </button>

      <button
        onClick={onNext}
        className="flex items-center gap-2 px-6 py-3 bg-button-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <span>Next</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
