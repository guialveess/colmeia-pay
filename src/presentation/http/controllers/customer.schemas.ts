import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255, "Nome deve ter no maximo 255 caracteres"),
  email: z.string().email("Email invalido"),
  document: z.string().min(5, "Documento deve ter pelo menos 5 caracteres").max(32, "Documento deve ter no maximo 32 caracteres"),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres").max(32, "Telefone deve ter no maximo 32 caracteres").optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(255, "Senha deve ter no maximo 255 caracteres").optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerResponseSchema = z.object({
  id: z.string().min(10).max(25),
  name: z.string(),
  email: z.string(),
  document: z.string(),
  phone: z.string().nullable(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const customerParamsSchema = z.object({
  id: z.string(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerParams = z.infer<typeof customerParamsSchema>;
