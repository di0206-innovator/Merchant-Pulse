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
