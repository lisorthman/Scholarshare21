import Link from 'next/link';
import { DbResearchPaper as ResearchPaper } from '../types/research';

interface ResearchPaperCardProps {
  paper: ResearchPaper;
}

export default function ResearchPaperCard({ paper }: ResearchPaperCardProps) {
  const getStatusColor = () => {
    switch (paper.status) {
      case 'approved':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'rejected':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return { backgroundColor: '#fff3cd', color: '#856404' };
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #eee',
      borderRadius: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{paper.title}</h3>
        <p style={{ color: '#666', marginBottom: '8px' }}>{paper.researchField}</p>
        <span style={{
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px',
          ...getStatusColor()
        }}>
          {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
        </span>
      </div>
      <div>
        <Link href={paper.fileUrl} target="_blank" rel="noopener noreferrer" style={{
          padding: '8px 16px',
          backgroundColor: '#0070f3',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
        }}>
          View Paper
        </Link>
      </div>
    </div>
  );
}