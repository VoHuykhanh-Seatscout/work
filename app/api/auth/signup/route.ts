import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 mins expiry

    let newUser;
    try {
      const validRole = role === "business" ? "BUSINESS" : "STUDENT";

      newUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: validRole,
          isVerified: false,
        },
      });

      await prisma.verificationToken.create({
        data: {
          token: verificationToken,
          email: normalizedEmail,
          expires: expiresAt,
          userId: newUser.id,
        },
      });
    } catch (dbError) {
      console.error("❌ Database Error:", dbError);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    console.log("✅ User created:", newUser);

    try {
      await sendVerificationEmail(newUser.email, verificationToken);
    } catch (emailError) {
      console.error("❌ Email send failed:", emailError);
      try {
        await prisma.user.delete({ where: { id: newUser.id } });
        await prisma.verificationToken.delete({ where: { token: verificationToken } });
      } catch (deleteError) {
        console.error("❌ Cleanup failed:", deleteError);
      }

      return NextResponse.json(
        { error: "Signup failed: Email not sent." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Signup successful! Check your email for verification." },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Signup Error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}
