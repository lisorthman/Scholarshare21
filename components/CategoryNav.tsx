// components/CategoryNav.tsx
import Link from 'next/link';

const categories = [
  { id: 'computer-science', name: 'Computer Science' },
  { id: 'medicine', name: 'Medicine' },
  { id: 'engineering', name: 'Engineering' },
  // Add more categories as needed
];

export default function CategoryNav({ activeCategory }: { activeCategory?: string }) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <Link 
          href="/papers" 
          className={`px-4 py-2 rounded-full ${!activeCategory ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All Categories
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/papers?category=${category.id}`}
            className={`px-4 py-2 rounded-full ${activeCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}