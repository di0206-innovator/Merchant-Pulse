import { GoogleGenAI } from '@google/genai';
import { createServerClient } from '@/lib/supabase/server';

const MAX_KNOWLEDGE_FILE_BYTES = 20 * 1024 * 1024; // 20 MB limit
const MAX_CHUNKS_PER_DOCUMENT = 200;
const MAX_CHUNK_CHAR_LENGTH = 4000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YourGeminiApiKeyHere' || apiKey.length < 25) {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

function validateStoragePath(storagePath: string): string {
  if (typeof storagePath !== 'string' || !storagePath.trim()) {
    throw new Error('Invalid storagePath');
  }
  const normalized = storagePath.trim();
  if (
    normalized.includes('..') ||
    normalized.startsWith('/') ||
    normalized.startsWith('\\') ||
    /[\x00-\x1F\x7F]/.test(normalized)
  ) {
    throw new Error('Rejected unsafe storagePath');
  }
  return normalized;
}

/**
 * Process a file from Supabase storage, extract text using Gemini,
 * chunk it, and store embeddings in pgvector.
 */
export async function processKnowledgeFile(merchantId: string, documentId: string, storagePath: string) {
  if (!merchantId || typeof merchantId !== 'string' || !documentId || typeof documentId !== 'string') {
    throw new Error('Missing valid merchantId or documentId.');
  }

  const safePath = validateStoragePath(storagePath);
  const aiClient = getAiClient();
  if (!aiClient) {
    throw new Error('GEMINI_API_KEY is missing or unconfigured. Cannot process AI knowledge base.');
  }

  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase server credentials (SUPABASE_SERVICE_ROLE_KEY) are not configured.');
  }

  try {
    // 1. Download file from Supabase
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('knowledge_base')
      .download(safePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file from storage: ${downloadError?.message || 'File not found'}`);
    }

    if (fileData.size > MAX_KNOWLEDGE_FILE_BYTES) {
      throw new Error(`File exceeds maximum allowed size of ${MAX_KNOWLEDGE_FILE_BYTES} bytes.`);
    }

    // 2. Prepare file for Gemini
    const mimeType = fileData.type || 'application/octet-stream';
    const arrayBuffer = await fileData.arrayBuffer();
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
          document_id: documentId,
          merchant_id: merchantId,
          chunk_index: chunkIndex,
          content: chunk,
          embedding: `[${safeEmbedding.join(',')}]`,
        });

      if (insertError) {
        console.error('Failed to insert knowledge chunk:', insertError);
      }
      chunkIndex++;
    }

    // 5. Update document status to READY
    await supabase
      .from('knowledge_documents')
      .update({ status: 'READY', error_message: null })
      .eq('id', documentId)
      .eq('merchant_id', merchantId);
  } catch (err: any) {
    await supabase
      .from('knowledge_documents')
      .update({
        status: 'ERROR',
        error_message: (err?.message || 'Knowledge processing error').slice(0, 500),
      })
      .eq('id', documentId)
      .eq('merchant_id', merchantId);
    throw err;
  }
}
