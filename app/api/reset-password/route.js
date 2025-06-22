import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Generate random token function
const generateToken = () => randomBytes(32).toString("hex");

export async function POST(req) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create reset token & expiry (1-hour validity)
    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: "Reset link sent successfully" });
  } catch (error) {
    console.error("Error in reset password:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
