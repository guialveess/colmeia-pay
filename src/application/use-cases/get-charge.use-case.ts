import { Charge } from "../../domain/entities/charge.entity";
import { IChargeRepository } from "../../domain/repositories/charge.repository";
import { ChargeNotFoundError } from "../../domain/entities/charge.entity";

export class GetChargeUseCase {
  constructor(private chargeRepository: IChargeRepository) {}

  async execute(id: string): Promise<Charge> {
    const charge = await this.chargeRepository.findById(id);

    if (!charge) {
      throw new ChargeNotFoundError(id);
    }

    return charge;
  }
}