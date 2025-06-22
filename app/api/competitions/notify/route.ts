// api/competitions/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const { competitionId, competitionTitle, organizerName } = body;

    if (!competitionId || !competitionTitle || !organizerName) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: competitionId, competitionTitle, or organizerName'
        },
        { status: 400 }
      );
    }

    // Get all student users
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      select: {
        email: true
      }
    });

    if (students.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No students to notify' },
        { status: 200 }
      );
    }

    // Send emails to all students
    const emailPromises = students.map(student => {
      return resend.emails.send({
        from: 'Aspire X <noreply@onresend.com>',
        to: student.email,
        subject: `New Competition: ${competitionTitle}`,
        html: `<p>Hello,</p>
               <p>A new competition "${competitionTitle}" has been created by ${organizerName}.</p>
               <p>Check it out and register if you're interested!</p>
               <p>Competition ID: ${competitionId}</p>
               <p>Best regards,</p>
               <p>The Competition Team</p>`
      });
    });

    const results = await Promise.all(emailPromises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      console.error('Failed to send some emails:', errors);
      return NextResponse.json(
        { 
          success: false,
          message: `Failed to send ${errors.length} notifications`,
          errors
        },
        { status: 207 } // Multi-status
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Notifications sent to ${students.length} students successfully`
    });

  } catch (err) {
    const error = err as Error;
    console.error('Notification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}