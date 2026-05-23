"use client";

import { Mic } from "lucide-react";

interface AdditionalInfoProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function AdditionalInfo({ value, onChange }: AdditionalInfoProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-800 block">
        Additional Information (For better output)
      </label>
      <div className="relative">
        <textarea
          placeholder="e.g Generate a question paper for 3 hour exam duration..."
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors resize-none"
        />
        <button 
          className="absolute bottom-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Voice input"
        >
          <Mic size={16} />
        </button>
      </div>
    </div>
  );
}
