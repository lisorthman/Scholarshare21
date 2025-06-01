import GenerateCitation from '@/components/papers/GenarateCitation';
import CopyCitationButton from '@/components/CopyCitation/CopyCitationButton';
import Navbar from '@/components/Navbar'; 

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

  // Improved fallbacks with better type checking
  const authors = paper.authors?.length ? paper.authors : ["Unknown Author"];
  const year = paper.year || (paper.createdAt ? new Date(paper.createdAt).getFullYear() : "N/A");
  const publisher = paper.publisher || "Unknown Publisher"; 

  // Convert year to string to avoid NaN in render
  const yearDisplay = typeof year === 'number' ? year.toString() : year;

  const citation = `${authors.join(', ')}. "${paper.title}". ${publisher}, ${yearDisplay}.`;

  return (
    <>
      <Navbar />  {}
      <div style={{
        backgroundColor: '#E0D8C3',
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',          
        alignItems: 'center',      
        justifyContent: 'center', 
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 15px rgba(99, 65, 65, 0.1)',
          width: '100%',           
          maxWidth: '800px',
          
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            marginBottom: '24px',
            color: '#634141',
          }}>
            Paper Details
          </h1>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '24px',
          }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: '600', padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141', width: '120px' }}>Title:</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>{paper.title}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600', padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>Authors:</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>{authors.join(', ')}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600', padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>Published:</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>{yearDisplay}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600', padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>Publisher:</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>{publisher}</td>
              </tr>
            </tbody>
          </table>
          <div style={{
            backgroundColor: '#E0D8C3',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#634141',
            }}>
              Generate Citation of the Research Paper
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
            gap: '12px',
            justifyContent: 'flex-end',
          }}>
            <CopyCitationButton citation={citation} />
          </div>
        </div>
      </div>
    </>
  );
}