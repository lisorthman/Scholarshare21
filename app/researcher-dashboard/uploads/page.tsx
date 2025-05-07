'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { DbResearchPaper } from '@/types/research';
import { Download, Edit2, Search } from 'lucide-react';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
}

export default function ResearcherUpload() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [papers, setPapers] = useState<DbResearchPaper[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // State for deletion confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);

  // Filter papers based on search term and status
  const filteredPapers = useMemo(() => {
    return papers.filter(paper => {
      const matchesSearch = searchTerm === '' || 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof paper.category === 'string' 
          ? paper.category.toLowerCase().includes(searchTerm.toLowerCase())
          : paper.categoryDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || paper.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [papers, searchTerm, statusFilter]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const verifyTokenAndFetchData = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid && data.user.role === 'researcher') {
          setUser(data.user);
          fetchPapers(data.user._id);
          fetchCategories();
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      }
    };

    verifyTokenAndFetchData();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/fetch-category');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setUploadError('Failed to load categories. Please try again later.');
    }
  };

  const fetchPapers = async (userId: string) => {
    try {
      const response = await fetch(`/api/researcher/papers?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error('Failed to fetch papers');
      const data = await response.json();
      setPapers(data.papers);
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit');
        return;
      }
      if (!/\.(pdf|docx?)$/i.test(file.name)) {
        setUploadError('Invalid file type. Only PDF, DOC, or DOCX files are allowed');
        return;
      }
      setUploadError('');
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !paperTitle || !categoryId || !user) {
      setUploadError('Please fill all required fields');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', paperTitle);
    formData.append('abstract', paperAbstract);
    formData.append('category', categoryId);
    formData.append('authorId', user._id);

    try {
      const response = await fetch('/api/researcher/uploads', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setPapers([data.paper, ...papers]);
      setUploadProgress(100);
      setTimeout(() => {
        setShowUploadForm(false);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (paperId: string) => {
    router.push(`/researcher-dashboard/uploads/edit/${paperId}`);
  };

  const handleDeleteClick = (paperId: string) => {
    setPaperToDelete(paperId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!paperToDelete) return;
    
    try {
      const response = await fetch(`/api/researcher/uploads/${paperToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete paper');
      
      setPapers(papers.filter(paper => paper._id !== paperToDelete));
      toast.success('Paper deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Deletion failed');
    } finally {
      setShowConfirm(false);
      setPaperToDelete(null);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPaperTitle('');
    setPaperAbstract('');
    setCategoryId('');
    setUploadProgress(0);
    setUploadError('');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Uploads">
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Your Research Papers</h1>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={styles.uploadButton}
          >
            {showUploadForm ? 'Cancel' : 'Add New'}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div style={styles.filterContainer}>
          <div style={styles.searchInputContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search papers by title, abstract or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            style={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {showUploadForm && (
          <div style={styles.uploadForm}>
            <h2 style={styles.formTitle}>Upload New Research Paper</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Paper Title*</label>
              <input
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                style={styles.input}
                placeholder="Enter your paper title"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Abstract</label>
              <textarea
                value={paperAbstract}
                onChange={(e) => setPaperAbstract(e.target.value)}
                style={{...styles.input, ...styles.textarea}}
                placeholder="Enter paper abstract (optional)"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Research Category*</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
                id="paper-upload"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="paper-upload" style={styles.fileButton}>
                Choose Paper File
              </label>
              <p style={styles.fileHint}>Accepted formats: PDF, DOC, DOCX (Max 10MB)</p>
              {selectedFile && (
                <p style={styles.fileSelected}>
                  {selectedFile.name}
                </p>
              )}
            </div>

            {uploadError && (
              <div style={styles.errorBox}>
                {uploadError}
              </div>
            )}

            {selectedFile && (
              <div style={styles.progressContainer}>
                <div style={styles.progressHeader}>
                  <span>Upload Progress</span>
                  <span>{Math.round(selectedFile.size / 1024)} KB</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{...styles.progressFill, width: `${uploadProgress}%`}}></div>
                </div>
                <p style={styles.progressPercent}>{uploadProgress}%</p>
              </div>
            )}

            <div style={styles.formActions}>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  resetForm();
                }}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !paperTitle || !categoryId || isUploading}
                style={{
                  ...styles.primaryButton,
                  opacity: (!selectedFile || !paperTitle || !categoryId || isUploading) ? 0.7 : 1,
                  cursor: (!selectedFile || !paperTitle || !categoryId || isUploading) ? 'not-allowed' : 'pointer'
                }}
              >
                {isUploading ? 'Uploading...' : 'Submit Paper'}
              </button>
            </div>
          </div>
        )}

{filteredPapers.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeaderCell}>Paper Title</th>
                  <th style={styles.tableHeaderCell}>Category</th>
                  <th style={styles.tableHeaderCell}>Submitted Date</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.map((paper) => (
                  <tr key={paper._id.toString()} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.paperTitle}>{paper.title}</div>
                      {paper.abstract && (
                        <div style={styles.paperAbstract}>
                          {paper.abstract.substring(0, 80)}...
                        </div>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {typeof paper.category === 'string' 
                        ? paper.category 
                        : paper.categoryDetails?.name || 'Uncategorized'}
                    </td>
                    <td style={styles.tableCell}>
                      {new Date(paper.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: paper.status === 'approved' ? '#ECFDF5' : 
                                        paper.status === 'pending' ? '#FFFBEB' : 
                                        paper.status === 'rejected' ? '#FEF2F2' : '#F3F4F6',
                        color: paper.status === 'approved' ? '#065F46' : 
                              paper.status === 'pending' ? '#92400E' : 
                              paper.status === 'rejected' ? '#B91C1C' : '#4B5563'
                      }}>
                        {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.downloadButton}
                          download
                        >
                          <Download size={16} style={styles.buttonIcon} />
                        </a>
                        <button 
                          onClick={() => handleEdit(paper._id.toString())}
                          style={styles.editButton}
                        >
                          <Edit2 size={16} style={styles.buttonIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>
              {searchTerm ? 'No matching papers found' : 'No papers uploaded yet'}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm 
                ? 'Try adjusting your search query'
                : 'Get started by uploading your first research paper'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowUploadForm(true)}
                style={styles.emptyButton}
              >
                Upload Paper
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    margin: '24px auto',
    maxWidth: '1300px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  filterContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    alignItems: 'center',
  },
  filterSelect: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    fontFamily: '"Space Grotesk", sans-serif',
    backgroundColor: '#fff',
    minWidth: '180px',
  },
  deleteButton: {
    padding: '8px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#dc2626',
    },
  },
  confirmModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  confirmContent: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  confirmTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1a1a1a',
  },
  confirmText: {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  confirmButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#e5e7eb',
    },
  },
  deleteConfirmButton: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#dc2626',
    },
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0',
  },
  uploadButton: {
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
    gap: '8px',
  },
  searchContainer: {
    marginBottom: '24px',
    width: '100%',
  },
  searchInputContainer: {
    position: 'relative',
    maxWidth: '600px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    boxSizing: 'border-box',
    fontFamily: '"Space Grotesk", sans-serif',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s ease',
  },
  tableContainer: {
    border: '1px solid #E0D8C3',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  tableHeaderRow: {
    backgroundColor: '#F8F5ED',
  },
  tableHeaderCell: {
    padding: '16px 24px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#5F5F5F',
    fontSize: '16px',
    borderBottom: '1px solid #E0D8C3',
  },
  tableRow: {
    borderBottom: '1px solid #E0D8C3',
  },
  tableCell: {
    padding: '16px 24px',
    verticalAlign: 'middle',
  },
  paperTitle: {
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: '8px',
    fontSize: '16px',
  },
  paperAbstract: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.4',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '100px',
    textAlign: 'center',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  downloadButton: {
    padding: '8px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  },
  editButton: {
    padding: '8px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  },
  buttonIcon: {
    width: '18px',
    height: '18px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    border: '1px dashed #E0D8C3',
    borderRadius: '12px',
    backgroundColor: '#FCFAF6',
    marginTop: '24px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 24px',
    textAlign: 'center',
  },
  emptyButton: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  uploadForm: {
    marginBottom: '32px',
    padding: '32px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#f9fafb',
  },
  formTitle: {
    fontSize: '24px',
    marginBottom: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#374151',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    boxSizing: 'border-box',
    fontFamily: '"Space Grotesk", sans-serif',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s ease',
  },
  textarea: {
    minHeight: '120px',
    resize: 'vertical',
  },
  fileDropzone: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    marginBottom: '24px',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
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
    transition: 'all 0.2s ease',
  },
  fileHint: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '8px 0 0',
  },
  fileSelected: {
    color: '#374151',
    marginTop: '16px',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px',
  },
  progressContainer: {
    marginBottom: '24px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#4b5563',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    transition: 'width 0.3s ease',
  },
  progressPercent: {
    textAlign: 'right',
    marginTop: '4px',
    fontSize: '14px',
    color: '#4b5563',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
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
    transition: 'background-color 0.2s ease',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};