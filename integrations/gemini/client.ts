import { GoogleGenAI } from '@google/genai';
import { RevenueStrategyProvider } from '../../core/strategy/provider';
import { MockStrategyProvider } from '../../core/strategy/mock';
import { RevenueOpportunity } from '../../core/domain/opportunity';
import { StrategyRecommendation, StrategyRecommendationSchema } from '../../core/domain/strategy';

export class GeminiStrategyProvider implements RevenueStrategyProvider {
  public readonly name = 'GeminiStrategyProvider';
  private aiClient: GoogleGenAI | null = null;
  private modelName: string;
  private fallbackProvider: MockStrategyProvider;

  constructor(apiKey?: string, modelName: string = 'gemini-2.5-flash') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || modelName;
    this.fallbackProvider = new MockStrategyProvider();

    if (key && key !== 'YourGeminiApiKeyHere') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.warn('[GeminiStrategyProvider] Failed to initialize GoogleGenAI client, falling back to mock provider:', err);
      }
    }
  }

  public async generateStrategy(opportunity: RevenueOpportunity): Promise<StrategyRecommendation> {
    if (!this.aiClient) {
      return this.fallbackProvider.generateStrategy(opportunity);
    }

    const promptContext = {
      opportunityId: opportunity.id,
      opportunityType: opportunity.type,
      amountInr: opportunity.amountPaise / 100,
      paymentMethod: opportunity.evidence.paymentMethod,
      bankOrIssuer: opportunity.evidence.bankOrIssuer,
      failureCode: opportunity.evidence.failureCode,
      failureDescription: opportunity.evidence.failureDescription,
      consecutiveFailures: opportunity.evidence.consecutiveFailures,
      customerLtvInr: opportunity.evidence.customerLtvPaise / 100,
      calculatedExpectedValueInr: opportunity.expectedValue.netExpectedValuePaise / 100,
      recoveryProbability: opportunity.expectedValue.pSuccess,
      intentScore: opportunity.evidence.intentScore,
    };

    const systemInstruction = `You are MerchantPulse AI, a senior payment ops intelligence engine for Razorpay merchants.
Your job is to analyze validated deterministic payment failure facts and formulate the highest-ROI, policy-compliant recovery recommendation.

ABSOLUTE RULES:
1. ONLY recommend actions from this approved list: "CREATE_PAYMENT_LINK", "SEND_PAYMENT_REMINDER", "NOTIFY_ALTERNATIVE_METHOD", "ESCALATE_TO_OPS", "NO_ACTION".
2. NEVER suggest refunds, discounts, or imaginary Razorpay endpoints.
3. Keep messaging concise, empathetic, and professional.
4. Output STRICT JSON matching the schema below without any Markdown wrapper or extra text.`;

    const schemaPrompt = `
Generate a valid JSON object matching this schema:
{
  "opportunityId": "${opportunity.id}",
  "diagnosis": "concise technical diagnosis of the failure (10-300 chars)",
  "recommendedActionType": "CREATE_PAYMENT_LINK | SEND_PAYMENT_REMINDER | NOTIFY_ALTERNATIVE_METHOD | ESCALATE_TO_OPS | NO_ACTION",
  "actionPayload": {},
  "confidenceScore": 0.0 to 1.0,
  "rationale": "clear business and economic justification (10-500 chars)",
  "suggestedExpiryMinutes": integer minutes (e.g. 120),
  "customerMessaging": {
    "smsText": "SMS copy with {short_url} placeholder",
    "emailSubject": "Subject line",
    "emailBody": "Email body"
  }
}

FACTS CONTEXT:
${JSON.stringify(promptContext, null, 2)}
`;

    try {
      const response = await this.aiClient.models.generateContent({
        model: this.modelName,
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${schemaPrompt}` }] }
        ],
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '';
      const parsedJson = JSON.parse(responseText);
      const validationResult = StrategyRecommendationSchema.safeParse(parsedJson);

      if (validationResult.success) {
        return validationResult.data;
      }

      console.warn('[GeminiStrategyProvider] AI output schema validation failed, activating deterministic fallback:', validationResult.error);
      return this.fallbackProvider.generateStrategy(opportunity);
    } catch (err) {
      console.warn('[GeminiStrategyProvider] API invocation error, using deterministic fallback:', err);
      return this.fallbackProvider.generateStrategy(opportunity);
    }
  }
}
