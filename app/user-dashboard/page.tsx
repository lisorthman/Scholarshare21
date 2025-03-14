'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

const UserDashboard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/SignIn'); // Redirect to login if no token
    } else {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
        if (decoded.role !== 'user') {
          router.push('/SignIn'); // Redirect if the role is not 'user'
        }
      } catch (error) {
        router.push('/SignIn'); // Redirect if the token is invalid
      }
    }
  }, [router]);

  return (
    <div>
      <h1>User Dashboard</h1>
      {/* User dashboard content */}
    </div>
  );
};

export default UserDashboard;