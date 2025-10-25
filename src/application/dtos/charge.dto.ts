import { z } from "zod";
import {
  PaymentMethod,
  ChargeStatus,
} from "../../domain/entities/charge.entity";

export const CreateChargeRequestSchema = z
  .object({
    customerId: z.string().min(1, "Customer ID is required"),
    amount: z
      .number()
      .min(0.01, "Amount must be greater than 0")
      .max(999999999, "Amount exceeds maximum"),
    currency: z.string().default("BRL"),
    paymentMethod: z.nativeEnum(PaymentMethod).catch(() => {
      throw new Error("Invalid payment method");
    }),
    description: z.string().optional(),
    paymentDetails: z
      .object({
        pix: z
          .object({
            expiresAt: z.string().datetime({
              message:
                "Invalid PIX expiration date format. Use ISO 8601 format.",
            }),
          })
          .optional(),
        creditCard: z
          .object({
            number: z
              .string()
              .regex(
                /^\d{13,19}$/,
                "Credit card number must be between 13 and 19 digits",
              ),
            holderName: z.string().min(1, "Holder name is required"),
            expiryMonth: z
              .string()
              .regex(/^(0[1-9]|1[0-2])$/, "Invalid expiry month"),
            expiryYear: z.string().regex(/^\d{2,4}$/, "Invalid expiry year"),
            cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
            installments: z
              .number()
              .min(1, "Installments must be at least 1")
              .max(12, "Maximum 12 installments allowed"),
          })
          .optional(),
        boleto: z
          .object({
            dueDate: z.string().datetime({
              message: "Invalid boleto due date format. Use ISO 8601 format.",
            }),
            instructions: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .refine(
    (data) => {
      if (
        data.paymentMethod === PaymentMethod.PIX &&
        !data.paymentDetails?.pix
      ) {
        return false;
      }
      if (
        data.paymentMethod === PaymentMethod.CREDIT_CARD &&
        !data.paymentDetails?.creditCard
      ) {
        return false;
      }
      if (
        data.paymentMethod === PaymentMethod.BOLETO &&
        !data.paymentDetails?.boleto
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Payment details are required for the selected payment method",
      path: ["paymentDetails"],
    },
  );

export const UpdateChargeRequestSchema = z.object({
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(999999999, "Amount exceeds maximum")
    .optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const PayChargeRequestSchema = z.object({
  paymentId: z.string().optional(),
  paidAt: z
    .string()
    .datetime({
      message: "Invalid payment date format. Use ISO 8601 format.",
    })
    .optional(),
});

export const RefundChargeRequestSchema = z.object({
  reason: z.string().optional(),
  amount: z
    .number()
    .min(0.01, "Refund amount must be greater than 0")
    .optional(),
});

export const ListChargesQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .transform(Number)
    .default(10),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform(Number)
    .default(10),
  customerId: z.string().optional(),
  merchantId: z.string().optional(),
  status: z.nativeEnum(ChargeStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  startDate: z
    .string()
    .datetime({
      message: "Invalid start date format. Use ISO 8601 format.",
    })
    .optional(),
  endDate: z
    .string()
    .datetime({
      message: "Invalid end date format. Use ISO 8601 format.",
    })
    .optional(),
});

export const ChargeResponseSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  merchantId: z.string(),
  amount: z.number(),
  currency: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  status: z.nativeEnum(ChargeStatus),
  description: z.string().nullable(),
  paymentDetails: z.object({
    pix: z
      .object({
        qrCode: z.string(),
        qrCodeBase64: z.string().nullable(),
        expiresAt: z.string().datetime(),
      })
      .nullable(),
    creditCard: z
      .object({
        lastFourDigits: z.string(),
        brand: z.string(),
        holderName: z.string(),
        installments: z.number(),
      })
      .nullable(),
    boleto: z
      .object({
        barcode: z.string(),
        url: z.string(),
        dueDate: z.string().datetime(),
      })
      .nullable(),
  }),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  paidAt: z.string().datetime().nullable(),
  expiredAt: z.string().datetime().nullable(),
  failureReason: z.string().nullable(),
});

export const ListChargesResponseSchema = z.object({
  charges: z.array(ChargeResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const PaymentDetailsResponseSchema = z.object({
  paymentId: z.string().optional(),
  status: z.string(),
  processedAt: z.string().datetime().optional(),
  amount: z.number(),
  currency: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  details: z.record(z.string(), z.any()),
});

export const validateCreateChargeRequest = (
  data: unknown,
): CreateChargeRequest => {
  return CreateChargeRequestSchema.parse(data);
};

export const validateUpdateChargeRequest = (
  data: unknown,
): UpdateChargeRequest => {
  return UpdateChargeRequestSchema.parse(data);
};

export const validatePayChargeRequest = (data: unknown): PayChargeRequest => {
  return PayChargeRequestSchema.parse(data);
};

export const validateRefundChargeRequest = (
  data: unknown,
): RefundChargeRequest => {
  return RefundChargeRequestSchema.parse(data);
};

export const validateListChargesQuery = (data: unknown): ListChargesQuery => {
  return ListChargesQuerySchema.parse(data);
};


export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.array(z.string()).optional(),
  code: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export type CreateChargeRequest = z.infer<typeof CreateChargeRequestSchema>;
export type UpdateChargeRequest = z.infer<typeof UpdateChargeRequestSchema>;
export type PayChargeRequest = z.infer<typeof PayChargeRequestSchema>;
export type RefundChargeRequest = z.infer<typeof RefundChargeRequestSchema>;
export type ListChargesQuery = z.infer<typeof ListChargesQuerySchema>;
export type ChargeResponse = z.infer<typeof ChargeResponseSchema>;
export type ListChargesResponse = z.infer<typeof ListChargesResponseSchema>;
export type PaymentDetailsResponse = z.infer<typeof PaymentDetailsResponseSchema>;
