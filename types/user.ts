// types/user.ts
export const UserRoles = ['admin', 'researcher', 'user'] as const;
export type UserRole = typeof UserRoles[number];

// types/user.ts
export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;    // Make optional if not always present
  updatedAt?: string;    // Make optional if not always present
  institution?: string;  // Optional fields
  researchField?: string;
  publications?: number;
};