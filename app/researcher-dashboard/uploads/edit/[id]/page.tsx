'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { UploadCloud, X, Check, FileText } from 'react-feather';

interface Category {
  _id: string;
  name: string;
}

export default function EditPaperPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [paper, setPaper] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '', // Changed from category to categoryId
    abstract: '',
    file: null as File | null
  });
  const [categories, setCategories] = useState<Category[]>([]); // Replaced researchFields
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const verifyTokenAndFetchData = async () => {
      try {
        // Verify token
        const userResponse = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const userData = await userResponse.json();
        if (!userData.valid || userData.user.role !== 'researcher') {
          router.push('/unauthorized');
          return;
        }
        setUser(userData.user);

        // Fetch categories first
        const categoriesResponse = await fetch('/api/admin/fetch-category');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch paper data
        const paperResponse = await fetch(`/api/researcher/uploads/${params.id}`);
        if (!paperResponse.ok) throw new Error('Failed to fetch paper');
        
        const paperData = await paperResponse.json();
        setPaper(paperData);
        setFormData({
          title: paperData.title,
          categoryId: paperData.categoryId?._id || paperData.categoryId || '', // Handle both populated and raw ID
          abstract: paperData.abstract || '',
          file: null
        });
        setFileName(paperData.fileName);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load paper data');
        router.push('/researcher-dashboard/uploads');
      } finally {
        setIsLoading(false);
      }
    };

    verifyTokenAndFetchData();
  }, [params.id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      if (!/\.(pdf|docx?)$/i.test(file.name)) {
        toast.error('Only PDF, DOC, or DOCX files are allowed');
        return;
      }
      setFormData({ ...formData, file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('category', formData.categoryId); // Now sending category ID
      formPayload.append('abstract', formData.abstract);
      if (formData.file) formPayload.append('file', formData.file);

      const res = await fetch(`/api/researcher/uploads/${params.id}`, {
        method: 'PATCH',
        body: formPayload,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Update failed');
      }

      const result = await res.json();
      toast.success('Paper updated successfully!');
      router.push('/researcher-dashboard/uploads');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update paper');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Uploads">
      <div style={{
        marginTop: '50px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0070f3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : !paper ? (
          <p style={{ color: '#ff0000', textAlign: 'center' }}>Paper not found</p>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px' }}>Edit Research Paper</h1>
              <button
                onClick={() => router.push('/researcher-dashboard/uploads')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#0070f3',
                  border: '1px solid #0070f3',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <X size={18} />
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Paper Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter your paper title"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Abstract</label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                  style={{ ...inputStyle, minHeight: '100px' }}
                  placeholder="Enter paper abstract (optional)"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Research Category*</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  style={inputStyle}
                  required
                  disabled={categories.length === 0}
                >
                  <option value="">{categories.length === 0 ? 'Loading categories...' : 'Select a category'}</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '20px',
                backgroundColor: '#f9f9f9'
              }}>
                <input
                  type="file"
                  id="paper-upload-edit"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="paper-upload-edit" style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#0070f3',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: 'fit-content',
                  margin: '0 auto'
                }}>
                  <UploadCloud size={16} />
                  Choose New File
                </label>
                <p style={{ color: '#666', fontSize: '14px' }}>Accepted formats: PDF, DOC, DOCX (Max 10MB)</p>
                {fileName ? (
                  <p style={{ color: '#666', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FileText size={14} />
                    {fileName}
                  </p>
                ) : (
                  <p style={{ color: '#666', marginTop: '10px' }}>
                    Current file: {paper.fileName} ({Math.round(paper.fileSize / 1024)} KB)
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => router.push('/researcher-dashboard/uploads')}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    ...primaryButtonStyle,
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '16px',
  boxSizing: 'border-box' as const,
};

const primaryButtonStyle = {
  backgroundColor: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '16px',
};

const secondaryButtonStyle = {
  backgroundColor: '#f4f4f4',
  color: '#0070f3',
  border: '1px solid #0070f3',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '16px',
};