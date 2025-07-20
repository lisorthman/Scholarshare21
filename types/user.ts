export const UserRoles = ["admin", "researcher", "user"] as const;
export type UserRole = typeof UserRoles[number];

// Define the type for recently viewed papers
export type RecentlyViewedPaper = {
  paperId: string;
  timestamp: string; // Since Date is serialized to string in JSON
};

export type User = {
  _id: string;
  id?: string; // Alternative identifier for compatibility
  name: string;
  email: string;
  role: UserRole;
  researchField?: string;
  profilePhoto?: string;
  savedPapers?: string[]; // Array of ObjectId strings
  recentlyViewed?: RecentlyViewedPaper[]; // Array of recently viewed papers
  username?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  institution?: string;
  publications?: number;
};