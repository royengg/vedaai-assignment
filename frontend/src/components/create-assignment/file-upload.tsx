"use client";

import { Upload } from "lucide-react";

export function FileUpload() {
  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
        {/* Upload Icon */}
        <div className="mb-4">
          <Upload size={32} className="text-gray-400" />
        </div>
        
        {/* Main Text */}
        <p className="text-sm font-medium text-gray-700 mb-1">
          Choose a file or drag & drop it here
        </p>
        
        {/* File Types */}
        <p className="text-xs text-gray-400 mb-4">
          JPEG, PNG, upto 10MB
        </p>
        
        {/* Browse Button */}
        <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
          Browse Files
        </button>
      </div>
      
      {/* Subtitle */}
      <p className="text-sm text-gray-500 text-center">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
