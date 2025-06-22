import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    role?: string | null;
    university?: string | null;
    degree?: string | null;
    graduationYear?: number | null;
    skills?: string[] | null;
    linkedin?: string | null;
    github?: string | null;
    resume?: string | null;
    provider?: string | null;
    tagline?: string | null;
    shortIntroduction?: string | null;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      role?: string | null;
      university?: string | null;
      degree?: string | null;
      graduationYear?: number | null;
      skills?: string[] | null;
      linkedin?: string | null;
      github?: string | null;
      resume?: string | null;
      provider?: string | null;
      tagline?: string | null;
      shortIntroduction?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    role?: string | null;
    university?: string | null;
    degree?: string | null;
    graduationYear?: number | null;
    skills?: string[] | null;
    linkedin?: string | null;
    github?: string | null;
    resume?: string | null;
    provider?: string | null;
    tagline?: string | null;
    shortIntroduction?: string | null;
  }
}