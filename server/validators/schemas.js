import { z } from 'zod';

// Schema for validating Telegram init data
export const telegramInitDataSchema = z.object({
  query_id: z.string().optional(),
  user: z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    username: z.string().optional(),
    language_code: z.string().optional(),
    photo_url: z.string().optional()
  }).optional(),
  auth_date: z.number(),
  hash: z.string()
});

// Schema for validating task completion
export const taskCompletionSchema = z.object({
  taskId: z.number().int().positive(),
  progress: z.number().int().min(0)
});

// Schema for validating referral claim
export const referralClaimSchema = z.object({
  referralCode: z.string().min(6)
});

// Schema for validating transaction creation
export const transactionSchema = z.object({
  amount: z.number().int(),
  type: z.enum(['deposit', 'withdraw', 'task_reward', 'referral_bonus']),
  description: z.string()
});
