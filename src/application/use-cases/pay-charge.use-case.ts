import { Charge } from "../../domain/entities/charge.entity";
import { IChargeRepository } from "../../domain/repositories/charge.repository";
import { ChargeNotFoundError } from "../../domain/entities/charge.entity";
import { PayChargeRequest } from "../dtos/charge.dto";

export class PayChargeUseCase {
  constructor(private chargeRepository: IChargeRepository) {}

  async execute(id: string, request: PayChargeRequest): Promise<Charge> {
    const charge = await this.chargeRepository.findById(id);

    if (!charge) {
      throw new ChargeNotFoundError(id);
    }

    if (!charge.canBePaid()) {
      throw new Error(`Charge cannot be paid. Current status: ${charge.status}`);
    }

    charge.pay();

    return await this.chargeRepository.update(charge);
  }
}