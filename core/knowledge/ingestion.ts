import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const aiClient = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

/**
 * Process a file from Supabase storage, extract text using Gemini, 
 * chunk it, and store embeddings in pgvector.
 */
export async function processKnowledgeFile(merchantId: string, documentId: string, storagePath: string) {
  if (!aiClient) {
    throw new Error('GEMINI_API_KEY is missing. Cannot process AI knowledge base.');
  }

  // 1. Download file from Supabase
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from('knowledge_base')
    .download(storagePath);

  if (downloadError || !fileData) {
    throw new Error(`Failed to download file from storage: ${downloadError?.message}`);
  }

  // 2. Prepare file for Gemini
  const mimeType = fileData.type;
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
    model: 'gemini-2.5-flash',
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
  let chunks: string[] = [];
  try {
    chunks = JSON.parse(responseText);
    if (!Array.isArray(chunks)) {
      throw new Error('Expected JSON array of strings');
    }
  } catch (err) {
    console.error('Failed to parse Gemini chunk extraction:', err);
    throw new Error('Invalid chunk extraction format');
  }

  // 4. Generate embeddings and store in Supabase
  let chunkIndex = 0;
  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    const embedResponse = await aiClient.models.embedContent({
      model: 'text-embedding-004',
      contents: chunk,
    });

    const embedding = embedResponse.embeddings?.[0]?.values;
    if (!embedding) {
      console.warn('Failed to generate embedding for chunk, skipping.');
      continue;
    }

    const { error: insertError } = await supabase
      .from('knowledge_chunks')
      .insert({
        document_id: documentId,
        merchant_id: merchantId,
        chunk_index: chunkIndex,
        content: chunk,
        embedding: `[${embedding.join(',')}]`, // pgvector format
      });

    if (insertError) {
      console.error('Failed to insert knowledge chunk:', insertError);
    }
    chunkIndex++;
  }

  // 5. Update document status to READY
  await supabase
    .from('knowledge_documents')
    .update({ status: 'READY' })
    .eq('id', documentId);
}
