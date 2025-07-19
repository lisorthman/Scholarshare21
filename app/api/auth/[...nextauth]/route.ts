import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null;
        }

        try {
          await connectToDB();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          // Check if user role matches
          if (user.role !== credentials.role) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Credentials auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          await connectToDB();
          
          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (existingUser) {
            // Update user with OAuth info if needed
            if (account.provider === "google") {
              existingUser.googleId = (profile as any)?.sub;
            } else if (account.provider === "facebook") {
              existingUser.facebookId = (profile as any)?.id;
            }
            await existingUser.save();
            return true;
          }

          // Create new user
          const newUser = new User({
            name: user.name,
            email: user.email,
            role: "user", // Default role for OAuth users
            isVerified: true, // OAuth users are pre-verified
            googleId: account.provider === "google" ? (profile as any)?.sub : undefined,
            facebookId: account.provider === "facebook" ? (profile as any)?.id : undefined,
            // Generate a random password for OAuth users
            password: await bcrypt.hash(Math.random().toString(36), 10),
          });

          await newUser.save();
          return true;
        } catch (error) {
          console.error("OAuth signin error:", error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allow specific redirects to donation page
      if (url.includes('/donate') || url.startsWith(baseUrl + '/donate')) {
        return url;
      }
      // Default behavior for other cases
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };