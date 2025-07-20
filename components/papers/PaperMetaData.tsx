// components/papers/PaperMetaData.tsx
type Paper = {
  title: string;
  authors?: string[];
  year?: number;
  publisher?: string;
  createdAt?: string | Date;
};

export default function PaperMetaData({ paper }: { paper: Paper }) {
  const authors = paper.authors || ["Unknown Author"];
  
  // Safe date handling with fallback
  const year = paper.year || (
    paper.createdAt 
      ? new Date(paper.createdAt).getFullYear() 
      : new Date().getFullYear() // Fallback to current year
  );
  
  const publisher = paper.publisher || "Unknown Publisher";

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
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
  );
}