import { getApprovedPapers } from '@/lib/api/papers';
import PaperCard from '@/components/papers/PaperCard';
import RatingPreview from '@/components/papers/RatingPreview';
import ReviewPreview from '@/components/papers/ReviewPreview';

export default async function UserPapersPage() {
  const papers = await getApprovedPapers();
  
  // Convert papers to plain objects and ensure _id is string
  const plainPapers = papers.map(paper => ({
    ...paper,
    _id: paper._id.toString() // Convert ObjectId to string
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Research Papers</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plainPapers.map((paper) => (
          <div key={paper._id} className="flex flex-col gap-4">
            <PaperCard 
              paper={paper}
              showAdminActions={false}
              showResearcherActions={false}
            />
            
            
            
            {/* View Details Link */}
            <a
              href={`/user-dashboard/papers/${paper._id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium text-center"
            >
              View full details and reviews →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}