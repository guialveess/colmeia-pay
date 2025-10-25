import { Charge } from "../../domain/entities/charge.entity";
import { IChargeRepository } from "../../domain/repositories/charge.repository";
import { ChargeNotFoundError } from "../../domain/entities/charge.entity";
import { UpdateChargeRequest } from "../dtos/charge.dto";

export class UpdateChargeUseCase {
  constructor(private chargeRepository: IChargeRepository) {}

  async execute(id: string, request: UpdateChargeRequest): Promise<Charge> {
    const charge = await this.chargeRepository.findById(id);

    if (!charge) {
      throw new ChargeNotFoundError(id);
    }

    if (request.amount !== undefined) {
      charge.updateAmount(request.amount);
    }

    if (request.description !== undefined) {
      charge.description = request.description;
    }

    if (request.metadata !== undefined) {
      charge.metadata = { ...charge.metadata, ...request.metadata };
    }

    return await this.chargeRepository.update(charge);
  }
}