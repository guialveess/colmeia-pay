import { Charge } from "../../domain/entities/charge.entity";
import { IChargeRepository } from "../../domain/repositories/charge.repository";
import { ChargeNotFoundError } from "../../domain/entities/charge.entity";
import { RefundChargeRequest } from "../dtos/charge.dto";

export class RefundChargeUseCase {
  constructor(private chargeRepository: IChargeRepository) {}

  async execute(id: string, request: RefundChargeRequest): Promise<Charge> {
    const charge = await this.chargeRepository.findById(id);

    if (!charge) {
      throw new ChargeNotFoundError(id);
    }

    if (!charge.canBeRefunded()) {
      throw new Error(`Charge cannot be refunded. Current status: ${charge.status}`);
    }

    charge.refund(request.reason);

    return await this.chargeRepository.update(charge);
  }
}