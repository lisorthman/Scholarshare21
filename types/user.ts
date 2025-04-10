// types/user.ts
export const UserRoles = ['admin', 'researcher', 'user'] as const;
export type UserRole = typeof UserRoles[number];

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'user';
  researchField?: string;
  createdAt: string;
  updatedAt: string;
}