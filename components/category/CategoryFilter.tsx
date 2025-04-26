'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const categories = [
  { id: 'computer-science', name: 'Computer Science' },
  { id: 'medicine', name: 'Medicine' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'biology', name: 'Biology' },
  { id: 'physics', name: 'Physics' },
];

export default function CategoryFilter({
  activeCategory,
  searchQuery,
}: {
  activeCategory?: string;
  searchQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const search = formData.get('search') as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('search', search);
    else params.delete('search');
    
    router.push(`/papers?${params.toString()}`);
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push('/papers')}
          className={`px-4 py-2 rounded-full ${
            !activeCategory ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => router.push(`/papers?category=${category.id}`)}
            className={`px-4 py-2 rounded-full ${
              activeCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          name="search"
          placeholder="Search papers..."
          defaultValue={searchQuery}
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
        >
          Search
        </button>
      </form>
    </div>
  );
}