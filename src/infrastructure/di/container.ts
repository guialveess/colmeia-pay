import { CustomerRepository } from "../database/repositories/customer.repository.impl";
import { AuthRepository } from "../database/repositories/auth.repository.impl";
import { DrizzleChargeRepository } from "../database/repositories/charge.repository";
import { CreateCustomerUseCase } from "../../application/use-cases/create-customer.use-case";
import { GetCustomerUseCase } from "../../application/use-cases/get-customer.use-case";
import { ListCustomersUseCase } from "../../application/use-cases/list-customers.use-case";
import { UpdateCustomerUseCase } from "../../application/use-cases/update-customer.use-case";
import { DeleteCustomerUseCase } from "../../application/use-cases/delete-customer.use-case";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { VerifyTokenUseCase } from "../../application/use-cases/verify-token.use-case";
import { CreateChargeUseCase } from "../../application/use-cases/create-charge.use-case";
import { GetChargeUseCase } from "../../application/use-cases/get-charge.use-case";
import { UpdateChargeUseCase } from "../../application/use-cases/update-charge.use-case";
import { ListChargesUseCase } from "../../application/use-cases/list-charges.use-case";
import { PayChargeUseCase } from "../../application/use-cases/pay-charge.use-case";
import { RefundChargeUseCase } from "../../application/use-cases/refund-charge.use-case";

export class DIContainer {
  private static instance: DIContainer;

  private customerRepository: CustomerRepository;
  private authRepository: AuthRepository;
  private chargeRepository: DrizzleChargeRepository;
  private createCustomerUseCase: CreateCustomerUseCase;
  private getCustomerUseCase: GetCustomerUseCase;
  private listCustomersUseCase: ListCustomersUseCase;
  private updateCustomerUseCase: UpdateCustomerUseCase;
  private deleteCustomerUseCase: DeleteCustomerUseCase;
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;
  private verifyTokenUseCase: VerifyTokenUseCase;
  private createChargeUseCase: CreateChargeUseCase;
  private getChargeUseCase: GetChargeUseCase;
  private updateChargeUseCase: UpdateChargeUseCase;
  private listChargesUseCase: ListChargesUseCase;
  private payChargeUseCase: PayChargeUseCase;
  private refundChargeUseCase: RefundChargeUseCase;

  private constructor() {
    this.customerRepository = new CustomerRepository();
    this.authRepository = new AuthRepository();
    this.chargeRepository = new DrizzleChargeRepository();

    this.createCustomerUseCase = new CreateCustomerUseCase(
      this.customerRepository,
    );
    this.getCustomerUseCase = new GetCustomerUseCase(this.customerRepository);
    this.listCustomersUseCase = new ListCustomersUseCase(
      this.customerRepository,
    );
    this.updateCustomerUseCase = new UpdateCustomerUseCase(
      this.customerRepository,
    );
    this.deleteCustomerUseCase = new DeleteCustomerUseCase(
      this.customerRepository,
    );

    this.registerUseCase = new RegisterUseCase(this.authRepository);
    this.loginUseCase = new LoginUseCase(this.authRepository);
    this.verifyTokenUseCase = new VerifyTokenUseCase(this.authRepository);

    // Charge use cases
    this.createChargeUseCase = new CreateChargeUseCase(
      this.chargeRepository,
      this.customerRepository,
      this.customerRepository // Using customerRepository as merchantRepository for now
    );
    this.getChargeUseCase = new GetChargeUseCase(this.chargeRepository);
    this.updateChargeUseCase = new UpdateChargeUseCase(this.chargeRepository);
    this.listChargesUseCase = new ListChargesUseCase(this.chargeRepository);
    this.payChargeUseCase = new PayChargeUseCase(this.chargeRepository);
    this.refundChargeUseCase = new RefundChargeUseCase(this.chargeRepository);
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  getCustomerRepository(): CustomerRepository {
    return this.customerRepository;
  }

  getCreateCustomerUseCase(): CreateCustomerUseCase {
    return this.createCustomerUseCase;
  }

  getGetCustomerUseCase(): GetCustomerUseCase {
    return this.getCustomerUseCase;
  }

  getListCustomersUseCase(): ListCustomersUseCase {
    return this.listCustomersUseCase;
  }

  getUpdateCustomerUseCase(): UpdateCustomerUseCase {
    return this.updateCustomerUseCase;
  }

  getDeleteCustomerUseCase(): DeleteCustomerUseCase {
    return this.deleteCustomerUseCase;
  }

  getAuthRepository(): AuthRepository {
    return this.authRepository;
  }

  getRegisterUseCase(): RegisterUseCase {
    return this.registerUseCase;
  }

  getLoginUseCase(): LoginUseCase {
    return this.loginUseCase;
  }

  getVerifyTokenUseCase(): VerifyTokenUseCase {
    return this.verifyTokenUseCase;
  }

  // Charge repository and use cases
  getChargeRepository(): DrizzleChargeRepository {
    return this.chargeRepository;
  }

  getCreateChargeUseCase(): CreateChargeUseCase {
    return this.createChargeUseCase;
  }

  getGetChargeUseCase(): GetChargeUseCase {
    return this.getChargeUseCase;
  }

  getUpdateChargeUseCase(): UpdateChargeUseCase {
    return this.updateChargeUseCase;
  }

  getListChargesUseCase(): ListChargesUseCase {
    return this.listChargesUseCase;
  }

  getPayChargeUseCase(): PayChargeUseCase {
    return this.payChargeUseCase;
  }

  getRefundChargeUseCase(): RefundChargeUseCase {
    return this.refundChargeUseCase;
  }
}
