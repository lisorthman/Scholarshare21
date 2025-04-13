// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      name?: string;
      email?: string;
      image?: string;
      role?:string;
      createdAt: string;
      updatedAt: string;
      // Add any additional fields you use
    };
  }
  
}
