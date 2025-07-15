import GenerateCitation from '@/components/papers/GenarateCitation';
import CopyCitationButton from '@/components/CopyCitation/CopyCitationButton';
import Navbar from '@/components/Navbar'; 

// Move interface to top level
interface Paper {
  _id: string;
  title: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
  };
  abstract: string;
  fileUrl: string;
  fileName: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

async function getPaper(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/papers/${id}`, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('Failed to fetch paper:', await res.text());
      throw new Error('Failed to fetch paper');
    }

    const data = await res.json();
    console.log('Fetched paper data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching paper:', error);
    throw error;
  }
}

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const paper: Paper = await getPaper(params.id);

  // Debug raw data first
  console.log('Raw paper data:', paper);

  if (!paper) {
    throw new Error('Paper not found');
  }

  // Extract data with strict type checking
  const title = typeof paper.title === 'string' && paper.title.trim() 
    ? paper.title.trim() 
    : 'Untitled';

  const authorName = paper.authorId && typeof paper.authorId.name === 'string' 
    ? paper.authorId.name.trim() 
    : 'Unknown Author';

  const year = paper.createdAt 
    ? new Date(paper.createdAt).getFullYear() 
    : new Date().getFullYear();

  const publisher = "ScholarShare Platform";

  // Debug extracted data
  console.log('Processed Data:', {
    title,
    authorName,
    year,
    publisher,
    rawAuthorId: paper.authorId
  });

  const citation = `${authorName}. "${title}". ${publisher}, ${year}.`;

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: '#E0D8C3', minHeight: '100vh', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(99, 65, 65, 0.1)', width: '100%', maxWidth: '800px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '24px', color: '#634141' }}>
            Paper Details
          </h1>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: '600', padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141', width: '120px' }}>Title:</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>{title}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600', padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>Author:</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>{authorName}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600', padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>Published:</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>{year}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600', padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>Publisher:</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E0D8C3', color: '#634141' }}>{publisher}</td>
              </tr>
            
            </tbody>
          </table>

          <div style={{ backgroundColor: '#E0D8C3', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#634141' }}>
              Generate Citation of the Research Paper
            </h2>
            <GenerateCitation
              title={title}
              authors={[authorName]}
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