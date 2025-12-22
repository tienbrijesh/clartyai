
import React, { useRef, useState } from 'react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.includes('video') || file.name.endsWith('.webm'))) {
      onUpload(file);
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative cursor-pointer transition-all duration-500 ${
        isDragging ? 'scale-[1.005]' : ''
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleFileChange}
      />

      <div className={`interface-card p-20 md:p-32 rounded flex flex-col items-center justify-center space-y-10 transition-all border-dashed border-2 ${
        isDragging ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:bg-white/[0.01]'
      }`}>
        <div className="w-12 h-12 flex items-center justify-center text-slate-600 transition-colors group-hover:text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 4v16m8-8H4" />
          </svg>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-white tracking-widest uppercase">Process a meeting</p>
          <p className="text-[10px] text-slate-600 text-monospace tracking-[0.2em] uppercase">Select source recording</p>
        </div>
      </div>
    </div>
  );
};
