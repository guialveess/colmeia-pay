export type Metadata = Record<string, any> | null;

export class Customer {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly document: string;
  public readonly phone: string | null;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.document = props.document;
    this.phone = props.phone ?? null;
    this.metadata = props.metadata ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate(): void {
    if (!this.id || this.id.length === 0) {
      throw new Error("ID do cliente e obrigatorio");
    }

    if (!this.name || this.name.length < 2 || this.name.length > 255) {
      throw new Error("Nome do cliente deve ter entre 2 e 255 caracteres");
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error("Email do cliente e invalido");
    }

    if (!this.document || this.document.length < 5 || this.document.length > 32) {
      throw new Error("Documento do cliente deve ter entre 5 e 32 caracteres");
    }

    if (this.phone && (this.phone.length < 8 || this.phone.length > 32)) {
      throw new Error("Telefone do cliente deve ter entre 8 e 32 caracteres");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static create(props: CreateCustomerProps): Customer {
    const now = new Date();

    return new Customer({
      id: props.id,
      name: props.name,
      email: props.email,
      document: props.document,
      phone: props.phone ?? null,
      metadata: props.metadata ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: Partial<UpdateCustomerProps>): Customer {
    return new Customer({
      id: this.id,
      name: props.name ?? this.name,
      email: props.email ?? this.email,
      document: props.document ?? this.document,
      phone: props.phone !== undefined ? props.phone : this.phone,
      metadata: props.metadata !== undefined ? props.metadata : this.metadata,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  toJSON(): CustomerJSON {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      document: this.document,
      phone: this.phone,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

export interface CustomerProps {
  id: string;
  name: string;
  email: string;
  document: string;
  phone?: string | null;
  metadata?: Metadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerProps {
  id: string;
  name: string;
  email: string;
  document: string;
  phone?: string | null;
  password?: string;
  metadata?: Metadata;
}

export interface UpdateCustomerProps {
  name?: string;
  email?: string;
  document?: string;
  phone?: string | null;
  password?: string;
  metadata?: Metadata;
}

export interface CustomerJSON {
  id: string;
  name: string;
  email: string;
  document: string;
  phone: string | null;
  metadata: Metadata;
  createdAt: string;
  updatedAt: string;
}
