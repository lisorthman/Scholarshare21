import GenerateCitation from '@/components/papers/GenarateCitation';
import RatingDisplay from "@/components/papers/RatingDisplay";
import ReviewList from "@/components/papers/ReviewList";
import ReviewForm from "@/components/papers/ReviewForm";

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

  const authors = paper.authors || ["Unknown Author"];
  const year = paper.year || new Date(paper.createdAt).getFullYear();
  const publisher = paper.publisher || "Unknown Publisher";

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="bg-white rounded-xl p-6 shadow-md max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Paper Details</h1>

        <table className="w-full mb-6 border-collapse">
          <tbody>
            <tr>
              <td className="font-bold py-2 border-b w-1/4">Title:</td>
              <td className="py-2 border-b">{paper.title}</td>
            </tr>
            <tr>
              <td className="font-bold py-2 border-b">Authors:</td>
              <td className="py-2 border-b">{authors.join(', ')}</td>
            </tr>
            <tr>
              <td className="font-bold py-2 border-b">Published:</td>
              <td className="py-2 border-b">{year}</td>
            </tr>
            <tr>
              <td className="font-bold py-2 border-b">Publisher:</td>
              <td className="py-2 border-b">{publisher}</td>
            </tr>
          </tbody>
        </table>

        {/* Ratings & Reviews Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Ratings & Reviews</h2>
          <RatingDisplay paperId={paper._id} />
          <ReviewList paperId={paper._id} />

          {/* Review form always visible */}
          <div className="mt-6 border-t pt-4">
            <ReviewForm paperId={paper._id} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
            Download Paper
          </button>
          <button className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700">
            Share Citation
          </button>
        </div>
      </div>
    </div>
  );
}
