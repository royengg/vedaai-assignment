"use client";

import { Calendar } from "lucide-react";

interface DueDateInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function DueDateInput({ value, onChange }: DueDateInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-800 block">
        Due Date
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="DD-MM-YYYY"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-full border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
        />
        <Calendar 
          size={18} 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" 
        />
      </div>
    </div>
  );
}
