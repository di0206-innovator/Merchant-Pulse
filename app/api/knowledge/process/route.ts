import { NextResponse } from 'next/server';
import { processKnowledgeFile } from '@/core/knowledge/ingestion';

export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documentId, storagePath, merchantId } = body;

    if (!documentId || !storagePath || !merchantId) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, storagePath, merchantId' },
        { status: 400 }
      );
    }

    // Process the file (Extract text/transcript, chunk, embed, store)
    await processKnowledgeFile(merchantId, documentId, storagePath);

    return NextResponse.json({ success: true, status: 'READY' });
  } catch (error: any) {
    console.error('Error in /api/knowledge/process:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
