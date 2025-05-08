'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { UploadCloud, X, Check, FileText, Trash2 } from 'react-feather';

interface Category {
  _id: string;
  name: string;
}

export default function EditPaperPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [paper, setPaper] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    abstract: '',
    file: null as File | null
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
          categoryId: paperData.categoryId?._id || paperData.categoryId || '',
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
      formPayload.append('category', formData.categoryId);
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this research paper? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/researcher/uploads/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete paper');
      }

      toast.success('Paper deleted successfully!');
      router.push('/researcher-dashboard/uploads');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete paper');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Uploads">
      <div style={styles.container}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
          </div>
        ) : !paper ? (
          <p style={styles.notFoundText}>Paper not found</p>
        ) : (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Edit Research Paper</h1>
              <button
                onClick={() => router.push('/researcher-dashboard/uploads')}
                style={styles.cancelButton}
              >
                <X size={18} />
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Paper Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={styles.input}
                  placeholder="Enter your paper title"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Abstract</label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                  style={{ ...styles.input, ...styles.textarea }}
                  placeholder="Enter paper abstract (optional)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Research Category*</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  style={styles.input}
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

              <div style={styles.fileDropzone}>
                <input
                  type="file"
                  id="paper-upload-edit"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="paper-upload-edit" style={styles.fileButton}>
                  <UploadCloud size={16} />
                  Choose New File
                </label>
                <p style={styles.fileHint}>Accepted formats: PDF, DOC, DOCX (Max 10MB)</p>
                {fileName ? (
                  <p style={styles.fileSelected}>
                    <FileText size={14} />
                    {fileName}
                  </p>
                ) : (
                  <p style={styles.currentFile}>
                    Current file: {paper.fileName} ({Math.round(paper.fileSize / 1024)} KB)
                  </p>
                )}
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    ...styles.deleteButton,
                    opacity: isDeleting ? 0.7 : 1,
                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isDeleting ? (
                    <>
                      <div style={styles.smallSpinner}></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Paper
                    </>
                  )}
                </button>
                <div style={styles.actionGroup}>
                  <button
                    type="button"
                    onClick={() => router.push('/researcher-dashboard/uploads')}
                    style={styles.secondaryButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      ...styles.primaryButton,
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={styles.smallSpinner}></div>
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

const styles = {
  container: {
    margin: '24px auto',
    maxWidth: '1200px',
    width: '95%',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0070f3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  notFoundText: {
    color: '#ff0000',
    textAlign: 'center'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    color: '#0070f3',
    border: '1px solid #0070f3',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  form: {
    marginBottom: '40px'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#374151',
    fontSize: '16px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
    fontFamily: '"Space Grotesk", sans-serif',
    backgroundColor: '#fff'
  },
  textarea: {
    minHeight: '120px',
    resize: 'vertical' as const
  },
  fileDropzone: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    marginBottom: '24px',
    backgroundColor: '#fff'
  },
  fileButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '12px',
    fontWeight: '500',
    fontSize: '16px'
  },
  fileHint: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '8px 0 0'
  },
  fileSelected: {
    color: '#374151',
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '500'
  },
  currentFile: {
    color: '#666',
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px'
  },
  actionGroup: {
    display: 'flex',
    gap: '16px'
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};