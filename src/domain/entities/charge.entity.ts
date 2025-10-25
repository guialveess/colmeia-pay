import { randomUUID } from "crypto";
import { z } from "zod";

export enum PaymentMethod {
  PIX = "PIX",
  CREDIT_CARD = "CREDIT_CARD",
  BOLETO = "BOLETO",
}

export enum ChargeStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface PaymentDetails {
  pix?: {
    qrCode: string;
    qrCodeBase64?: string;
    expiresAt: Date;
  };
  creditCard?: {
    lastFourDigits: string;
    brand: string;
    holderName: string;
    installments: number;
  };
  boleto?: {
    barcode: string;
    url: string;
    dueDate: Date;
  };
}

export interface ChargeMetadata {
  idempotencyKey?: string;
  description?: string;
  callbackUrl?: string;
  [key: string]: any;
}

export class Charge {
  public readonly id: string;
  public readonly customerId: string;
  public readonly merchantId: string;
  public amount: number;
  public readonly currency: string;
  public readonly paymentMethod: PaymentMethod;
  public status: ChargeStatus;
  public description?: string;
  public paymentDetails?: PaymentDetails;
  public readonly metadata: ChargeMetadata;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public paidAt?: Date;
  public expiredAt?: Date;
  public failureReason?: string;

  private constructor(data: ChargeData) {
    this.id = data.id;
    this.customerId = data.customerId;
    this.merchantId = data.merchantId;
    this.amount = data.amount;
    this.currency = data.currency;
    this.paymentMethod = data.paymentMethod;
    this.status = data.status;
    this.description = data.description;
    this.paymentDetails = data.paymentDetails;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.paidAt = data.paidAt;
    this.expiredAt = data.expiredAt;
    this.failureReason = data.failureReason;
  }

  public static create(data: CreateChargeData): Charge {
    const charge = new Charge({
      id: data.id || randomUUID(),
      customerId: data.customerId,
      merchantId: data.merchantId,
      amount: data.amount,
      currency: data.currency || "BRL",
      paymentMethod: data.paymentMethod,
      status: ChargeStatus.PENDING,
      description: data.description,
      paymentDetails: data.paymentDetails,
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    charge.validate();
    return charge;
  }

  public static from(data: ChargeData): Charge {
    return new Charge({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
      expiredAt: data.expiredAt ? new Date(data.expiredAt) : undefined,
    });
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new ChargeValidationError("O valor deve ser maior que 0");
    }

    if (this.amount > 999999999) {
      throw new ChargeValidationError("O valor excede o maximo permitido");
    }

    if (!this.customerId) {
      throw new ChargeValidationError("ID do cliente e obrigatorio");
    }

    if (!this.merchantId) {
      throw new ChargeValidationError("ID do comerciante e obrigatorio");
    }

    if (!Object.values(PaymentMethod).includes(this.paymentMethod)) {
      throw new ChargeValidationError("Metodo de pagamento invalido");
    }

    if (!Object.values(ChargeStatus).includes(this.status)) {
      throw new ChargeValidationError("Status da cobranca invalido");
    }

    this.validatePaymentDetails();
  }

  private validatePaymentDetails(): void {
    if (!this.paymentDetails) return;

    switch (this.paymentMethod) {
      case PaymentMethod.PIX:
        if (!this.paymentDetails.pix?.qrCode) {
          throw new ChargeValidationError("QR Code PIX e obrigatorio");
        }
        if (!this.paymentDetails.pix?.expiresAt) {
          throw new ChargeValidationError("Data de expiracao PIX e obrigatorio");
        }
        break;

      case PaymentMethod.CREDIT_CARD:
        if (!this.paymentDetails.creditCard?.lastFourDigits) {
          throw new ChargeValidationError("Ultimos 4 digitos do cartao sao obrigatorios");
        }
        if (!this.paymentDetails.creditCard?.brand) {
          throw new ChargeValidationError("Bandeira do cartao e obrigatorio");
        }
        if (!this.paymentDetails.creditCard?.installments ||
            this.paymentDetails.creditCard.installments < 1) {
          throw new ChargeValidationError("Parcelas do cartao devem ser pelo menos 1");
        }
        break;

      case PaymentMethod.BOLETO:
        if (!this.paymentDetails.boleto?.barcode) {
          throw new ChargeValidationError("Codigo de barras do boleto e obrigatorio");
        }
        if (!this.paymentDetails.boleto?.url) {
          throw new ChargeValidationError("URL do boleto e obrigatoria");
        }
        if (!this.paymentDetails.boleto?.dueDate) {
          throw new ChargeValidationError("Data de vencimento do boleto e obrigatoria");
        }
        break;
    }
  }

  public pay(): void {
    if (this.status !== ChargeStatus.PENDING) {
      throw new ChargeOperationError(`Nao e possivel pagar cobranca com status ${this.status}`);
    }

    this.status = ChargeStatus.PAID;
    this.paidAt = new Date();
    this.updatedAt = new Date();
  }

  public fail(reason: string): void {
    if (this.status !== ChargeStatus.PENDING) {
      throw new ChargeOperationError(`Nao e possivel falhar cobranca com status ${this.status}`);
    }

    this.status = ChargeStatus.FAILED;
    this.failureReason = reason;
    this.updatedAt = new Date();
  }

  public expire(): void {
    if (this.status !== ChargeStatus.PENDING) {
      throw new ChargeOperationError(`Nao e possivel expirar cobranca com status ${this.status}`);
    }

    this.status = ChargeStatus.EXPIRED;
    this.expiredAt = new Date();
    this.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.status !== ChargeStatus.PENDING) {
      throw new ChargeOperationError(`Nao e possivel cancelar cobranca com status ${this.status}`);
    }

    this.status = ChargeStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public refund(reason?: string): void {
    if (this.status !== ChargeStatus.PAID) {
      throw new ChargeOperationError(`Nao e possivel reembolsar cobranca com status ${this.status}`);
    }

    this.status = ChargeStatus.REFUNDED;
    this.failureReason = reason;
    this.updatedAt = new Date();
  }

  public updateAmount(newAmount: number): void {
    if (this.status !== ChargeStatus.PENDING) {
      throw new ChargeOperationError(`Nao e possivel atualizar valor da cobranca com status ${this.status}`);
    }

    if (newAmount <= 0) {
      throw new ChargeValidationError("O valor deve ser maior que 0");
    }

    if (newAmount > 999999999) {
      throw new ChargeValidationError("O valor excede o maximo permitido");
    }

    this.amount = newAmount;
    this.updatedAt = new Date();
  }

  public isPending(): boolean {
    return this.status === ChargeStatus.PENDING;
  }

  public isPaid(): boolean {
    return this.status === ChargeStatus.PAID;
  }

  public isFailed(): boolean {
    return this.status === ChargeStatus.FAILED;
  }

  public isExpired(): boolean {
    return this.status === ChargeStatus.EXPIRED;
  }

  public canBePaid(): boolean {
    return this.status === ChargeStatus.PENDING;
  }

  public canBeCancelled(): boolean {
    return this.status === ChargeStatus.PENDING;
  }

  public canBeRefunded(): boolean {
    return this.status === ChargeStatus.PAID;
  }

  public toJSON(): ChargeJSON {
    return {
      id: this.id,
      customerId: this.customerId,
      merchantId: this.merchantId,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      status: this.status,
      description: this.description,
      paymentDetails: this.paymentDetails,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      paidAt: this.paidAt,
      expiredAt: this.expiredAt,
      failureReason: this.failureReason,
    };
  }
}

// Types
export interface CreateChargeData {
  id?: string;
  customerId: string;
  merchantId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  description?: string;
  paymentDetails?: PaymentDetails;
  metadata?: ChargeMetadata;
}

export interface ChargeData extends CreateChargeData {
  id: string;
  currency: string;
  status: ChargeStatus;
  metadata: ChargeMetadata;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  expiredAt?: Date;
  failureReason?: string;
}

export interface ChargeJSON {
  id: string;
  customerId: string;
  merchantId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: ChargeStatus;
  description?: string;
  paymentDetails?: PaymentDetails;
  metadata: ChargeMetadata;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  expiredAt?: Date;
  failureReason?: string;
}

export const CreateChargeSchema = z.object({
  customerId: z.string().min(1, "ID do cliente e obrigatorio"),
  merchantId: z.string().min(1, "ID do comerciante e obrigatorio"),
  amount: z.number().min(0.01, "O valor deve ser maior que 0").max(999999999, "O valor excede o maximo permitido"),
  currency: z.string().default("BRL"),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Metodo de pagamento invalido" }),
  }),
  description: z.string().optional(),
  paymentDetails: z.object({
    pix: z.object({
      qrCode: z.string().min(1, "QR Code PIX e obrigatorio"),
      qrCodeBase64: z.string().optional(),
      expiresAt: z.date({
        errorMap: () => ({ message: "Data de expiracao PIX invalida" }),
      }),
    }).optional(),
    creditCard: z.object({
      lastFourDigits: z.string().regex(/^\d{4}$/, "Os ultimos 4 digitos devem ser exatamente 4 digitos"),
      brand: z.string().min(1, "Bandeira do cartao e obrigatorio"),
      holderName: z.string().min(1, "Nome do titular e obrigatorio"),
      installments: z.number().min(1, "As parcelas devem ser pelo menos 1").max(12, "Maximo de 12 parcelas permitidas"),
    }).optional(),
    boleto: z.object({
      barcode: z.string().min(1, "Codigo de barras do boleto e obrigatorio"),
      url: z.string().url("URL do boleto invalida"),
      dueDate: z.date({
        errorMap: () => ({ message: "Data de vencimento do boleto invalida" }),
      }),
    }).optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => {
    if (data.paymentMethod === PaymentMethod.PIX && !data.paymentDetails?.pix) {
      return false;
    }
    if (data.paymentMethod === PaymentMethod.CREDIT_CARD && !data.paymentDetails?.creditCard) {
      return false;
    }
    if (data.paymentMethod === PaymentMethod.BOLETO && !data.paymentDetails?.boleto) {
      return false;
    }
    return true;
  },
  {
    message: "Detalhes de pagamento sao obrigatorios para o metodo de pagamento selecionado",
    path: ["paymentDetails"],
  }
);

export class ChargeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChargeValidationError";
  }
}

export class ChargeNotFoundError extends Error {
  constructor(id: string) {
    super(`Cobranca com ID ${id} nao encontrada`);
    this.name = "ChargeNotFoundError";
  }
}

export class ChargeOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChargeOperationError";
  }
}