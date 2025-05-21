import { getApprovedPapers } from '@/lib/api/papers';
import PaperCard from '@/components/papers/PaperCard';

export default async function UserPapersPage() {
  const papers = await getApprovedPapers(); // Fetch only approved papers
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Research Papers</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <PaperCard 
            key={paper._id} 
            paper={paper}
             showAdminActions={false} // Hide admin actions for users
            showResearcherActions={false} // Hide researcher actions
          />
        ))}
      </div>
    </div>
  );
}