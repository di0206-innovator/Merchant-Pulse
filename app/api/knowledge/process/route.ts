import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processKnowledgeFile, validateStoragePath } from '@/core/knowledge/ingestion';
import { globalAuthManager } from '@/core/auth/manager';

export const maxDuration = 60; // Allow up to 60 seconds for processing

const KnowledgeProcessRequestSchema = z.object({
  documentId: z.string().trim().min(1).max(128),
  storagePath: z.string().trim().min(1).max(512),
  merchantId: z.string().trim().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Server-side Authentication & RBAC Check
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = globalAuthManager.authenticateSession(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid authentication token required.' },
        { status: 401 }
      );
    }

    if (
      !globalAuthManager.hasPermission(user, 'policy:write') &&
      !globalAuthManager.hasPermission(user, 'opportunities:execute')
    ) {
      return NextResponse.json(
        { error: `Forbidden: Role '${user.role}' cannot ingest knowledge documents.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = KnowledgeProcessRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid or missing required fields: documentId, storagePath, merchantId' },
        { status: 400 }
      );
    }

    const { documentId, storagePath, merchantId } = parsed.data;
    const safeStoragePath = validateStoragePath(storagePath);

    // 2. Process the file (Extract text/transcript, chunk, embed, store)
    await processKnowledgeFile(merchantId, documentId, safeStoragePath);

    return NextResponse.json({ success: true, status: 'READY' });
  } catch (error: any) {
    console.error('Error in /api/knowledge/process:', error);
    const message = typeof error?.message === 'string' && error.message.startsWith('Invalid ')
      ? error.message
      : 'Knowledge base processing failed';
    const status = message.startsWith('Invalid ') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
