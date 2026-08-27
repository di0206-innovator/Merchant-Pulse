import { z } from 'zod';
import { ActionTypeSchema } from './strategy';

export const ExecutionStatusSchema = z.enum([
  'PENDING',
  'SUCCESS',
  'FAILED',
  'SKIPPED'
]);
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;

export const ExecutionRecordSchema = z.object({
  id: z.string().startsWith('exec_'),
  opportunityId: z.string(),
  actionType: ActionTypeSchema,
  status: ExecutionStatusSchema,
  razorpayReferenceId: z.string().optional(), // e.g. plink_xxxx
  razorpayShortUrl: z.string().url().optional(),
  payloadSent: z.record(z.unknown()),
  responseReceived: z.record(z.unknown()).optional(),
  errorMessage: z.string().optional(),
  executedAt: z.number().int().positive(),
});
export type ExecutionRecord = z.infer<typeof ExecutionRecordSchema>;

export const ExecutionIntentStateSchema = z.enum([
  'EXECUTION_REQUESTED',
  'EXECUTION_IN_FLIGHT',
  'EXECUTION_SUCCEEDED',
  'EXECUTION_FAILED',
]);
export type ExecutionIntentState = z.infer<typeof ExecutionIntentStateSchema>;

export interface ExecutionIntent {
  intentKey: string;
  opportunityId: string;
  merchantId: string;
  actionType: string;
  state: ExecutionIntentState;
  record?: ExecutionRecord;
  createdAt: number;
  updatedAt: number;
}
