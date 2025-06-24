"use client";
import { useCallback, useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Export the interface
export interface FileUploadProps {
  name: string;
  onChange: (file: File | null) => void;
  accept?: string;
  preview?: string | File | { name: string; url: string } | null; // Add string and File types
  maxSize?: number;
  circularPreview?: boolean;
  disabled?: boolean;
}

export const FileUpload = ({
  name,
  onChange,
  accept,
  preview,
  maxSize = 5,
  circularPreview = false,
  disabled = false, // Add disabled with default value
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [onChange, maxSize, accept]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (accept && !accept.split(",").some(type => {
      const pattern = type.trim().replace('*', '.*');
      return new RegExp(pattern).test(file.type);
    })) {
      setError(`Invalid file type. Please upload ${accept} files.`);
      return;
    }

    // Validate file size (MB to bytes)
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit.`);
      return;
    }

    setError("");
    onChange(file);
  };

  const removeFile = () => {
    onChange(null);
    setError("");
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          id={name}
          name={name}
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">Click to upload</span> or
            drag and drop
          </p>
          <p className="text-xs text-gray-500">
            {accept ? `${accept} up to ${maxSize}MB` : `Files up to ${maxSize}MB`}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? 'Uploading...' : 'Add Attachment'}
      </Button>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};