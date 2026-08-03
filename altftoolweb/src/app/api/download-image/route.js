import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'altpinterest-pin.jpg';

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image URL parameter' }, { status: 400 });
    }

    // Server-side fetch bypasses browser CORS policies completely
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image from source server (${response.status})` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const blob = await response.arrayBuffer();

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in download-image proxy API route:', error);
    return NextResponse.json(
      { error: 'Failed to process image download request' },
      { status: 500 }
    );
  }
}
