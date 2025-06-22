"use client";

import { useState, useCallback } from 'react';

export default function ImageUpload({ name, label, value, onChange, error }) {
  const [preview, setPreview] = useState(value);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onChange(reader.result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleRemove = useCallback(() => {
    setPreview('');
    onChange('');
  }, [onChange]);

  return (
    <div className="mb-4">
      <label className="block text-gray-600 font-medium mb-1">{label}</label>
      
      <div className="flex items-center space-x-4">
        <label className="relative flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden">
          {preview ? (
            <>
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="mt-2 text-sm text-gray-500">Click to upload</span>
            </div>
          )}
          <input 
            type="file" 
            name={name}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
        
        <div className="flex-1">
          <p className="text-sm text-gray-500">
            {name === 'coverImage' 
              ? 'Recommended: 1200×600px (JPG/PNG)' 
              : 'Recommended: 400×400px (JPG/PNG)'}
          </p>
          {isUploading && (
            <p className="text-sm text-blue-500 mt-1">Uploading...</p>
          )}
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}