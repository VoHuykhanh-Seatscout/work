import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SubmissionStatus } from '@prisma/client';

interface SubmissionContent {
  notes?: string;
  links?: string[];
  files?: string[];
}

export async function PUT(
  request: Request,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notes, links, files } = await request.json();
    const submissionId = params.id;

    // Check if submission exists and belongs to user
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
        userId: session.user.id,
      },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { error: 'Submission not found or not owned by user' },
        { status: 404 }
      );
    }

    // Parse the existing content or create default empty content
    const existingContent: SubmissionContent = existingSubmission.content 
      ? (existingSubmission.content as SubmissionContent) 
      : { notes: '', links: [], files: [] };

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        content: {
          notes: notes ?? existingContent.notes,
          links: links ?? existingContent.links ?? [],
          files: files ?? existingContent.files ?? [],
        },
        status: SubmissionStatus.pending, // Reset status on update
      },
      include: {
        round: true,
        competition: true,
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('Submission update error:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const submissionId = params.id;

    // First check if user owns the submission
    let submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
        userId: session.user.id,
      },
      include: {
        round: true,
        competition: {
          include: {
            rounds: true // Include rounds in the competition
          }
        },
        user: true, // Include user data
      },
    });

    // If not found, check if user is admin/business user associated with the competition
    if (!submission) {
      const competition = await prisma.competition.findFirst({
        where: {
          submissions: {
            some: {
              id: submissionId
            }
          },
          // Add your business user relationship check here
          // For example:
          // business: {
          //   userId: session.user.id
          // }
        }
      });

      if (!competition) {
        return NextResponse.json(
          { error: 'Submission not found or not authorized' },
          { status: 404 }
        );
      }

      submission = await prisma.submission.findUnique({
        where: {
          id: submissionId,
        },
        include: {
          round: true,
          competition: {
            include: {
              rounds: true // Include rounds in the competition
            }
          },
          user: true, // Include user data
        },
      });
    }

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Submission fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}