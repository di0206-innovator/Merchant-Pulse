import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import type { StrategyRecommendation } from '@/core/types';
import type { RevenueStrategyProvider, StrategyInput } from '@/integrations/ai/provider';
import { StrategyInputSchema } from '@/integrations/ai/provider';

const GeminiRecommendationSchema = z.object({
  selected_index: z.number().int().nonnegative(),
  strategy_score: z.number().min(0).max(1),
  assumptions: z.array(z.string()),
  rationale: z.string().min(1),
});

export class GeminiRevenueStrategyProvider implements RevenueStrategyProvider {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(apiKey: string, model = 'gemini-2.5-flash') {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async rankInterventions(rawInput: StrategyInput): Promise<StrategyRecommendation> {
    const input = StrategyInputSchema.parse(rawInput);
    const prompt = [
      'You are the strategy layer for a fintech revenue intelligence system.',
      'You may rank precomputed intervention options, explain the ranking, and state assumptions.',
      'You must not alter money amounts, invent probabilities, change policy constraints, or invent APIs.',
      'Select exactly one candidate by index.',
      JSON.stringify(input),
    ].join('\n');

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            selected_index: { type: 'INTEGER' },
            strategy_score: { type: 'NUMBER' },
            assumptions: { type: 'ARRAY', items: { type: 'STRING' } },
            rationale: { type: 'STRING' },
          },
          required: ['selected_index', 'strategy_score', 'assumptions', 'rationale'],
        },
      },
    });

    const parsed = GeminiRecommendationSchema.parse(JSON.parse(response.text ?? '{}'));
    const selected = input.candidates[parsed.selected_index];
    if (!selected) throw new Error('Gemini selected an invalid intervention index');

    return {
      recommendation: { ...selected, rationale: parsed.rationale },
      alternatives: input.candidates.filter((_, index) => index !== parsed.selected_index),
      strategy_score: parsed.strategy_score,
      assumptions: parsed.assumptions,
    };
  }
}
