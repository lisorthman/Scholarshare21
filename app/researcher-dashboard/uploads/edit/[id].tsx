'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { DbResearchPaper } from '@/types/research';

export default function EditResearchPaperPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperId = searchParams.get('id');

  const [user, setUser] = useState<User | null>(null);
  const [paperData, setPaperData] = useState<DbResearchPaper | null>(null);

  const [paperTitle, setPaperTitle] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [researchField, setResearchField] = useState('');
  const [uploadError, setUploadError] = useState('');

  const researchFields = [
    'Computer Science', 'Biology', 'Physics', 'Chemistry', 'Engineering',
    'Mathematics', 'Medicine', 'Social Sciences', 'Other', 'Uncategorized'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    const fetchUserAndPaper = async () => {
      const res = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!data.valid || data.user.role !== 'researcher') return router.push('/unauthorized');

      setUser(data.user);

      const paperRes = await fetch(`/api/researcher/papers/${paperId}`);
      const paperJson = await paperRes.json();
      setPaperData(paperJson.paper);

      // Pre-fill form
      setPaperTitle(paperJson.paper.title);
      setPaperAbstract(paperJson.paper.abstract);
      setResearchField(paperJson.paper.category);
    };

    if (paperId) fetchUserAndPaper();
  }, [paperId, router]);

  const handleUpdate = async () => {
    if (!paperTitle || !researchField || !user) {
      setUploadError('All required fields must be filled');
      return;
    }

    try {
      const response = await fetch(`/api/researcher/papers/${paperId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: paperTitle,
          abstract: paperAbstract,
          category: researchField,
        }),
      });

      if (!response.ok) throw new Error('Update failed');

      router.push('/researcher-dashboard/uploads');
    } catch (err) {
      setUploadError((err as Error).message || 'Update failed');
    }
  };

  if (!user || !paperData) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Uploads">
      <h1>Edit Research Paper</h1>
      <label>Paper Title*</label>
      <input value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} />

      <label>Abstract</label>
      <textarea value={paperAbstract} onChange={(e) => setPaperAbstract(e.target.value)} />

      <label>Research Field*</label>
      <select value={researchField} onChange={(e) => setResearchField(e.target.value)}>
        <option value="">Select research field</option>
        {researchFields.map((field) => (
          <option key={field} value={field}>{field}</option>
        ))}
      </select>

      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
      <button onClick={handleUpdate}>Update Paper</button>
    </DashboardLayout>
  );
}
