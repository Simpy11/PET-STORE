import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageUpload({ onUploadComplete, onUploadingChange }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const uploadController = useRef(null);
  useEffect(() => () => { uploadController.current?.abort(); }, []);
  useEffect(() => () => { if (preview?.url) URL.revokeObjectURL(preview.url); }, [preview]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileProcess = async (file) => {
    if (!file || loading) return;

    // Validate type
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError('Please upload a valid image (PNG, JPG, WEBP).');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview({ url: objectUrl, name: file.name });
    setError('');

    await uploadImage(file);
  };

  const handleFileChange = (e) => {
    handleFileProcess(e.target.files[0]);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const uploadImage = async (file) => {
    setLoading(true);
    onUploadingChange?.(true);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError('Cloudinary configuration is missing. Check .env variables.');
      setLoading(false);
      onUploadingChange?.(false);
      setPreview(null);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    uploadController.current = new AbortController();
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        { timeout: 30000, signal: uploadController.current.signal }
      );

      if (response.data && response.data.secure_url) {
        onUploadComplete(response.data.secure_url, file.name);
      } else {
        throw new Error('Invalid response from Cloudinary');
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Upload Error:', err);
      const apiErrorMessage = err.response?.data?.error?.message || err.message;
      setError(`Upload Failed: ${apiErrorMessage}`);
      setPreview(null);
      onUploadComplete('');
    } finally {
      setLoading(false);
      onUploadingChange?.(false);
    }
  };

  const removeImage = () => {
    uploadController.current?.abort();
    setLoading(false);
    setPreview(null);
    setError('');
    onUploadComplete('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 text-xs font-bold text-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <X className="h-4 w-4" /> {error}
          </motion.p>
        )}
      </AnimatePresence>

      {!preview ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer mt-1 flex justify-center rounded-[2rem] border-2 border-dashed transition-all duration-300 px-6 py-14 overflow-hidden group ${
            isDragging
              ? 'border-brand-500 bg-brand-500/5'
              : 'border-slate-300 dark:border-slate-800 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
          }`}
        >
          {/* Subtle animated background glow on drag */}
          {isDragging && (
            <div className="absolute inset-0 bg-brand-500/10 blur-3xl animate-pulse -z-10" />
          )}

          <div className="text-center relative z-10">
            <motion.div
              animate={isDragging ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
              className="mx-auto h-16 w-16 mb-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-brand-500 group-hover:text-brand-600 group-hover:-translate-y-1 transition-all"
            >
              <UploadCloud className="h-8 w-8" aria-hidden="true" />
            </motion.div>
            <div className="mt-4 flex flex-col sm:flex-row text-sm leading-6 text-slate-600 dark:text-slate-400 justify-center gap-1 font-medium">
              <span className="text-brand-600 dark:text-brand-400 font-bold">Select a file</span>
              <span>or drag and drop here</span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              PNG, JPG, WEBP up to 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mt-1 rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 group"
        >
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
               <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
               <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest animate-pulse">Uploading to Cloud...</p>
            </div>
          )}

          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <img src={preview.url} alt="Preview" className="w-full h-64 object-cover" />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
            disabled={loading}
            className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shadow-xl transition-colors disabled:opacity-50 border border-white/20"
          >
            <X className="w-4 h-4" />
          </motion.button>

          <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
             <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <ImageIcon className="h-3 w-3 text-white/70" />
                <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{preview.name}</span>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
