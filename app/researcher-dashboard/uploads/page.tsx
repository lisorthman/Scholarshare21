'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import ResearchPaperCard from '@/components/ResearchPaperCard';
import { DbResearchPaper } from '@/types/research';

export default function ResearcherUpload() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [researchField, setResearchField] = useState('');
  const [papers, setPapers] = useState<DbResearchPaper[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [researchFields, setResearchFields] = useState<string[]>([
    'Computer Science',
    'Biology', 
    'Physics',
    'Chemistry',
    'Engineering',
    'Mathematics',
    'Medicine',
    'Social Sciences', // Must include the 's'
    'Other',
    'Uncategorized'
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const verifyTokenAndFetchPapers = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid && data.user.role === 'researcher') {
          setUser(data.user);
          if (data.user.researchField) {
            setResearchField(data.user.researchField);
          }
          fetchPapers(data.user._id);
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      }
    };

    verifyTokenAndFetchPapers();
  }, [router]);

  const fetchPapers = async (userId: string) => {
    try {
      if (!userId || typeof userId !== 'string') {
        console.error('Invalid user ID');
        return;
      }

      const response = await fetch(`/api/researcher/papers?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch papers');
      }
      const data = await response.json();
      setPapers(data.papers);
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit');
        return;
      }
      // Validate file type (PDF, DOC, DOCX)
      if (!/\.(pdf|docx?)$/i.test(file.name)) {
        setUploadError('Invalid file type. Only PDF, DOC, or DOCX files are allowed');
        return;
      }
      setUploadError('');
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    // Validate all required fields with specific error messages
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    if (!paperTitle) {
      setUploadError('Please enter a paper title');
      return;
    }
    if (!researchField) {
      setUploadError('Please select a research category');
      return;
    }
    if (!user) {
      setUploadError('User session not found. Please log in again.');
      return;
    }
  
    // Validate user ID format
    if (!user?._id || !/^[0-9a-fA-F]{24}$/.test(user._id)) {
      setUploadError('Invalid user session. Please reload the page.');
      return;
    }
  
    // Debug: Log all form data before sending
    console.log('Form data being submitted:', {
      title: paperTitle,
      category: researchField,
      abstract: paperAbstract,
      file: selectedFile.name,
      authorId: user._id
    });
  
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
  
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', paperTitle);
    formData.append('abstract', paperAbstract);
    formData.append('category', researchField);  // Ensure this matches backend expectation
    formData.append('authorId', user._id);
  
    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  
    try {
      const response = await fetch('/api/researcher/uploads', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      // Debug: Log raw response
      const responseText = await response.text();
      console.log('Raw response:', responseText);
  
      if (!response.ok) {
        throw new Error(responseText || 'Upload failed with unknown error');
      }
  
      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
  
      // Verify the returned paper contains the correct category
      if (!data.paper || data.paper.category !== researchField) {
        console.warn('Category mismatch in response:', {
          sent: researchField,
          received: data.paper?.category
        });
      }
  
      setPapers([data.paper, ...papers]);
      setUploadProgress(100);
      
      // Show success message briefly before closing form
      setUploadError(''); // Clear any previous errors
      setTimeout(() => {
        setShowUploadForm(false);
        resetForm();
      }, 2000);
  
    } catch (error) {
      console.error('Upload error details:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Upload failed for unknown reason';
      
      setUploadError(errorMessage);
      
      // Specific handling for category-related errors
      if (typeof errorMessage === 'string' && errorMessage.includes('category')) {
        setUploadError('Invalid research category. Please select a valid option.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPaperTitle('');
    setPaperAbstract('');
    setResearchField(user?.researchField || '');
    setUploadProgress(0);
    setUploadError('');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px' }}>Your Research Papers</h1>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {showUploadForm ? 'Cancel' : 'Add New'}
          </button>
        </div>

        {showUploadForm && (
          <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '10px' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Upload New Research Paper</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Paper Title*</label>
              <input
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                style={inputStyle}
                placeholder="Enter your paper title"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Abstract</label>
              <textarea
                value={paperAbstract}
                onChange={(e) => setPaperAbstract(e.target.value)}
                style={{ ...inputStyle, minHeight: '100px' }}
                placeholder="Enter paper abstract (optional)"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Research Field*</label>
  <select
    value={researchField}
    onChange={(e) => {
      console.log('Selected category:', e.target.value); // Debug log
      setResearchField(e.target.value);
    }}
    style={inputStyle}
    required
    name="category" // Add name attribute
  >
    <option value="">Select research field</option>
    {researchFields.map((field) => (
      <option key={field} value={field} selected={field === researchField}>
        {field}
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
                id="paper-upload"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="paper-upload" style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#0070f3',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}>
                Choose Paper File
              </label>
              <p style={{ color: '#666', fontSize: '14px' }}>Accepted formats: PDF, DOC, DOCX (Max 10MB)</p>
              <p style={{ color: '#666', marginTop: '10px' }}>
                {selectedFile ? selectedFile.name : 'No file selected'}
              </p>
            </div>

            {selectedFile && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>File: {selectedFile.name}</span>
                  <span>{Math.round(selectedFile.size / 1024)} KB</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#eee',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: '#0070f3',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <p style={{ textAlign: 'right', marginTop: '5px', color: '#666' }}>
                  {uploadProgress}%
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  resetForm();
                }}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !paperTitle || !researchField || isUploading}
                style={{
                  ...primaryButtonStyle,
                  opacity: (!selectedFile || !paperTitle || !researchField || isUploading) ? 0.7 : 1,
                  cursor: (!selectedFile || !paperTitle || !researchField || isUploading) ? 'not-allowed' : 'pointer'
                }}
              >
                {isUploading ? 'Uploading...' : 'Submit Paper'}
              </button>
            </div>
          </div>
        )}

        {papers.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {papers.map((paper) => (
              <ResearchPaperCard key={paper._id.toString()} paper={paper} />
            ))}
          </div>
        ) : (
          <p>No papers uploaded yet.</p>
        )}
      </div>
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
