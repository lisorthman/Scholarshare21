// app/papers/page.tsx
import CategoryNav from '@/components/CategoryNav';
import PaperCard from '@/components/papers/PaperCard';
import SearchBar from '@/components/SearchBar';
import { fetchPapers } from '@/lib/api/papers';

async function getPapers(category?: string) {
  const url = category 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/papers?category=${category}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/papers`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch papers');
  return res.json();
}

export default async function PapersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const category = searchParams?.category;
  const papers = await getPapers(category);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Research Papers</h1>
      <CategoryNav activeCategory={category} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {papers.map((paper: any) => (
          <PaperCard key={paper._id} paper={paper} />
        ))}
      </div>
      
      {papers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No papers found in this category</p>
        </div>
      )}
      <SearchBar category={category} />
    </div>
  );
}