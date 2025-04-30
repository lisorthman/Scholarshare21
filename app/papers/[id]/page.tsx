import GenerateCitation from '@/components/papers/GenarateCitation';

interface Paper {
  _id: string;
  title: string;
  authors?: string[];
  year?: number;
  publisher?: string;
  createdAt: string;
}

async function getPaper(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/papers/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch paper');
  return res.json();
}

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const paper: Paper = await getPaper(params.id);

  // Provide fallbacks for missing fields
  const authors = paper.authors || ["Unknown Author"];
  const year = paper.year || new Date(paper.createdAt).getFullYear();
  const publisher = paper.publisher || "Unknown Publisher";

  return (
    <div style={{
      backgroundColor: '#f4f4f4',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#333',
        }}>
          Paper Details
        </h1>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
        }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '10px', borderBottom: '1px solid #ddd' }}>Title:</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{paper.title}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '10px', borderBottom: '1px solid #ddd' }}>Authors:</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{authors.join(', ')}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '10px', borderBottom: '1px solid #ddd' }}>Published:</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{year}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '10px', borderBottom: '1px solid #ddd' }}>Publisher:</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{publisher}</td>
            </tr>
          </tbody>
        </table>
        <div style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333',
          }}>
            Generate Citation
          </h2>
          <GenerateCitation
            title={paper.title}
            authors={authors}
            year={year}
            publisher={publisher}
          />
        </div>
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
        }}>
          <button style={{
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}>
            Download Paper
          </button>
          <button style={{
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}>
            Share Citation
          </button>
        </div>
      </div>
    </div>
  );
}