// types/user.ts
export const UserRoles = ['admin', 'researcher', 'user'] as const;
export type UserRole = typeof UserRoles[number];

// types/user.ts
export type User = {
  _id: string;
  name: string;
<<<<<<< HEAD
  email: string;
  role: string;
  createdAt?: string;    // Make optional if not always present
  updatedAt?: string;    // Make optional if not always present
  institution?: string;  // Optional fields
  researchField?: string;
  publications?: number;
};
=======
  email?: string;
  role?: 'admin' | 'researcher' | 'user';
  researchField?: string;
  createdAt?: string;
  updatedAt?: string;
}
>>>>>>> e71d22f (update rating,wishlist and views sections)
