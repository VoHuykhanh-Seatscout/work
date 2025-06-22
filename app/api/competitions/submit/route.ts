import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get form data and IDs
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const link = formData.get('link') as string | null;
    const description = formData.get('description') as string | null;
    const competitionId = formData.get('competitionId') as string;
    const roundId = formData.get('roundId') as string;

    // 3. Validate submission content and IDs
    if (!file && !link) {
      return NextResponse.json(
        { error: 'Either file or link is required' },
        { status: 400 }
      );
    }

    if (!competitionId || !roundId) {
      return NextResponse.json(
        { error: 'Competition ID and Round ID are required' },
        { status: 400 }
      );
    }

    // 4. Get competition and round details
    const competitionWithRound = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        rounds: {
          where: { id: roundId },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            submissionRules: true,
          },
        },
      },
    });

    if (!competitionWithRound || !competitionWithRound.rounds.length) {
      return NextResponse.json(
        { error: 'Competition or round not found' },
        { status: 404 }
      );
    }

    const round = competitionWithRound.rounds[0];
    const currentDate = new Date();

    // 5. Validate submission timing
    if (currentDate < new Date(round.startDate)) {
      return NextResponse.json(
        { error: 'Submission period has not started yet' },
        { status: 400 }
      );
    }

    if (currentDate > new Date(round.endDate)) {
      const submissionRules = round.submissionRules as {
        acceptLateSubmissions?: boolean;
      } | null;
      
      if (!submissionRules?.acceptLateSubmissions) {
        return NextResponse.json(
          { error: 'Submission period has ended' },
          { status: 400 }
        );
      }
    }

    // 6. Check for existing submission
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId: session.user.id,
        roundId: round.id,
        competitionId: competitionWithRound.id,
      },
    });

    // 7. Handle file upload if present
    let fileUrl = null;
    let filePublicId = null;

    if (file) {
      // Validate file against submission rules
      const submissionRules = round.submissionRules as {
        maxFileSizeMB?: number;
        allowedFileTypes?: string[];
      } | null;

      const maxSizeMB = submissionRules?.maxFileSizeMB || 10;
      if (file.size > maxSizeMB * 1024 * 1024) {
        return NextResponse.json(
          { error: `File size exceeds ${maxSizeMB}MB limit` },
          { status: 400 }
        );
      }

      const allowedTypes = submissionRules?.allowedFileTypes || [
        'image/jpeg',
        'image/png',
        'application/pdf',
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'File type not allowed' },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary with proper typing
      const uploadedFile = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'competition_submissions',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          )
          .end(buffer);
      });

      fileUrl = uploadedFile.secure_url;
      filePublicId = uploadedFile.public_id;
    }

    // 8. Prepare submission content
    const submissionContent = {
      file: fileUrl ? { url: fileUrl, publicId: filePublicId } : null,
      link: link || null,
      description: description || null,
      submittedAt: new Date().toISOString(),
    };

    // 9. Create or update submission
    const submission = existingSubmission
      ? await prisma.submission.update({
          where: { id: existingSubmission.id },
          data: {
            content: submissionContent as any,
            status: 'pending', // Reset status when updating
            feedback: null, // Clear previous feedback
          },
        })
      : await prisma.submission.create({
          data: {
            userId: session.user.id,
            roundId: round.id,
            competitionId: competitionWithRound.id,
            content: submissionContent as any,
          },
        });

    // 10. Return success response
    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}