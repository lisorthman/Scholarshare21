// components/PaperUploadForm.tsx
'use client';
import { useState } from 'react';

export default function PaperUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', 'Research Paper Title');
      formData.append('category', 'computer-science');
      formData.append('authorId', 'user123');
      formData.append('abstract', 'Paper abstract here...');
      formData.append('keywords', 'keyword1,keyword2,keyword3');

      const response = await fetch('/api/researcher/papers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Research Paper (PDF/DOCX)</label>
        <input 
          type="file" 
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          required
        />
      </div>
      <button 
        type="submit" 
        disabled={isUploading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isUploading ? 'Uploading...' : 'Upload Paper'}
      </button>
    </form>
  );
}