import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-lg w-full relative">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title section (conditionally rendered) */}
        {title && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className={title ? 'mt-2' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}