'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, FileText, FileAudio, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { createClient } from '@/lib/supabase/client';

interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'audio' | 'other';
  status: 'processing' | 'ready' | 'error';
  size: string;
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Fetch previously uploaded documents on mount
    async function loadDocuments() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return;

      const loadedFiles: UploadedFile[] = data.map(doc => ({
        id: doc.id,
        name: doc.filename,
        type: doc.file_type === 'pdf' ? 'pdf' : (doc.file_type === 'audio' ? 'audio' : 'other'),
        status: doc.status.toLowerCase() as any,
        size: (doc.file_size_bytes / 1024 / 1024).toFixed(2) + ' MB'
      }));
      
      setFiles(loadedFiles);
    }
    loadDocuments();
  }, [supabase]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const processFile = async (fileObj: File, uiId: string) => {
    if (!supabase) return;

    try {
      // 1. Insert into DB to get UUID
      const { data: docData, error: dbError } = await supabase
        .from('knowledge_documents')
        .insert({
          filename: fileObj.name,
          file_type: fileObj.type.includes('pdf') ? 'pdf' : (fileObj.type.includes('audio') ? 'audio' : 'text'),
          storage_path: 'pending',
          file_size_bytes: fileObj.size,
          status: 'UPLOADING'
        })
        .select()
        .single();

      if (dbError || !docData) throw new Error('Database insert failed');
      const documentId = docData.id;

      // Update UI ID to match real ID
      setFiles(prev => prev.map(f => f.id === uiId ? { ...f, id: documentId } : f));

      // 2. Upload to storage
      const storagePath = `documents/${documentId}-${fileObj.name}`;
      const { error: storageError } = await supabase.storage
        .from('knowledge_base')
        .upload(storagePath, fileObj);

      if (storageError) throw new Error('Storage upload failed');

      // Update storage path in DB
      await supabase
        .from('knowledge_documents')
        .update({ storage_path: storagePath, status: 'PROCESSING' })
        .eq('id', documentId);

      // 3. Trigger API for Gemini ingestion
      setFiles(prev => prev.map(f => f.id === documentId ? { ...f, status: 'processing' } : f));

      const res = await fetch('/api/knowledge/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentId, 
          storagePath, 
          merchantId: 'rzp_merchant_main' 
        })
      });

      if (!res.ok) throw new Error('AI processing failed');

      // Update UI to ready
      setFiles(prev => prev.map(f => f.id === documentId ? { ...f, status: 'ready' } : f));

    } catch (err) {
      console.error(err);
      setFiles(prev => prev.map(f => f.id === uiId || f.id === (err as any).documentId ? { ...f, status: 'error' } : f));
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    // Validate sizes
    const validFiles = newFiles.filter(f => f.size <= 20 * 1024 * 1024);
    if (validFiles.length < newFiles.length) {
      alert('Some files were ignored because they exceed the 20MB limit.');
    }

    const initialFiles: UploadedFile[] = validFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      name: f.name,
      type: f.type.includes('pdf') ? 'pdf' : (f.type.includes('audio') ? 'audio' : 'other'),
      status: 'processing',
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB'
    }));

    setFiles(prev => [...prev, ...initialFiles]);
    setIsUploading(true);

    for (let i = 0; i < validFiles.length; i++) {
      await processFile(validFiles[i], initialFiles[i].id);
    }
    
    setIsUploading(false);
  };

  const removeFile = async (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (supabase) {
      // Optimistic delete, actual delete would require cleaning up storage too
      await supabase.from('knowledge_documents').delete().eq('id', id);
    }
  };

  return (
    <AppLayout>
      <div className="nb-page max-w-4xl">
        <header className="nb-page-header">
          <div>
            <h1 className="font-black uppercase tracking-tight text-nb-white text-xl">
              Knowledge Base
            </h1>
            <p className="font-mono text-[10px] text-nb-muted mt-1 uppercase tracking-wide">
              Multimodal RAG Ingestion · Text-to-Text · Speech-to-Text
            </p>
          </div>
        </header>

        <section className="nb-panel p-6">
          <div className="mb-4">
            <h2 className="font-bold font-mono text-sm uppercase text-nb-white tracking-widest">
              Upload Business Context
            </h2>
            <p className="text-xs text-nb-muted font-mono mt-1">
              Upload PDF refund policies or MP3/WAV support call recordings. MerchantPulse AI uses this via Vector RAG to handle disputes intelligently.
            </p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed ${isDragging ? 'border-nb-yellow bg-nb-yellow/5' : 'border-nb-stroke bg-nb-bg/50'} p-12 text-center transition-colors relative cursor-pointer`}
            style={{ borderColor: isDragging ? 'var(--nb-yellow)' : 'color-mix(in srgb, var(--nb-stroke) 30%, transparent)' }}
          >
            <input 
              type="file" 
              multiple 
              accept=".pdf,.mp3,.wav,.txt,.docx"
              onChange={handleFileInput}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-nb-yellow' : 'text-nb-muted'}`} />
              <p className="font-mono text-sm font-bold text-nb-white">
                {isUploading ? 'Processing upload...' : 'Drag & Drop files here or click to browse'}
              </p>
              <p className="font-mono text-[10px] text-nb-muted mt-2">
                Supported: PDF, DOCX, MP3, WAV (Max 20MB)
              </p>
            </div>
          </div>
        </section>

        {files.length > 0 && (
          <section className="nb-panel p-6">
            <h2 className="font-bold font-mono text-sm uppercase text-nb-white tracking-widest mb-4">
              Ingested Documents
            </h2>
            <div className="space-y-3">
              {files.map(file => (
                <div key={file.id} className="border-2 border-nb-stroke p-3 flex items-center justify-between bg-nb-bg" style={{ borderColor: 'color-mix(in srgb, var(--nb-stroke) 20%, transparent)' }}>
                  <div className="flex items-center gap-3">
                    {file.type === 'pdf' ? (
                      <FileText className="w-5 h-5 text-nb-blue" />
                    ) : file.type === 'audio' ? (
                      <FileAudio className="w-5 h-5 text-nb-yellow" />
                    ) : (
                      <FileText className="w-5 h-5 text-nb-muted" />
                    )}
                    <div>
                      <p className="font-mono text-xs font-bold text-nb-white">{file.name}</p>
                      <p className="font-mono text-[10px] text-nb-muted">{file.size}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {file.status === 'processing' ? (
                      <span className="nb-chip border-nb-yellow text-nb-yellow" style={{ backgroundColor: 'color-mix(in srgb, var(--nb-yellow) 10%, transparent)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow animate-pulse" />
                        Extracting...
                      </span>
                    ) : file.status === 'ready' ? (
                      <span className="nb-chip border-nb-green text-nb-green" style={{ backgroundColor: 'color-mix(in srgb, var(--nb-green) 10%, transparent)' }}>
                        <CheckCircle2 className="w-3 h-3" />
                        Vectorized
                      </span>
                    ) : (
                      <span className="nb-chip border-nb-red text-nb-red" style={{ backgroundColor: 'color-mix(in srgb, var(--nb-red) 10%, transparent)' }}>
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                    
                    <button 
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading}
                      className="text-nb-muted hover:text-nb-red transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
