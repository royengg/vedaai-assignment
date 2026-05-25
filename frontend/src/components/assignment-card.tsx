"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, FileText } from "lucide-react";

interface AssignmentCardProps {
  id: string;
  subjectName: string;
  assignedOn: string;
  dueDate: string;
  onDelete?: (id: string) => void;
}

export function AssignmentCard({ id, subjectName, assignedOn, dueDate, onDelete }: AssignmentCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    // Handle DD-MM-YYYY format (due date)
    const parts = dateString.split("-");
    if (parts.length === 3 && parts[0].length === 2) {
      const [day, month, year] = parts;
      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).replace(/\//g, "-");
      }
    }

    // Fallback for ISO dates (assigned on)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, "-");
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xl relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-gray-800" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{subjectName}</h3>
        </div>
        
        {/* Three Dots Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={18} className="text-gray-400" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-2xl shadow-lg shadow-black/10 border border-gray-100 overflow-hidden z-50">
              <Link
                href={`/assignments/${id}`}
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Assignment
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete?.(id);
                }}
                className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">Assigned on : </span>
          {formatDate(assignedOn)}
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">Due : </span>
          {formatDate(dueDate)}
        </div>
      </div>
    </div>
  );
}
