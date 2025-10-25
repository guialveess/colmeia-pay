import { Charge, ChargeStatus, PaymentMethod } from "../entities/charge.entity";

export interface IChargeRepository {
  create(charge: Charge): Promise<Charge>;
  findById(id: string): Promise<Charge | null>;
  findByCustomerId(customerId: string, options?: {
    page?: number;
    limit?: number;
    status?: ChargeStatus;
    paymentMethod?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ charges: Charge[]; total: number }>;
  findByMerchantId(merchantId: string, options?: {
    page?: number;
    limit?: number;
    status?: ChargeStatus;
    paymentMethod?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ charges: Charge[]; total: number }>;
  update(charge: Charge): Promise<Charge>;
  delete(id: string): Promise<void>;
  findByIdempotencyKey(idempotencyKey: string): Promise<Charge | null>;
  findPendingCharges(): Promise<Charge[]>;
  getStatistics(merchantId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalCharges: number;
    totalAmount: number;
    paidCharges: number;
    paidAmount: number;
    pendingCharges: number;
    pendingAmount: number;
    failedCharges: number;
    failedAmount: number;
  }>;
}