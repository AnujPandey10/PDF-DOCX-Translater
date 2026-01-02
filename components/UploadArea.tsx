import React, { useRef, useState } from 'react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    if (file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert('Currently, only PDF files are supported for high-fidelity formatting preservation.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 animate-fade-in-up">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-brand-500 bg-brand-50 scale-[1.02] shadow-xl' 
            : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50 shadow-sm'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${isDragging ? 'bg-brand-200 text-brand-700' : 'bg-slate-100 text-slate-400'}`}>
            <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-700">
              Drag & Drop your document here
            </h3>
            <p className="text-slate-500">
              or <span className="text-brand-600 font-medium hover:underline">browse files</span> to upload
            </p>
          </div>

          <div className="mt-4 flex gap-3 text-xs text-slate-400 font-medium">
            <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <i className="fa-solid fa-file-pdf mr-1.5 text-red-500"></i>PDF
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200 opacity-50 cursor-not-allowed" title="Coming Soon">
              <i className="fa-solid fa-file-word mr-1.5 text-blue-500"></i>DOCX
            </span>
          </div>
          
          <p className="text-xs text-slate-400 mt-2">Maximum file size: 10MB</p>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
