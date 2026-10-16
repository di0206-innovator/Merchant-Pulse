import { NextRequest, NextResponse } from 'next/server';
import { processKnowledgeFile } from '@/core/knowledge/ingestion';
import { globalAuthManager } from '@/core/auth';

export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate session & verify write permissions
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = globalAuthManager.authenticateSession(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid authentication token required.' },
        { status: 401 }
      );
    }

    if (!globalAuthManager.hasPermission(user, 'policy:write')) {
      return NextResponse.json(
        { error: `Forbidden: Role '${user.role}' lacks permission to ingest knowledge documents.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { documentId, storagePath, merchantId } = body || {};

    if (
      typeof documentId !== 'string' || !documentId.trim() ||
      typeof storagePath !== 'string' || !storagePath.trim() ||
      typeof merchantId !== 'string' || !merchantId.trim()
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, storagePath, merchantId' },
        { status: 400 }
      );
    }

    if (storagePath.includes('..') || storagePath.startsWith('/') || storagePath.startsWith('\\')) {
      return NextResponse.json(
        { error: 'Invalid storagePath format' },
        { status: 400 }
      );
    }

    // Process the file (Extract text/transcript, chunk, embed, store)
    await processKnowledgeFile(merchantId.trim(), documentId.trim(), storagePath.trim());

    return NextResponse.json({ success: true, status: 'READY' });
  } catch (error: any) {
    console.error('Error in /api/knowledge/process:', error);
    return NextResponse.json(
      { error: 'Failed to process knowledge document' },
      { status: 500 }
    );
  }
}
