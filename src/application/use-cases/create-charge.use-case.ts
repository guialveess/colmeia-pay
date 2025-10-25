import {
  Charge,
  PaymentMethod,
  PaymentDetails,
} from "../../domain/entities/charge.entity";
import { IChargeRepository } from "../../domain/repositories/charge.repository";
import { ICustomerRepository } from "../../domain/repositories/customer.repository.interface";
import {
  CustomerNotFoundError,
  MerchantNotFoundError,
} from "../../domain/errors/domain.errors";
import { createId } from "@paralleldrive/cuid2";
import { CreateChargeRequest } from "../dtos/charge.dto";

interface CreateChargeRequestWithMerchant extends CreateChargeRequest {
  merchantId: string;
  metadata?: {
    idempotencyKey?: string;
    [key: string]: any;
  };
}

export class CreateChargeUseCase {
  constructor(
    private chargeRepository: IChargeRepository,
    private customerRepository: ICustomerRepository,
    private merchantRepository: ICustomerRepository,
  ) { }

  async execute(request: CreateChargeRequestWithMerchant): Promise<Charge> {
    const customer = await this.customerRepository.findById(request.customerId);
    if (!customer) {
      throw new CustomerNotFoundError(request.customerId);
    }


    if (request.metadata?.idempotencyKey) {
      const existingCharge = await this.chargeRepository.findByIdempotencyKey(
        request.metadata.idempotencyKey,
      );
      if (existingCharge) {
        return existingCharge;
      }
    }

    const paymentDetails = await this.generatePaymentDetails(request);

    const charge = Charge.create({
      id: createId(),
      customerId: request.customerId,
      merchantId: request.merchantId,
      amount: request.amount,
      currency: request.currency || "BRL",
      paymentMethod: request.paymentMethod,
      description: request.description,
      paymentDetails,
      metadata: request.metadata || {},
    });

    return await this.chargeRepository.create(charge);
  }

  private async generatePaymentDetails(
    request: CreateChargeRequestWithMerchant,
  ): Promise<PaymentDetails> {
    switch (request.paymentMethod) {
      case PaymentMethod.PIX:
        return await this.generatePixDetails(request);

      case PaymentMethod.CREDIT_CARD:
        return await this.generateCreditCardDetails(request);

      case PaymentMethod.BOLETO:
        return await this.generateBoletoDetails(request);

      default:
        throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
    }
  }

  private async generatePixDetails(
    request: CreateChargeRequestWithMerchant,
  ): Promise<PaymentDetails> {
    const pixExpiresAt = request.paymentDetails?.pix?.expiresAt
      ? new Date(request.paymentDetails.pix.expiresAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const qrCode = await this.generatePixQrCode(
      request.amount,
      request.customerId,
      request.merchantId,
    );

    return {
      pix: {
        qrCode,
        qrCodeBase64: await this.generateQrCodeBase64(qrCode),
        expiresAt: pixExpiresAt,
      },
    };
  }

  private async generateCreditCardDetails(
    request: CreateChargeRequestWithMerchant,
  ): Promise<PaymentDetails> {
    if (!request.paymentDetails?.creditCard) {
      throw new Error("Credit card details are required");
    }

    const cardDetails = request.paymentDetails.creditCard;

    const cardValidation = await this.validateCreditCard(
      cardDetails.number,
      cardDetails.holderName,
      cardDetails.expiryMonth,
      cardDetails.expiryYear,
      cardDetails.cvv,
    );

    if (!cardValidation.isValid) {
      throw new Error(`Invalid credit card: ${cardValidation.error}`);
    }

    return {
      creditCard: {
        lastFourDigits: cardDetails.number.slice(-4),
        brand: cardValidation.brand,
        holderName: cardDetails.holderName,
        installments: cardDetails.installments || 1,
      },
    };
  }

  private async generateBoletoDetails(
    request: CreateChargeRequestWithMerchant,
  ): Promise<PaymentDetails> {
    if (!request.paymentDetails?.boleto) {
      throw new Error("Boleto details are required");
    }

    const dueDate = request.paymentDetails.boleto.dueDate
      ? new Date(request.paymentDetails.boleto.dueDate)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const barcode = await this.generateBoletoBarcode(request.amount, dueDate);
    const boletoUrl = await this.generateBoletoUrl(barcode);

    return {
      boleto: {
        barcode,
        url: boletoUrl,
        dueDate,
      },
    };
  }


  private async generatePixQrCode(
    amount: number,
    customerId: string,
    merchantId: string,
  ): Promise<string> {
    const payload = {
      key: merchantId,
      amount: amount.toString(),
      description: `Payment from customer ${customerId}`,
      txid: createId(),
    };

    return `pix://${Buffer.from(JSON.stringify(payload)).toString("base64")}`;
  }

  private async generateQrCodeBase64(qrCode: string): Promise<string> {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  }

  private async validateCreditCard(
    number: string,
    holderName: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string,
  ): Promise<{ isValid: boolean; brand: string; error?: string }> {
    const cleanNumber = number.replace(/\s/g, "");

    if (!/^\d{13,19}$/.test(cleanNumber)) {
      return { isValid: false, brand: "", error: "Invalid card number" };
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    if (sum % 10 !== 0) {
      return {
        isValid: false,
        brand: "",
        error: "Invalid card number (Luhn check failed)",
      };
    }

    let brand = "unknown";
    if (cleanNumber.startsWith("4")) {
      brand = "visa";
    } else if (cleanNumber.startsWith("5") || cleanNumber.startsWith("2")) {
      brand = "mastercard";
    } else if (cleanNumber.startsWith("3")) {
      brand = "amex";
    }

    return { isValid: true, brand };
  }

  private async generateBoletoBarcode(
    amount: number,
    dueDate: Date,
  ): Promise<string> {
    const amountFormatted = amount.toString().padStart(10, "0");
    const dateFormatted = dueDate.toISOString().slice(0, 10).replace(/-/g, "");
    const randomDigits = Math.random().toString().slice(2, 8);

    return `${dateFormatted}${amountFormatted}${randomDigits}`;
  }

  private async generateBoletoUrl(barcode: string): Promise<string> {
    return `https://boleto.example.com/view?barcode=${barcode}`;
  }
}
