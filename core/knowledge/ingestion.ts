import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const MAX_KNOWLEDGE_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_CHUNKS_PER_DOCUMENT = 200;
const MAX_CHUNK_CHAR_LENGTH = 5000;

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
  if (!url || !serviceKey) {
    throw new Error('Supabase server credentials are not configured.');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const getAiClient = (): GoogleGenAI | null => {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'YourGeminiApiKeyHere' || key.length < 20) {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Validates storagePath to prevent path traversal or unauthorized bucket access.
 */
export function validateStoragePath(storagePath: string): string {
  if (typeof storagePath !== 'string' || !storagePath.trim()) {
    throw new Error('Invalid storagePath: must be a non-empty string.');
  }
  const clean = storagePath.trim();
  if (
    clean.includes('..') ||
    clean.startsWith('/') ||
    clean.startsWith('\\') ||
    /[\x00-\x1F\x7F]/.test(clean)
  ) {
    throw new Error('Invalid storagePath: path traversal or control characters detected.');
  }
  return clean;
}

/**
 * Process a file from Supabase storage, extract text using Gemini,
 * chunk it, and store embeddings in pgvector.
 */
export async function processKnowledgeFile(
  merchantId: string,
  documentId: string,
  storagePath: string
): Promise<void> {
  if (typeof merchantId !== 'string' || !merchantId.trim() || merchantId.length > 64) {
    throw new Error('Invalid merchantId.');
  }
  if (typeof documentId !== 'string' || !documentId.trim() || documentId.length > 128) {
    throw new Error('Invalid documentId.');
  }
  const safePath = validateStoragePath(storagePath);

  const aiClient = getAiClient();
  if (!aiClient) {
    throw new Error('GEMINI_API_KEY is missing or unconfigured. Cannot process AI knowledge base.');
  }

  const supabase = getSupabase();

  try {
    // 1. Download file from Supabase
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('knowledge_base')
      .download(safePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file from storage: ${downloadError?.message || 'Empty file'}`);
    }

    if (fileData.size > MAX_KNOWLEDGE_FILE_BYTES) {
      throw new Error(`File exceeds maximum allowed size of 20MB (${fileData.size} bytes).`);
    }

    // 2. Prepare file for Gemini
    const mimeType = fileData.type || 'application/octet-stream';
    const arrayBuffer = await fileData.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_KNOWLEDGE_FILE_BYTES) {
      throw new Error('File buffer exceeds maximum allowed size of 20MB.');
    }
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // 3. Extract semantic text/transcript using Gemini
    const extractionPrompt = `
You are MerchantPulse AI, a semantic extraction engine.
Analyze the provided document or audio file. Extract the full text or transcript, and split it into logical semantic chunks.
Each chunk should represent a distinct topic, section, or thought (roughly 100-300 words).
Return a STRICT JSON array of strings, where each string is a semantic chunk.
No markdown, no wrapping, ONLY the JSON array.
    `;

    const response = await aiClient.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: extractionPrompt }
          ]
        }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '[]';
    let parsedChunks: unknown;
    try {
      parsedChunks = JSON.parse(responseText);
      if (!Array.isArray(parsedChunks)) {
        throw new Error('Expected JSON array of strings');
      }
    } catch (err) {
      console.error('Failed to parse Gemini chunk extraction:', err);
      throw new Error('Invalid chunk extraction format');
    }

    const validChunks = parsedChunks
      .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      .slice(0, MAX_CHUNKS_PER_DOCUMENT)
      .map(c => c.trim().slice(0, MAX_CHUNK_CHAR_LENGTH));

    // 4. Generate embeddings and store in Supabase
    let chunkIndex = 0;
    for (const chunk of validChunks) {
      const embedResponse = await aiClient.models.embedContent({
        model: 'text-embedding-004',
        contents: chunk,
      });

      const embedding = embedResponse.embeddings?.[0]?.values;
      if (!embedding || !Array.isArray(embedding)) {
        console.warn('Failed to generate embedding for chunk, skipping.');
        continue;
      }

      const safeEmbedding = embedding.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
      const { error: insertError } = await supabase
        .from('knowledge_chunks')
        .insert({
          document_id: documentId.trim(),
          merchant_id: merchantId.trim(),
          chunk_index: chunkIndex,
          content: chunk,
          embedding: `[${safeEmbedding.join(',')}]`, // pgvector format
        });

      if (insertError) {
        console.error('Failed to insert knowledge chunk:', insertError);
      }
      chunkIndex++;
    }

    // 5. Update document status to READY
    await supabase
      .from('knowledge_documents')
      .update({ status: 'READY', error_message: null, updated_at: new Date().toISOString() })
      .eq('id', documentId.trim())
      .eq('merchant_id', merchantId.trim());
  } catch (err: any) {
    // Ensure document does not remain stuck in PROCESSING state on failure
    await supabase
      .from('knowledge_documents')
      .update({
        status: 'ERROR',
        error_message: (err?.message || 'Processing failed').slice(0, 500),
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId.trim())
      .eq('merchant_id', merchantId.trim());
    throw err;
  }
}
