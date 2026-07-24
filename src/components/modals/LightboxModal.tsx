'use client';

import React from 'react';
import { X } from 'lucide-react';

interface LightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out animate-scale-up"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 backdrop-blur-md transition-all cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* eslint-disable-next-next/no-img-element */}
      <img
        src={imageUrl}
        alt="Enlarged view"
        className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
