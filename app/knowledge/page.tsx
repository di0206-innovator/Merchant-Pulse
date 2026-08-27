'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, FileAudio, Trash2, CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

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

  const handleFiles = (newFiles: File[]) => {
    const mapped: UploadedFile[] = newFiles.map(f => {
      let type: 'pdf' | 'audio' | 'other' = 'other';
      if (f.type.includes('pdf')) type = 'pdf';
      if (f.type.includes('audio')) type = 'audio';

      return {
        id: Math.random().toString(36).substring(7),
        name: f.name,
        type,
        status: 'processing',
        size: (f.size / 1024 / 1024).toFixed(2) + ' MB'
      };
    });

    setFiles(prev => [...prev, ...mapped]);

    // Simulate RAG pipeline processing
    mapped.forEach(f => {
      setTimeout(() => {
        setFiles(prev => prev.map(file => 
          file.id === f.id ? { ...file, status: 'ready' } : file
        ));
      }, 3000 + Math.random() * 2000);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
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
            className={`border-2 border-dashed ${isDragging ? 'border-nb-yellow bg-nb-yellow/5' : 'border-nb-stroke/30 bg-nb-bg/50'} p-12 text-center transition-colors relative cursor-pointer`}
          >
            <input 
              type="file" 
              multiple 
              accept=".pdf,.mp3,.wav,.txt,.docx"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-nb-yellow' : 'text-nb-muted'}`} />
              <p className="font-mono text-sm font-bold text-nb-white">
                Drag & Drop files here or click to browse
              </p>
              <p className="font-mono text-[10px] text-nb-muted mt-2">
                Supported: PDF, DOCX, MP3, WAV (Max 50MB)
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
                <div key={file.id} className="border-2 border-nb-stroke/20 p-3 flex items-center justify-between bg-nb-bg">
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
                      <span className="nb-chip border-nb-yellow text-nb-yellow bg-nb-yellow/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow animate-pulse" />
                        Extracting...
                      </span>
                    ) : (
                      <span className="nb-chip border-nb-green text-nb-green bg-nb-green/10">
                        <CheckCircle2 className="w-3 h-3" />
                        Vectorized
                      </span>
                    )}
                    
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="text-nb-muted hover:text-nb-red transition-colors"
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
