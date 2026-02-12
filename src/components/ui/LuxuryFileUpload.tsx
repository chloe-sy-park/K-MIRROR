import React, { useState } from 'react';
import * as m from 'framer-motion/m';
import { Camera, AlertCircle } from 'lucide-react';
import { pulseVariants } from '@/constants/animations';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface LuxuryFileUploadProps {
  label: string;
  secondaryLabel: string;
  preview: string | null;
  onImageSelect: (base64: string) => void;
  capture?: 'user' | 'environment';
}

const LuxuryFileUpload = ({ label, secondaryLabel, preview, onImageSelect, capture }: LuxuryFileUploadProps) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Use JPEG, PNG, or WebP');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Image must be under 10 MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      if (base64String) {
        onImageSelect(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <m.div
      className="flex-1"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">{label}</p>
      <label aria-label={`${label} — ${secondaryLabel}`} className="group relative block aspect-[4/5] bg-[#F9F9F9] rounded-[2.5rem] border border-gray-100 overflow-hidden cursor-pointer hover:border-black transition-all focus-within:ring-2 focus-within:ring-[#FF4D8D] focus-within:ring-offset-2">
        {preview ? (
          <m.img
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            src={`data:image/jpeg;base64,${preview}`}
            className="w-full h-full object-cover"
            alt="Preview"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <m.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-gray-300 group-hover:text-[#FF4D8D] group-hover:scale-110 transition-all"
            >
              <Camera size={24} />
            </m.div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-black transition-colors">{secondaryLabel}</p>
            {fileError && (
              <div className="flex items-center gap-1 mt-3 text-red-500">
                <AlertCircle size={10} />
                <span className="text-[9px] font-bold">{fileError}</span>
              </div>
            )}
          </div>
        )}
        <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={handleChange} capture={capture} aria-label={`Upload ${label}`} />
      </label>
    </m.div>
  );
};

export default LuxuryFileUpload;
