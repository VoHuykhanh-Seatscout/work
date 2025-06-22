// app/api/competitions/[id]/rounds/[roundId]/resources/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(
  req: Request,
  { params }: any
) {
  try {
    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/gif',
      'video/mp4',
      'application/zip'
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Upload to Cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: `competitions/${params.id}/rounds/${params.roundId}`,
          public_id: file.name.replace(/\.[^/.]+$/, ""),
          overwrite: true,
          access_mode: 'public',
          type: 'upload',
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (!result) {
            reject(new Error('Cloudinary upload returned no result'));
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(uint8Array);
    });

    // Return success response
    return NextResponse.json({
      id: result.public_id,
      name: file.name,
      url: result.secure_url,
      type: file.type,
      size: file.size,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type
    });

  } catch (error) {
    // Handle errors
    console.error('Resource upload error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred';

    return NextResponse.json(
      { 
        error: 'File upload failed',
        message: errorMessage 
      },
      { status: 500 }
    );
  }
}

// Type definitions for the response
export type ResourceUploadResponse = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
};

export type ResourceUploadError = {
  error: string;
  message?: string;
};