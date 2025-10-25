import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(255, "Senha deve ter no maximo 255 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Senha e obrigatoria"),
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    isActive: z.boolean(),
    lastLoginAt: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  token: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
