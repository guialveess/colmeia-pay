import { Elysia } from "elysia";
import { createId } from "@paralleldrive/cuid2";
import {
  Charge,
} from "../../../domain/entities/charge.entity";
import { GetChargeUseCase, ListChargesUseCase, RefundChargeUseCase, PayChargeUseCase, UpdateChargeUseCase, CreateChargeUseCase } from "../../../application/use-cases";
import {
  validateCreateChargeRequest,
  validateUpdateChargeRequest,
  validatePayChargeRequest,
  validateRefundChargeRequest,
  validateListChargesQuery,
  ChargeResponse,
} from "../../../application/dtos/charge.dto";
import {
  ChargeValidationError,
  ChargeNotFoundError,
  ChargeOperationError,
} from "../../../domain/entities/charge.entity";
import {
  CustomerNotFoundError,
  MerchantNotFoundError,
} from "../../../domain/errors/domain.errors";

function serializeCharge(charge: Charge): ChargeResponse {
  return {
    id: charge.id,
    customerId: charge.customerId,
    merchantId: charge.merchantId,
    amount: charge.amount,
    currency: charge.currency,
    paymentMethod: charge.paymentMethod,
    status: charge.status,
    description: charge.description || null,
    paymentDetails: {
      pix: charge.paymentDetails?.pix
        ? {
            qrCode: charge.paymentDetails.pix.qrCode,
            qrCodeBase64: charge.paymentDetails.pix.qrCodeBase64 || null,
            expiresAt: charge.paymentDetails.pix.expiresAt.toISOString(),
          }
        : null,
      creditCard: charge.paymentDetails?.creditCard
        ? {
            lastFourDigits: charge.paymentDetails.creditCard.lastFourDigits,
            brand: charge.paymentDetails.creditCard.brand,
            holderName: charge.paymentDetails.creditCard.holderName,
            installments: charge.paymentDetails.creditCard.installments,
          }
        : null,
      boleto: charge.paymentDetails?.boleto
        ? {
            barcode: charge.paymentDetails.boleto.barcode,
            url: charge.paymentDetails.boleto.url,
            dueDate: charge.paymentDetails.boleto.dueDate.toISOString(),
          }
        : null,
    },
    metadata: charge.metadata,
    createdAt: charge.createdAt.toISOString(),
    updatedAt: charge.updatedAt.toISOString(),
    paidAt: charge.paidAt?.toISOString() || null,
    expiredAt: charge.expiredAt?.toISOString() || null,
    failureReason: charge.failureReason || null,
  };
}

export function chargeController({
  createChargeUseCase,
  getChargeUseCase,
  updateChargeUseCase,
  listChargesUseCase,
  payChargeUseCase,
  refundChargeUseCase,
}: {
  createChargeUseCase: CreateChargeUseCase;
  getChargeUseCase: GetChargeUseCase;
  updateChargeUseCase: UpdateChargeUseCase;
  listChargesUseCase: ListChargesUseCase;
  payChargeUseCase: PayChargeUseCase;
  refundChargeUseCase: RefundChargeUseCase;
}) {
  // ✅ MERCHANT ID FIXO USANDO CUID2 (25 caracteres)
  // Você pode gerar um novo com: createId() ou usar um existente do banco
  const DEFAULT_MERCHANT_ID = "cldefaultmerchant0001"; // 25 caracteres
  
  return (
    new Elysia({ prefix: "/charges" })
      .decorate("createChargeUseCase", createChargeUseCase)
      .decorate("getChargeUseCase", getChargeUseCase)
      .decorate("updateChargeUseCase", updateChargeUseCase)
      .decorate("listChargesUseCase", listChargesUseCase)
      .decorate("payChargeUseCase", payChargeUseCase)
      .decorate("refundChargeUseCase", refundChargeUseCase)

      .post(
        "/",
        async ({ body, set }) => {
          try {
            const validatedRequest = validateCreateChargeRequest(body);

            const charge = await createChargeUseCase.execute({
              ...validatedRequest,
              merchantId: DEFAULT_MERCHANT_ID,
            });

            set.status = 201;
            return {
              success: true,
              data: serializeCharge(charge),
            };
          } catch (error) {
            if (error instanceof ChargeValidationError) {
              set.status = 400;
              return {
                success: false,
                error: "Erro de Validacao",
                message: error.message,
              };
            }

            if (error instanceof CustomerNotFoundError) {
              set.status = 404;
              return {
                success: false,
                error: "Cliente Nao Encontrado",
                message: error.message,
              };
            }

            if (error instanceof MerchantNotFoundError) {
              set.status = 404;
              return {
                success: false,
                error: "Comerciante Nao Encontrado",
                message: error.message,
              };
            }

            console.error("Error creating charge:", error);
            set.status = 500;
            return {
              success: false,
              error: "Erro Interno do Servidor",
              message: "Falha ao criar cobranca",
            };
          }
        }
      )

      .get(
        "/:id",
        async ({ params, set }) => {
          try {
            const charge = await getChargeUseCase.execute(params.id);

            return {
              success: true,
              data: serializeCharge(charge),
            };
          } catch (error) {
            if (error instanceof ChargeNotFoundError) {
              set.status = 404;
              return {
                success: false,
                error: "Not Found",
                message: error.message,
              };
            }

            console.error("Error getting charge:", error);
            set.status = 500;
            return {
              success: false,
              error: "Internal Server Error",
              message: "Failed to get charge",
            };
          }
        }
      )

      .patch(
        "/:id",
        async ({ params, body, set }) => {
          try {
            const validatedRequest = validateUpdateChargeRequest(body);
            const charge = await updateChargeUseCase.execute(
              params.id,
              validatedRequest,
            );

            return {
              success: true,
              data: serializeCharge(charge),
            };
          } catch (error) {
            if (error instanceof ChargeNotFoundError) {
              set.status = 404;
              return {
                success: false,
                error: "Not Found",
                message: error.message,
              };
            }

            if (error instanceof ChargeValidationError) {
              set.status = 400;
              return {
                success: false,
                error: "Validation Error",
                message: error.message,
              };
            }

            console.error("Error updating charge:", error);
            set.status = 500;
            return {
              success: false,
              error: "Internal Server Error",
              message: "Failed to update charge",
            };
          }
        }
      )

      .post(
        "/:id/pay",
        async ({ params, body, set }) => {
          try {
            const validatedRequest = validatePayChargeRequest(body);
            const charge = await payChargeUseCase.execute(
              params.id,
              validatedRequest,
            );

            return {
              success: true,
              data: serializeCharge(charge),
            };
          } catch (error) {
            if (error instanceof ChargeNotFoundError) {
              set.status = 404;
              return {
                success: false,
                error: "Not Found",
                message: error.message,
              };
            }

            if (error instanceof ChargeOperationError) {
              set.status = 400;
              return {
                success: false,
                error: "Operation Error",
                message: error.message,
              };
            }

            console.error("Error paying charge:", error);
            set.status = 500;
            return {
              success: false,
              error: "Internal Server Error",
              message: "Failed to pay charge",
            };
          }
        }
      )

      .post(
        "/:id/refund",
        async ({ params, body, set }) => {
          try {
            const validatedRequest = validateRefundChargeRequest(body);
            const charge = await refundChargeUseCase.execute(
              params.id,
              validatedRequest,
            );

            return {
              success: true,
              data: serializeCharge(charge),
            };
          } catch (error) {
            if (error instanceof ChargeNotFoundError) {
              set.status = 404;
              return {
                success: false,
                error: "Not Found",
                message: error.message,
              };
            }

            if (error instanceof ChargeOperationError) {
              set.status = 400;
              return {
                success: false,
                error: "Operation Error",
                message: error.message,
              };
            }

            console.error("Error refunding charge:", error);
            set.status = 500;
            return {
              success: false,
              error: "Internal Server Error",
              message: "Failed to refund charge",
            };
          }
        }
      )

      .get(
        "/",
        async ({ query, set }) => {
          try {
            const validatedQuery = validateListChargesQuery(query);
            const userId = DEFAULT_MERCHANT_ID;

            const result = await listChargesUseCase.execute(
              validatedQuery,
              userId,
            );

            return {
              success: true,
              data: {
                charges: result.charges.map(serializeCharge),
                pagination: {
                  page: result.page,
                  limit: result.limit,
                  total: result.total,
                  totalPages: result.totalPages,
                  hasNext: result.hasNext,
                  hasPrev: result.hasPrev,
                },
              },
            };
          } catch (error) {
            console.error("Error listing charges:", error);
            set.status = 500;
            return {
              success: false,
              error: "Internal Server Error",
              message: "Failed to list charges",
            };
          }
        }
      )
  );
}