import { RevenueStrategyProvider } from './provider';
import { MockStrategyProvider } from './mock';
import { GeminiStrategyProvider } from '../../integrations/gemini/client';

export * from './provider';
export * from './mock';

export function getStrategyProvider(preferAi: boolean = true): RevenueStrategyProvider {
  if (preferAi && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YourGeminiApiKeyHere') {
    return new GeminiStrategyProvider();
  }
  return new MockStrategyProvider();
}
