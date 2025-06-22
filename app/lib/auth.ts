

import { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";


// ✅ Ensure required environment variables are set
if (!process.env.NEXTAUTH_SECRET) {
 throw new Error("❌ Missing NEXTAUTH_SECRET in environment variables");
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
 throw new Error("❌ Missing Google OAuth credentials in environment variables");
}


// 🔹 Extend NextAuth Types
declare module "next-auth" {
 interface User {
   id: string;
   email?: string | null;
   image?: string | null;
   role?: string;
   isVerified?: boolean;
   onboardingComplete?: boolean;
 }


 interface Session {
   user: User & {
     university?: string;
     degree?: string;
     graduationYear?: number;
     skills?: string[];
     linkedin?: string;
     github?: string;
     resume?: string;
     onboardingComplete?: boolean;
   };
 }
}


declare module "next-auth/jwt" {
 interface JWT {
   id: string;
   email?: string;
   image?: string;
   role?: string;
   isVerified?: boolean;
   university?: string;
   degree?: string;
   graduationYear?: number;
   skills?: string[];
   linkedin?: string;
   github?: string;
   resume?: string;
   onboardingComplete?: boolean;
 }
}


export const authOptions: NextAuthOptions = {
 adapter: PrismaAdapter(prisma),
 providers: [
   GoogleProvider({
     clientId: process.env.GOOGLE_CLIENT_ID!,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
     authorization: {
       params: {
         prompt: "consent",
         access_type: "offline",
         response_type: "code",
         scope: "openid email profile",
       },
     },
   }),
   CredentialsProvider({
     name: "Credentials",
     credentials: {
       email: { label: "Email", type: "text", placeholder: "user@example.com" },
       password: { label: "Password", type: "password" },
       role: { label: "Role", type: "text" },
     },
     async authorize(credentials) {
       if (!credentials?.email) {
         return null;
       }
    
       console.log("Credentials:", credentials);
    
       const user = await prisma.user.findUnique({
         where: { email: credentials.email },
         select: {
           id: true,
           email: true,
           name: true,
           profileImage: true,
           password: true,
           role: true,
           provider: true,
           isVerified: true,
           onboardingComplete: true,
         },
       });
    
       if (!user) {
         throw new Error("❌ User not found.");
       }
    
       if (!user.isVerified) {
         throw new Error("⚠ Your email is not verified. Please check your inbox.");
       }
    
       if (credentials.role && user.role.toUpperCase() !== credentials.role.toUpperCase()) {
         console.log("Role Mismatch:", {
           userRole: user.role,
           credentialsRole: credentials.role,
         });
         throw new Error("❌ Invalid role for this account.");
       }
    
       if (!credentials.password && user.isVerified) {
         return {
           id: user.id,
           email: user.email,
           name: user.name,
           image: user.profileImage ?? "/default-profile.png",
           role: user.role || "STUDENT",
           isVerified: user.isVerified,
           onboardingComplete: user.onboardingComplete,
         };
       }
    
       if (!user.password) {
         throw new Error("❌ Invalid email or password.");
       }
    
       const isValid = await bcrypt.compare(credentials.password, user.password);
       if (!isValid) {
         throw new Error("❌ Invalid email or password.");
       }
    
       return {
         id: user.id,
         email: user.email,
         name: user.name,
         image: user.profileImage ?? "/default-profile.png",
         role: user.role || "STUDENT",
         isVerified: user.isVerified,
         onboardingComplete: user.onboardingComplete,
       };
     },
   }),
 ],
 session: { strategy: "jwt" },
 callbacks: {
   async signIn({ user, account }) {
     if (account?.provider === "google") {
       let dbUser = await prisma.user.findUnique({
         where: { email: user.email ?? undefined },
       });


       if (!dbUser) {
         dbUser = await prisma.user.create({
           data: {
             email: user.email!,
             name: user.name!,
             profileImage: user.image ?? "/default-profile.png",
             isVerified: true,
             provider: "google",
             role: "STUDENT",
             onboardingComplete: false,
           },
         });
        
         // Return true for new users
         return true;
       } else if (dbUser.provider === "credentials") {
         await prisma.user.update({
           where: { email: user.email ?? undefined },
           data: { provider: "google" },
         });
       }


       await prisma.account.upsert({
         where: {
           provider_providerAccountId: {
             provider: account.provider,
             providerAccountId: account.providerAccountId,
           },
         },
         update: { userId: dbUser.id },
         create: {
           userId: dbUser.id,
           type: account.type,
           provider: account.provider,
           providerAccountId: account.providerAccountId,
           access_token: account.access_token,
           expires_at: account.expires_at,
           id_token: account.id_token,
         },
       });


       if (!dbUser.isVerified) {
         throw new Error("⚠ Your email is not verified. Please check your inbox.");
       }


       user.id = dbUser.id;
       user.isVerified = dbUser.isVerified;
       user.role = dbUser.role;
     }


     return true;
   },


   async jwt({ token, user }) {
     if (user) {
       const dbUser = await prisma.user.findUnique({
         where: { id: user.id },
         select: {
           profileImage: true,
           role: true,
           onboardingComplete: true
         },
       });
       token.id = user.id;
       token.email = user.email ?? undefined;
       token.image = dbUser?.profileImage || "/default-profile.png";
       token.role = dbUser?.role || "STUDENT";
       token.isVerified = user.isVerified;
       token.onboardingComplete = dbUser?.onboardingComplete ?? false;
     }
     return token;
   },


   async session({ session, token }) {
     if (token) {
       const dbUser = await prisma.user.findUnique({
         where: { id: token.id },
         select: {
           profileImage: true,
           role: true,
           onboardingComplete: true
         },
       });


       session.user = {
         id: token.id,
         email: token.email ?? null,
         image: dbUser?.profileImage || "/default-profile.png",
         role: dbUser?.role || "STUDENT",
         isVerified: token.isVerified,
         onboardingComplete: dbUser?.onboardingComplete ?? false,
         university: token.university ?? undefined,
         degree: token.degree ?? undefined,
         graduationYear: token.graduationYear ?? undefined,
         skills: token.skills ?? [],
         linkedin: token.linkedin ?? undefined,
         github: token.github ?? undefined,
         resume: token.resume ?? undefined,
       };
     }


     return session;
   },
 },
 secret: process.env.NEXTAUTH_SECRET,
 debug: process.env.NODE_ENV === "development",
 useSecureCookies: process.env.NODE_ENV === "production",
};


// Helper function to get the authenticated user ID
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
 const session = await getServerSession(authOptions);
 return session?.user?.id ?? null;
}
