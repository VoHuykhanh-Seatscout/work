import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json(); // Accept role from frontend

    // Check for missing fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Validate role
    const allowedRoles = ["STUDENT", "BUSINESS"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = randomBytes(32).toString("hex");

    // Save user to database with the correct role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role, // Set role properly
        verificationToken,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({ message: "Signup successful! Check your email to verify your account." });
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
