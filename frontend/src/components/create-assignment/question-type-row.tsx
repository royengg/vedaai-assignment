"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Minus, Plus } from "lucide-react";

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Questions",
];

interface QuestionTypeRowProps {
  type: string;
  count: number;
  marks: number;
  onRemove?: () => void;
  onUpdate?: (updates: { type?: string; count?: number; marks?: number }) => void;
}

export function QuestionTypeRow({ type, count, marks, onRemove, onUpdate }: QuestionTypeRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adjustCount = (delta: number) => {
    onUpdate?.({ count: Math.max(0, count + delta) });
  };

  const adjustMarks = (delta: number) => {
    onUpdate?.({ marks: Math.max(0, marks + delta) });
  };

  const handleSelectType = (selectedType: string) => {
    onUpdate?.({ type: selectedType });
    setIsOpen(false);
  };

  return (
    <div className="md:bg-transparent md:rounded-none mb-3 md:mb-3">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-3">
        {/* Question Type Dropdown */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-full border border-gray-200 text-sm text-gray-700 hover:border-gray-300 transition-colors"
          >
            <span>{type}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              {QUESTION_TYPE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelectType(option)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${option === type ? "font-medium text-gray-900 bg-gray-50" : "text-gray-700"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Remove question type"
        >
          <X size={18} />
        </button>

        {/* No. of Questions Counter */}
        <div className="flex items-center bg-white rounded-full border border-gray-200 px-3 py-2">
          <button
            onClick={() => adjustCount(-1)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Decrease count"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-medium text-gray-700">{count}</span>
          <button
            onClick={() => adjustCount(1)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Increase count"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Marks Counter */}
        <div className="flex items-center bg-white rounded-full border border-gray-200 px-3 py-2">
          <button
            onClick={() => adjustMarks(-1)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Decrease marks"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-medium text-gray-700">{marks}</span>
          <button
            onClick={() => adjustMarks(1)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Increase marks"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Top Row: Dropdown + X */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-full text-sm text-gray-700 min-w-0"
            >
              <span className="truncate pr-2">{type}</span>
              <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
            </button>
            {isOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelectType(option)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${option === type ? "font-medium text-gray-900 bg-gray-50" : "text-gray-700"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Remove question type"
          >
            <X size={18} />
          </button>
        </div>

        {/* Labels Row */}
        <div className="flex items-center gap-4 mb-3 px-1">
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">No. of Questions</span>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">Marks</span>
          </div>
        </div>

        {/* Counters Row */}
        <div className="flex items-center gap-4">
          {/* No. of Questions Counter */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-full px-2 py-3">
            <button
              onClick={() => adjustCount(-1)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Decrease count"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-700">{count}</span>
            <button
              onClick={() => adjustCount(1)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Increase count"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Marks Counter */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-full px-2 py-3">
            <button
              onClick={() => adjustMarks(-1)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Decrease marks"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-700">{marks}</span>
            <button
              onClick={() => adjustMarks(1)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Increase marks"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
