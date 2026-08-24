import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'OWNER',
  'OPS_MANAGER',
  'AUDITOR'
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  merchantId: z.string(),
  permissions: z.array(z.string()),
  avatarUrl: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  keyPrefix: z.string(), // e.g. "mp_live_..."
  hashedKey: z.string(),
  merchantId: z.string(),
  createdAt: z.number().int().positive(),
  lastUsedAt: z.number().int().optional(),
  role: UserRoleSchema.default('OWNER'),
});
export type ApiKey = z.infer<typeof ApiKeySchema>;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  OWNER: [
    'opportunities:read',
    'opportunities:execute',
    'opportunities:override',
    'policy:read',
    'policy:write',
    'api_keys:manage',
    'audit:read',
    'stress_test:run',
  ],
  OPS_MANAGER: [
    'opportunities:read',
    'opportunities:execute',
    'policy:read',
    'audit:read',
    'stress_test:run',
  ],
  AUDITOR: [
    'opportunities:read',
    'policy:read',
    'audit:read',
  ],
};
