import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const body = await request.json();
    
    await transporter.sendMail({
      from: `Your App <${process.env.EMAIL_USER}>`,
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Error sending email' },
      { status: 500 }
    );
  }
}