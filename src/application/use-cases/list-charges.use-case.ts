import { Charge, ChargeStatus, PaymentMethod } from "../../domain/entities/charge.entity";
import { IChargeRepository } from "../../domain/repositories/charge.repository";
import { ListChargesQuery } from "../dtos/charge.dto";

export class ListChargesUseCase {
  constructor(private chargeRepository: IChargeRepository) {}

  async execute(query: ListChargesQuery, userId: string): Promise<{
    charges: Charge[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const { page = 1, limit = 10, customerId, merchantId, status, paymentMethod, startDate, endDate } = query;

    // Build date filters
    const startDateFilter = startDate ? new Date(startDate) : undefined;
    const endDateFilter = endDate ? new Date(endDate) : undefined;

    // Get charges based on filters
    let result;

    if (customerId) {
      // If customerId is specified, get charges for that customer
      result = await this.chargeRepository.findByCustomerId(customerId, {
        page,
        limit,
        status,
        paymentMethod,
        startDate: startDateFilter,
        endDate: endDateFilter,
      });
    } else if (merchantId) {
      // If merchantId is specified, get charges for that merchant
      result = await this.chargeRepository.findByMerchantId(merchantId, {
        page,
        limit,
        status,
        paymentMethod,
        startDate: startDateFilter,
        endDate: endDateFilter,
      });
    } else {
      // If no specific customer or merchant, get all charges (admin access)
      // For now, we'll search by merchantId assuming the user is a merchant
      result = await this.chargeRepository.findByMerchantId(userId, {
        page,
        limit,
        status,
        paymentMethod,
        startDate: startDateFilter,
        endDate: endDateFilter,
      });
    }

    const totalPages = Math.ceil(result.total / limit);

    return {
      charges: result.charges,
      total: result.total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}