'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

export default function ResearcherUpload() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [researchField, setResearchField] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid && data.user.role === 'researcher') {
          setUser(data.user);
          // Pre-fill research field if available in user data
          if (data.user.researchField) {
            setResearchField(data.user.researchField);
          }
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/login');
      }
    };

    verifyToken();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !paperTitle) return;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Here you would typically call your API to complete the upload
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Uploads">
      <div style={{
        marginTop: '150px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        width: '100%',
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>Upload Research Paper</h1>
        
        <div style={{ marginBottom: '30px' }}>
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

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Abstract</label>
          <textarea
            value={paperAbstract}
            onChange={(e) => setPaperAbstract(e.target.value)}
            style={{ ...inputStyle, minHeight: '100px' }}
            placeholder="Enter paper abstract (optional)"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
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
          padding: '40px',
          textAlign: 'center',
          marginBottom: '30px',
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
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '15px'
          }}>
            Choose Paper File
          </label>
          <p style={{ color: '#666', fontSize: '14px' }}>Accepted formats: PDF, DOC, DOCX</p>
          <p style={{ color: '#666', marginTop: '10px' }}>
            {selectedFile ? selectedFile.name : 'No file selected'}
          </p>
        </div>

        {selectedFile && (
          <div style={{ marginBottom: '30px' }}>
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
            onClick={() => router.back()}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !paperTitle || !researchField || uploadProgress > 0}
            style={{
              ...primaryButtonStyle,
              opacity: (!selectedFile || !paperTitle || !researchField || uploadProgress > 0) ? 0.7 : 1,
              cursor: (!selectedFile || !paperTitle || !researchField || uploadProgress > 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {uploadProgress > 0 ? 'Uploading...' : 'Submit Paper'}
          </button>
        </div>

        {uploadProgress === 100 && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#e8f5e9',
            borderRadius: '8px',
            color: '#2e7d32',
            textAlign: 'center'
          }}>
            Paper submitted successfully! Your submission is under review.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

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