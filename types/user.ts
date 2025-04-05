// types/user.ts
export const UserRoles = ['admin', 'researcher', 'user'] as const;
export type UserRole = typeof UserRoles[number];

export interface User {
  name: string;
  email: string;
  role: UserRole;  // This can only be 'admin', 'researcher', or 'user'
  institution?: string;
  researchField?: string;
  publications?: number;
}