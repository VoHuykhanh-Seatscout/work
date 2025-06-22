import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const MAX_FILE_SIZE_MB = 50;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

export async function POST(
  request: Request,
  { params }: any
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate parameters
    const { id: competitionId, roundId } = params;
    if (!competitionId || !roundId) {
      return NextResponse.json(
        { error: 'Missing competition ID or round ID' },
        { status: 400 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // File validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'File type not allowed',
          allowedTypes: ALLOWED_MIME_TYPES.map(type => type.split('/').pop())
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` },
        { status: 400 }
      );
    }

    // Verify competition ownership
    const competition = await prisma.competition.findFirst({
      where: {
        id: competitionId,
        organizerId: session.user.id,
        rounds: { some: { id: roundId } }
      },
      select: { id: true }
    });

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition or round not found' },
        { status: 404 }
      );
    }

    // Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate unique public ID
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `comp_${competitionId}_round_${roundId}_${timestamp}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Determine resource type
    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';

    // Prepare parameters for signing - IMPORTANT: Maintain this exact order
    const signingParams = [
      ['access_mode', 'public'],
      ['folder', `competitions/${competitionId}/rounds/${roundId}`],
      ['public_id', publicId],
      ['timestamp', timestamp.toString()],
      ['type', 'upload']
    ];

    // Generate signature - using array to maintain exact order
    const stringToSign = signingParams
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(stringToSign + apiSecret)
      .digest('hex');

    // Debug logging (remove in production)
    console.log('String to sign:', stringToSign);
    console.log('Generated signature:', signature);

    // Create form data for Cloudinary
    const cloudinaryFormData = new FormData();
    signingParams.forEach(([key, value]) => {
      cloudinaryFormData.append(key, value);
    });
    cloudinaryFormData.append('file', new Blob([buffer], { type: file.type }), file.name);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('signature', signature);

    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('Cloudinary upload failed:', {
        status: uploadResponse.status,
        error: error,
        signingParams: signingParams,
        stringToSign: stringToSign
      });
      return NextResponse.json(
        { 
          error: 'Failed to upload to Cloudinary',
          details: error.error?.message || 'Unknown Cloudinary error'
        },
        { status: 500 }
      );
    }

    const cloudinaryResult = await uploadResponse.json();

    // Create database record
    const resource = await prisma.resource.create({
      data: {
        name: file.name,
        url: cloudinaryResult.secure_url,
        type: file.type.split('/')[1] || file.type,
        size: file.size,
        publicId: cloudinaryResult.public_id,
        roundId: roundId
      }
    });

    return NextResponse.json({
      success: true,
      resource: {
        id: resource.id,
        name: resource.name,
        url: resource.url,
        type: resource.type,
        size: resource.size,
        publicId: resource.publicId
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}