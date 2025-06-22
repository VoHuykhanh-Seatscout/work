// app/api/download/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('name');

  if (!fileUrl) {
    return new NextResponse('URL required', { status: 400 });
  }

  const res = await fetch(fileUrl);
  const blob = await res.blob();

  return new NextResponse(blob, {
    headers: {
      'Content-Disposition': `attachment; filename="${fileName || 'download'}"`,
      'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
    },
  });
}