import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import db from "../connection";
import {
  charges,
  pixDetails,
  boletoDetails,
  creditCardDetails,
  customers,
  merchants,
  idempotencyKeys
} from "../schema";
import { Charge, PaymentDetails, ChargeStatus, PaymentMethod } from "../../../domain/entities/charge.entity";
import { IChargeRepository } from "../../../domain/repositories/charge.repository";
import { createId } from "@paralleldrive/cuid2";

export class DrizzleChargeRepository implements IChargeRepository {
  async create(charge: Charge): Promise<Charge> {
    const transaction = await db.transaction(async (tx) => {
      if (charge.metadata.idempotencyKey) {
        const existingKey = await tx
          .select()
          .from(idempotencyKeys)
          .where(eq(idempotencyKeys.key, charge.metadata.idempotencyKey))
          .limit(1);

        if (existingKey.length > 0) {
          const existingCharge = await this.findById(existingKey[0].chargeId);
          if (existingCharge) {
            return existingCharge;
          }
        }
      }

      await tx.insert(charges).values({
        id: charge.id,
        customerId: charge.customerId,
        merchantId: charge.merchantId,
        amount: charge.amount,
        currency: charge.currency,
        paymentMethod: charge.paymentMethod,
        status: charge.status,
        description: charge.description || null,
        metadata: charge.metadata,
        createdAt: charge.createdAt,
        updatedAt: charge.updatedAt,
        paidAt: charge.paidAt || null,
        expiredAt: charge.expiredAt || null,
        failureReason: charge.failureReason || null,
      });

      if (charge.paymentDetails) {
        switch (charge.paymentMethod) {
          case PaymentMethod.PIX:
            if (charge.paymentDetails.pix) {
              await tx.insert(pixDetails).values({
                id: createId(),
                chargeId: charge.id,
                qrCode: charge.paymentDetails.pix.qrCode,
                qrCodeBase64: charge.paymentDetails.pix.qrCodeBase64 || null,
                expiresAt: charge.paymentDetails.pix.expiresAt,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
            break;

          case PaymentMethod.CREDIT_CARD:
            if (charge.paymentDetails.creditCard) {
              await tx.insert(creditCardDetails).values({
                id: createId(),
                chargeId: charge.id,
                lastFourDigits: charge.paymentDetails.creditCard.lastFourDigits,
                brand: charge.paymentDetails.creditCard.brand,
                holderName: charge.paymentDetails.creditCard.holderName,
                installments: charge.paymentDetails.creditCard.installments,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
            break;

          case PaymentMethod.BOLETO:
            if (charge.paymentDetails.boleto) {
              await tx.insert(boletoDetails).values({
                id: createId(),
                chargeId: charge.id,
                barcode: charge.paymentDetails.boleto.barcode,
                url: charge.paymentDetails.boleto.url,
                dueDate: charge.paymentDetails.boleto.dueDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
            break;
        }
      }

      if (charge.metadata.idempotencyKey) {
        await tx.insert(idempotencyKeys).values({
          key: charge.metadata.idempotencyKey,
          chargeId: charge.id,
          createdAt: new Date(),
        });
      }

      return charge;
    });

    return transaction;
  }

  async findById(id: string): Promise<Charge | null> {
    const chargeData = await db
      .select({
        charge: charges,
        customer: customers,
        merchant: merchants,
      })
      .from(charges)
      .leftJoin(customers, eq(charges.customerId, customers.id))
      .leftJoin(merchants, eq(charges.merchantId, merchants.id))
      .where(eq(charges.id, id))
      .limit(1);

    if (chargeData.length === 0) {
      return null;
    }

    return await this.buildChargeFromData(chargeData[0]);
  }

  async findByCustomerId(customerId: string, options?: {
    page?: number;
    limit?: number;
    status?: ChargeStatus;
    paymentMethod?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ charges: Charge[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 10, 100);
    const offset = (page - 1) * limit;

    let queryConditions = eq(charges.customerId, customerId);

    if (options?.status) {
      queryConditions = and(queryConditions, eq(charges.status, options.status));
    }

    if (options?.paymentMethod) {
      queryConditions = and(queryConditions, eq(charges.paymentMethod, options.paymentMethod));
    }

    if (options?.startDate) {
      queryConditions = and(queryConditions, gte(charges.createdAt, options.startDate));
    }

    if (options?.endDate) {
      queryConditions = and(queryConditions, lte(charges.createdAt, options.endDate));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(charges)
      .where(queryConditions);

    const total = countResult[0]?.count || 0;

    const chargesData = await db
      .select({
        charge: charges,
        customer: customers,
        merchant: merchants,
      })
      .from(charges)
      .leftJoin(customers, eq(charges.customerId, customers.id))
      .leftJoin(merchants, eq(charges.merchantId, merchants.id))
      .where(queryConditions)
      .orderBy(desc(charges.createdAt))
      .limit(limit)
      .offset(offset);

    const chargesList = await Promise.all(
      chargesData.map(data => this.buildChargeFromData(data))
    );

    return {
      charges: chargesList,
      total,
    };
  }

  async findByMerchantId(merchantId: string, options?: {
    page?: number;
    limit?: number;
    status?: ChargeStatus;
    paymentMethod?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ charges: Charge[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 10, 100);
    const offset = (page - 1) * limit;

    let queryConditions = eq(charges.merchantId, merchantId);

    if (options?.status) {
      queryConditions = and(queryConditions, eq(charges.status, options.status));
    }

    if (options?.paymentMethod) {
      queryConditions = and(queryConditions, eq(charges.paymentMethod, options.paymentMethod));
    }

    if (options?.startDate) {
      queryConditions = and(queryConditions, gte(charges.createdAt, options.startDate));
    }

    if (options?.endDate) {
      queryConditions = and(queryConditions, lte(charges.createdAt, options.endDate));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(charges)
      .where(queryConditions);

    const total = countResult[0]?.count || 0;

    const chargesData = await db
      .select({
        charge: charges,
        customer: customers,
        merchant: merchants,
      })
      .from(charges)
      .leftJoin(customers, eq(charges.customerId, customers.id))
      .leftJoin(merchants, eq(charges.merchantId, merchants.id))
      .where(queryConditions)
      .orderBy(desc(charges.createdAt))
      .limit(limit)
      .offset(offset);

    const chargesList = await Promise.all(
      chargesData.map(data => this.buildChargeFromData(data))
    );

    return {
      charges: chargesList,
      total,
    };
  }

  async update(charge: Charge): Promise<Charge> {
    await db.transaction(async (tx) => {
      await tx
        .update(charges)
        .set({
          amount: charge.amount,
          status: charge.status,
          description: charge.description || null,
          paidAt: charge.paidAt || null,
          expiredAt: charge.expiredAt || null,
          failureReason: charge.failureReason || null,
          updatedAt: new Date(),
        })
        .where(eq(charges.id, charge.id));

      if (charge.paymentDetails) {
        switch (charge.paymentMethod) {
          case PaymentMethod.PIX:
            if (charge.paymentDetails.pix) {
              await tx
                .update(pixDetails)
                .set({
                  qrCode: charge.paymentDetails.pix.qrCode,
                  qrCodeBase64: charge.paymentDetails.pix.qrCodeBase64 || null,
                  expiresAt: charge.paymentDetails.pix.expiresAt,
                  updatedAt: new Date(),
                })
                .where(eq(pixDetails.chargeId, charge.id));
            }
            break;

          case PaymentMethod.CREDIT_CARD:
            if (charge.paymentDetails.creditCard) {
              await tx
                .update(creditCardDetails)
                .set({
                  lastFourDigits: charge.paymentDetails.creditCard.lastFourDigits,
                  brand: charge.paymentDetails.creditCard.brand,
                  holderName: charge.paymentDetails.creditCard.holderName,
                  installments: charge.paymentDetails.creditCard.installments,
                  updatedAt: new Date(),
                })
                .where(eq(creditCardDetails.chargeId, charge.id));
            }
            break;

          case PaymentMethod.BOLETO:
            if (charge.paymentDetails.boleto) {
              await tx
                .update(boletoDetails)
                .set({
                  barcode: charge.paymentDetails.boleto.barcode,
                  url: charge.paymentDetails.boleto.url,
                  dueDate: charge.paymentDetails.boleto.dueDate,
                  updatedAt: new Date(),
                })
                .where(eq(boletoDetails.chargeId, charge.id));
            }
            break;
        }
      }
    });

    return charge;
  }

  async delete(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(pixDetails).where(eq(pixDetails.chargeId, id));
      await tx.delete(creditCardDetails).where(eq(creditCardDetails.chargeId, id));
      await tx.delete(boletoDetails).where(eq(boletoDetails.chargeId, id));

      await tx.delete(idempotencyKeys).where(eq(idempotencyKeys.chargeId, id));

      await tx.delete(charges).where(eq(charges.id, id));
    });
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Charge | null> {
    const keyData = await db
      .select()
      .from(idempotencyKeys)
      .where(eq(idempotencyKeys.key, idempotencyKey))
      .limit(1);

    if (keyData.length === 0) {
      return null;
    }

    return await this.findById(keyData[0].chargeId);
  }

  async findPendingCharges(): Promise<Charge[]> {
    const chargesData = await db
      .select({
        charge: charges,
        customer: customers,
        merchant: merchants,
      })
      .from(charges)
      .leftJoin(customers, eq(charges.customerId, customers.id))
      .leftJoin(merchants, eq(charges.merchantId, merchants.id))
      .where(eq(charges.status, ChargeStatus.PENDING))
      .orderBy(charges.createdAt);

    return await Promise.all(
      chargesData.map(data => this.buildChargeFromData(data))
    );
  }

  async getStatistics(merchantId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalCharges: number;
    totalAmount: number;
    paidCharges: number;
    paidAmount: number;
    pendingCharges: number;
    pendingAmount: number;
    failedCharges: number;
    failedAmount: number;
  }> {
    let conditions = sql`1=1`;

    if (merchantId) {
      conditions = and(conditions, eq(charges.merchantId, merchantId));
    }

    if (startDate) {
      conditions = and(conditions, gte(charges.createdAt, startDate));
    }

    if (endDate) {
      conditions = and(conditions, lte(charges.createdAt, endDate));
    }

    const stats = await db
      .select({
        totalCharges: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(amount)`,
        paidCharges: sql<number>`count(*) filter (where status = 'PAID')`,
        paidAmount: sql<number>`sum(amount) filter (where status = 'PAID')`,
        pendingCharges: sql<number>`count(*) filter (where status = 'PENDING')`,
        pendingAmount: sql<number>`sum(amount) filter (where status = 'PENDING')`,
        failedCharges: sql<number>`count(*) filter (where status = 'FAILED')`,
        failedAmount: sql<number>`sum(amount) filter (where status = 'FAILED')`,
      })
      .from(charges)
      .where(conditions);

    return {
      totalCharges: stats[0]?.totalCharges || 0,
      totalAmount: stats[0]?.totalAmount || 0,
      paidCharges: stats[0]?.paidCharges || 0,
      paidAmount: stats[0]?.paidAmount || 0,
      pendingCharges: stats[0]?.pendingCharges || 0,
      pendingAmount: stats[0]?.pendingAmount || 0,
      failedCharges: stats[0]?.failedCharges || 0,
      failedAmount: stats[0]?.failedAmount || 0,
    };
  }

  private async buildChargeFromData(data: {
    charge: any;
    customer?: any;
    merchant?: any;
  }): Promise<Charge> {
    const { charge } = data;

    // Get payment details based on payment method
    let paymentDetails: PaymentDetails | undefined;

    switch (charge.paymentMethod) {
      case PaymentMethod.PIX:
        const pixData = await db
          .select()
          .from(pixDetails)
          .where(eq(pixDetails.chargeId, charge.id))
          .limit(1);

        if (pixData.length > 0) {
          paymentDetails = {
            pix: {
              qrCode: pixData[0].qrCode,
              qrCodeBase64: pixData[0].qrCodeBase64 || undefined,
              expiresAt: pixData[0].expiresAt,
            },
          };
        }
        break;

      case PaymentMethod.CREDIT_CARD:
        const creditCardData = await db
          .select()
          .from(creditCardDetails)
          .where(eq(creditCardDetails.chargeId, charge.id))
          .limit(1);

        if (creditCardData.length > 0) {
          paymentDetails = {
            creditCard: {
              lastFourDigits: creditCardData[0].lastFourDigits,
              brand: creditCardData[0].brand,
              holderName: creditCardData[0].holderName,
              installments: creditCardData[0].installments,
            },
          };
        }
        break;

      case PaymentMethod.BOLETO:
        const boletoData = await db
          .select()
          .from(boletoDetails)
          .where(eq(boletoDetails.chargeId, charge.id))
          .limit(1);

        if (boletoData.length > 0) {
          paymentDetails = {
            boleto: {
              barcode: boletoData[0].barcode,
              url: boletoData[0].url,
              dueDate: boletoData[0].dueDate,
            },
          };
        }
        break;
    }

    return Charge.from({
      id: charge.id,
      customerId: charge.customerId,
      merchantId: charge.merchantId,
      amount: charge.amount,
      currency: charge.currency,
      paymentMethod: charge.paymentMethod,
      status: charge.status,
      description: charge.description || undefined,
      paymentDetails,
      metadata: charge.metadata || {},
      createdAt: charge.createdAt,
      updatedAt: charge.updatedAt,
      paidAt: charge.paidAt || undefined,
      expiredAt: charge.expiredAt || undefined,
      failureReason: charge.failureReason || undefined,
    });
  }
}