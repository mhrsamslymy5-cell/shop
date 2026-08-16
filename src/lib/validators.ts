import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  name: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const createOrderSchema = z.object({
  planId: z.string().min(1),
  couponCode: z.string().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  planId: z.string().min(1),
});

export const createTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(1).max(5000),
});

export const ticketMessageSchema = z.object({
  message: z.string().min(1).max(5000),
});

export const planUpsertSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().int().nonnegative(),
  volumeGB: z.number().int().positive(),
  durationDays: z.number().int().positive(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const configUpsertSchema = z.object({
  protocol: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  uri: z.string().min(1),
  metadata: z.record(z.any()).optional().nullable(),
  status: z.enum(["AVAILABLE", "SOLD", "DISABLED"]).optional(),
});

export const couponUpsertSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().positive(),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});
