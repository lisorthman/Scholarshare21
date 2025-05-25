// ✅ Correct (using named import)
import { getPaperById } from '@/lib/api/papers';import PaperMetaData from '@/components/papers/PaperMetaData';
import GenerateCitation from '@/components/papers/GenarateCitation';

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const paper = await getPaperById(params.id);
  
  if (!paper || paper.status !== 'approved') {
    return <div>Paper not found or not approved</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{paper.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Abstract</h2>
            <p className="text-gray-700">{paper.abstract}</p>
          </div>
          
          {/* PDF viewer or download button */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <a 
              href={paper.fileUrl} 
              target="_blank"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Full Paper
            </a>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <PaperMetaData paper={paper} />
          <GenerateCitation paper={paper} />
        </div>
      </div>
    </div>
  );
}