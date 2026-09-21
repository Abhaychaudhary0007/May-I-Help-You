import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, X, FileSpreadsheet } from 'lucide-react';
import { resumeApi } from '../api/client';

const FileUpload = ({
  onUploadSuccess,
  currentFile,
  onClearFile,
  uploadFn = resumeApi.uploadResume,
  accept = '.pdf,.docx,.doc,.pptx,.ppt,.txt,.rtf',
  label = 'Resume Document',
  title = 'Click to upload or drag & drop resume',
  subtitle = 'Supports PDF, Word (DOCX/DOC), PowerPoint (PPT/PPTX), TXT (Max 10MB)',
  accentColor = 'emerald', // 'emerald' | 'teal' | 'indigo'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    setError('');
    const extension = file.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt', 'rtf', 'md'];
    if (!allowed.includes(extension)) {
      setError(`Unsupported format (.${extension}). Please upload PDF, Word (DOCX/DOC), PPT, or TXT.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadFn(formData);
      onUploadSuccess(res.data.data);
    } catch (err) {
      console.error('File upload error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to upload and parse document file.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const colorStyles = {
    emerald: {
      cardBg: 'bg-emerald-50/50 border-emerald-200',
      iconBg: 'bg-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      quoteBorder: 'border-emerald-100',
      dragActive: 'border-emerald-500 bg-emerald-50/60',
      hoverBorder: 'hover:border-emerald-400',
      iconColor: 'text-emerald-600',
      iconLight: 'bg-emerald-50',
    },
    teal: {
      cardBg: 'bg-teal-50/50 border-teal-200',
      iconBg: 'bg-teal-600',
      badgeBg: 'bg-teal-100 text-teal-800',
      quoteBorder: 'border-teal-100',
      dragActive: 'border-teal-500 bg-teal-50/60',
      hoverBorder: 'hover:border-teal-400',
      iconColor: 'text-teal-600',
      iconLight: 'bg-teal-50',
    },
  }[accentColor] || {
    cardBg: 'bg-emerald-50/50 border-emerald-200',
    iconBg: 'bg-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    quoteBorder: 'border-emerald-100',
    dragActive: 'border-emerald-500 bg-emerald-50/60',
    hoverBorder: 'hover:border-emerald-400',
    iconColor: 'text-emerald-600',
    iconLight: 'bg-emerald-50',
  };

  if (currentFile) {
    const filename = currentFile.originalFilename || currentFile.filename || label;
    const fileType = currentFile.fileType || 'doc';
    const charCount = currentFile.extractedLength || currentFile.characterCount || 0;
    const preview = currentFile.previewText || '';
    const sizeKb = currentFile.fileSize ? (currentFile.fileSize / 1024).toFixed(1) : null;

    return (
      <div className={`border rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${colorStyles.cardBg}`}>
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 text-white rounded-xl shadow-sm ${colorStyles.iconBg}`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                {filename}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${colorStyles.badgeBg}`}>
                {fileType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {sizeKb ? `${sizeKb} KB • ` : ''}Parsed {charCount} characters
            </p>
            {preview && (
              <p className={`text-xs text-slate-600 mt-2 bg-white/80 p-2.5 rounded-lg border italic line-clamp-2 ${colorStyles.quoteBorder}`}>
                &ldquo;{preview}&rdquo;
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onClearFile}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
          title="Remove document"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? `${colorStyles.dragActive} scale-[0.99]`
            : `border-slate-300 ${colorStyles.hoverBorder} hover:bg-slate-50/80 bg-white`
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${colorStyles.iconLight} ${colorStyles.iconColor}`}>
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {uploading ? 'Extracting document text...' : title}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2.5 flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
