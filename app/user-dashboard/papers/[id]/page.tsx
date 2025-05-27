import { getPaperById } from '@/lib/api/papers';
import RatingDisplay from '@/components/papers/RatingDisplay';
import ReviewList from '@/components/papers/ReviewList';
import ReviewForm from '@/components/papers/ReviewForm';
import { notFound } from 'next/navigation';

export default async function PaperDetailPage(props: { 
  params: { id: string },
  searchParams: any 
}) {
  // Access params through props instead
  const paperId = props.params.id;
  const paper = await getPaperById(paperId);

  if (!paper || paper.status !== 'approved') {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Paper Title and Description */}
        <h1 className="text-3xl font-bold mb-4"><b><u>{paper.title}</u></b></h1>
       
        
        {/* Rating Display */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Rating</h2>
          <RatingDisplay paperId={paper._id} />
        </div>
        
        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          <ReviewList paperId={paper._id} />
        </div>
        
        {/* Review Form - No auth required */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Your Review</h2>
          <ReviewForm paperId={paper._id} />
        </div>
      </div>
    </div>
  );
}