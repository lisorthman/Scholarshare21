// components/UserWishlist.tsx
'use client';

import { useWishlist } from '@/hooks/useWishlist';

export default function UserWishlist() {
  const { wishlist, loading, error, refresh } = useWishlist();

  if (loading) return <div>Loading wishlist...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2>Your Wishlist</h2>
      <button 
        onClick={refresh}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Refresh
      </button>
      
      <ul className="mt-4">
        {wishlist.map(item => (
          <li key={item._id} className="py-2 border-b">
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}