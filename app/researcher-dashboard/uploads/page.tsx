'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import ResearchPaperCard from '@/components/ResearchPaperCard';
import { ResearchPaper } from '@/types/research';

export default function ResearcherUpload() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [researchField, setResearchField] = useState('');
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
      setUploadError('');
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !paperTitle || !researchField || !user) return;
  
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
  
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', paperTitle);
    formData.append('researchField', researchField);
    formData.append('authorId', user._id);
  
    try {
      const response = await fetch('/api/researcher/uploads', { // Update this path
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) throw new Error(await response.text());
      
      const data = await response.json();
      setPapers([data.paper, ...papers]);
      setUploadProgress(100);
      setTimeout(() => setShowUploadForm(false), 2000);
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
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
                onChange={(e) => setResearchField(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Select research field</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Engineering">Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Medicine">Medicine</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Other">Other</option>
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
              <ResearchPaperCard key={paper._id} paper={paper} />
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px',
            color: '#666'
          }}>
            {showUploadForm ? 'Fill the form to upload your first paper' : 'You have not uploaded any papers yet'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ... (keep the same style constants as before)

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '16px',
};

const primaryButtonStyle = {
  backgroundColor: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '16px',
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  backgroundColor: 'transparent',
  color: '#0070f3',
  border: '1px solid #0070f3',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '16px',
  cursor: 'pointer',
};