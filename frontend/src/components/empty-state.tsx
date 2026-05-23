"use client";

import { Search, FileSearch, X, Sparkles, Plus } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      {/* Illustration Composition */}
      <div className="relative w-48 h-48 mb-8">
        {/* Background decorative elements */}
        <div className="absolute top-4 left-8 w-3 h-3 rounded-full bg-blue-400/60" />
        <div className="absolute bottom-8 right-6 w-2 h-2 rounded-full bg-blue-500/40" />
        
        {/* Main document icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Document */}
            <div className="w-24 h-28 bg-white/60 rounded-xl border border-gray-300/50 flex flex-col items-center justify-center shadow-sm">
              <div className="w-16 h-2 bg-gray-300/60 rounded-full mb-2" />
              <div className="w-14 h-2 bg-gray-300/40 rounded-full mb-2" />
              <div className="w-16 h-2 bg-gray-300/40 rounded-full mb-2" />
              <div className="w-12 h-2 bg-gray-300/30 rounded-full" />
            </div>
            
            {/* Magnifying glass overlay */}
            <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-white/80 rounded-full border-4 border-gray-200/80 flex items-center justify-center shadow-lg">
              <Search size={24} className="text-gray-400" />
            </div>
            
            {/* X mark */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center shadow-md">
              <X size={14} className="text-white" strokeWidth={3} />
            </div>
            
            {/* Decorative sparkles */}
            <Sparkles 
              size={14} 
              className="absolute -bottom-4 left-0 text-blue-400" 
              strokeWidth={2}
            />
            
            {/* Curved line decoration */}
            <svg 
              className="absolute -top-6 left-0 w-12 h-12 text-gray-400/60" 
              viewBox="0 0 48 48"
              fill="none"
            >
              <path 
                d="M8 40 C8 20, 20 8, 40 8" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <circle cx="40" cy="8" r="2" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-xl font-bold text-text-heading mb-3">
        No assignments yet
      </h2>

      {/* Description */}
      <p className="text-sm text-text-muted text-center max-w-md mb-8 leading-relaxed">
        Create your first assignment to start collecting and grading student 
        submissions. You can set up rubrics, define marking criteria, and let AI 
        assist with grading.
      </p>

      {/* CTA Button */}
      <Link href="/assignments/create">
        <button className="flex items-center gap-2 px-6 py-3.5 bg-button-dark text-white rounded-full font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]">
          <Plus size={18} className="flex-shrink-0" />
          <span>Create Your First Assignment</span>
        </button>
      </Link>
    </div>
  );
}
