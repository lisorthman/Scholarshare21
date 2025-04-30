<<<<<<< HEAD
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({ category }: { category?: string }) {
=======
/*
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
>>>>>>> origin/babi
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    const basePath = '/papers';
    const queryParams = new URLSearchParams();
    
    if (category) queryParams.append('category', category);
    if (query) queryParams.append('search', query);
    
    router.push(`${basePath}?${queryParams.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="flex">
        <input
          type="text"
          placeholder="Search papers..."
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </form>
  );
}
=======
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="border px-4 py-2 rounded"
      />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Go
      </button>
    </form>
  );
}
  */
>>>>>>> origin/babi
