import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

export const FileUpload = ({ onFileSelect, acceptedTypes = ['.pdf'], maxSizeBytes = 10 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;

    const extension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      setError(`Unsupported file type. Please upload: ${acceptedTypes.join(', ')}`);
      return false;
    }

    if (selectedFile.size > maxSizeBytes) {
      setError(`File is too large. Max size is ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB`);
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        simulateUpload(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        simulateUpload(selectedFile);
      }
    }
  };

  const simulateUpload = (selectedFile) => {
    setUploading(true);
    setProgress(0);
    setFile(selectedFile);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          onFileSelect(selectedFile);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer w-full py-10 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-500/10 scale-[0.99] neon-glow-active'
                : 'border-slate-800 bg-dark-900/40 hover:border-brand-500/50 hover:bg-brand-500/5'
            }`}
          >
            <div className={`p-4 rounded-full mb-4 transition-colors ${dragActive ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800/50 text-slate-400'}`}>
              <Upload className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-slate-200 text-center">
              Drag & Drop file or <span className="text-brand-400 hover:text-brand-300">browse</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Supports: {acceptedTypes.join(', ')} (Max size: ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB)
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file-info"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full p-5 border border-slate-800 rounded-2xl bg-dark-900/60 flex items-center justify-between animate-fade-in"
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-200 truncate">{file.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                
                <div className="w-full bg-slate-850 h-1.5 rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              {uploading ? (
                <span className="text-xs font-semibold text-brand-400">{progress}%</span>
              ) : (
                <div className="text-accent-500">
                  <CheckCircle className="h-5 w-5 animate-scale-in" />
                </div>
              )}
              <button
                onClick={removeFile}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center space-x-2 text-danger-500 mt-3 text-xs bg-danger-500/10 px-3 py-2.5 rounded-xl border border-danger-500/20"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
