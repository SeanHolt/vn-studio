import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');
  const projectId = formData.get('projectId');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type);

  if (!isImage && !isAudio) {
    return NextResponse.json(
      { error: 'Only PNG, JPG, WebP, GIF, MP3, WAV, or OGG files are allowed' },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  const url = `/uploads/${fileName}`;
  const cleanLabel = file.name.replace(/\.[^/.]+$/, '').slice(0, 40) || 'Uploaded Asset';

  if (typeof projectId === 'string' && projectId.length > 0) {
    const asset = await prisma.asset.create({
      data: {
        projectId,
        name: cleanLabel,
        category: isImage ? 'IMAGE' : 'AUDIO',
        url,
      },
    });
    return NextResponse.json({ url, asset });
  }

  return NextResponse.json({ url });
}
