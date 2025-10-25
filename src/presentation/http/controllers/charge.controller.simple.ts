import { Elysia, t } from "elysia";
import { PaymentMethod, ChargeStatus } from "../../../domain/entities/charge.entity";
import { ChargeResponse } from "../../../application/dtos/charge.dto";

export const chargeController = new Elysia({ prefix: "/charges" })
  .get("/health", () => {
    return {
      success: true,
      message: "Charges controller is working",
      timestamp: new Date().toISOString(),
    };
  })

  .post("/", async ({ body, set }) => {
    const mockCharge: ChargeResponse = {
      id: "mock-charge-" + Math.random().toString(36).substr(2, 9),
      customerId: body.customerId,
      merchantId: "mock-merchant",
      amount: body.amount,
      currency: "BRL",
      paymentMethod: body.paymentMethod || PaymentMethod.PIX,
      status: ChargeStatus.PENDING,
      description: body.description || null,
      paymentDetails: {
        pix: {
          qrCode: "mock-qr-code",
          qrCodeBase64: null,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        creditCard: null,
        boleto: null,
      },
      metadata: body.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAt: null,
      expiredAt: null,
      failureReason: null,
    };

    set.status = 201;
    return {
      success: true,
      data: mockCharge,
    };
  }, {
    body: t.Object({
      customerId: t.String(),
      amount: t.Number({ minimum: 0.01 }),
      currency: t.String({ default: "BRL" }),
      paymentMethod: t.Optional(t.Enum(PaymentMethod)),
      description: t.Optional(t.String()),
      metadata: t.Optional(t.Record(t.String(), t.Any())),
    }),
    detail: {
      summary: "Create a mock charge",
      description: "Create a mock payment charge for testing",
      tags: ["Charges"],
    },
  })

  .get("/:id", ({ params }) => {
    const mockCharge: ChargeResponse = {
      id: params.id,
      customerId: "mock-customer",
      merchantId: "mock-merchant",
      amount: 100.0,
      currency: "BRL",
      paymentMethod: PaymentMethod.PIX,
      status: ChargeStatus.PENDING,
      description: "Mock charge",
      paymentDetails: {
        pix: {
          qrCode: "mock-qr-code",
          qrCodeBase64: null,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        creditCard: null,
        boleto: null,
      },
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAt: null,
      expiredAt: null,
      failureReason: null,
    };

    return {
      success: true,
      data: mockCharge,
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      summary: "Get mock charge by ID",
      description: "Retrieve a mock charge by its ID",
      tags: ["Charges"],
    },
  })

  .get("/", ({ query }) => {
    const mockCharges: ChargeResponse[] = [
      {
        id: "mock-1",
        customerId: "mock-customer-1",
        merchantId: "mock-merchant",
        amount: 100.0,
        currency: "BRL",
        paymentMethod: PaymentMethod.PIX,
        status: ChargeStatus.PENDING,
        description: "Mock charge 1",
        paymentDetails: {
          pix: {
            qrCode: "mock-qr-code-1",
            qrCodeBase64: null,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          creditCard: null,
          boleto: null,
        },
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paidAt: null,
        expiredAt: null,
        failureReason: null,
      },
      {
        id: "mock-2",
        customerId: "mock-customer-2",
        merchantId: "mock-merchant",
        amount: 200.0,
        currency: "BRL",
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: ChargeStatus.PAID,
        description: "Mock charge 2",
        paymentDetails: {
          pix: null,
          creditCard: {
            lastFourDigits: "1234",
            brand: "visa",
            holderName: "Mock User",
            installments: 1,
          },
          boleto: null,
        },
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        expiredAt: null,
        failureReason: null,
      },
    ];

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return {
      success: true,
      data: {
        charges: mockCharges,
        pagination: {
          page,
          limit,
          total: mockCharges.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: page > 1,
        },
      },
    };
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
    detail: {
      summary: "List mock charges",
      description: "List mock charges with pagination",
      tags: ["Charges"],
    },
  });