import { eq } from "drizzle-orm";
import { dbConnection } from "../connection";
import { customers } from "../schema";
import {
  Customer,
  CreateCustomerProps,
  UpdateCustomerProps,
  Metadata,
} from "../../../domain/entities/customer.entity";
import { ICustomerRepository } from "../../../domain/repositories/customer.repository.interface";

export class CustomerRepository implements ICustomerRepository {
  async create(data: CreateCustomerProps): Promise<Customer> {
    try {
      const [createdCustomer] = await dbConnection
        .insert(customers)
        .values({
          id: data.id,
          name: data.name,
          email: data.email,
          document: data.document,
          phone: data.phone,
          password: data.password || "default_password",
          metadata: data.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const customer = Customer.create({
        id: createdCustomer.id,
        name: createdCustomer.name,
        email: createdCustomer.email,
        document: createdCustomer.document,
        phone: createdCustomer.phone,
        metadata: createdCustomer.metadata as Metadata,
      });

      return customer;
    } catch (error) {
      console.error("CustomerRepository - Error:", (error as any)?.message);
      throw error;
    }
  }

  async findById(id: string): Promise<Customer | null> {
    const [customer] = await dbConnection
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!customer) {
      return null;
    }

    return new Customer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      document: customer.document,
      phone: customer.phone,
      metadata: customer.metadata as Metadata,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  async findAll(): Promise<Customer[]> {
    const allCustomers = await dbConnection.select().from(customers);

    return allCustomers.map(
      (customer) =>
        new Customer({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          document: customer.document,
          phone: customer.phone,
          metadata: customer.metadata as Metadata,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        }),
    );
  }

  async update(
    id: string,
    data: Partial<UpdateCustomerProps>,
  ): Promise<Customer | null> {
    const [updatedCustomer] = await dbConnection
      .update(customers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();

    if (!updatedCustomer) {
      return null;
    }

    return new Customer({
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      document: updatedCustomer.document,
      phone: updatedCustomer.phone,
      metadata: updatedCustomer.metadata as Metadata,
      createdAt: updatedCustomer.createdAt,
      updatedAt: updatedCustomer.updatedAt,
    });
  }

  async delete(id: string): Promise<Customer | null> {
    const [deletedCustomer] = await dbConnection
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();

    if (!deletedCustomer) {
      return null;
    }

    return new Customer({
      id: deletedCustomer.id,
      name: deletedCustomer.name,
      email: deletedCustomer.email,
      document: deletedCustomer.document,
      phone: deletedCustomer.phone,
      metadata: deletedCustomer.metadata as Metadata,
      createdAt: deletedCustomer.createdAt,
      updatedAt: deletedCustomer.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    console.log("CustomerRepository - Finding customer by email:", email);

    try {
      const [customer] = await dbConnection
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      console.log("CustomerRepository - Email query result:", customer);

      if (!customer) {
        console.log("CustomerRepository - Customer not found by email:", email);
        return null;
      }

      const customerEntity = new Customer({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        document: customer.document,
        phone: customer.phone,
        metadata: customer.metadata as Metadata,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      });

      console.log(
        "CustomerRepository - Customer found by email:",
        customerEntity,
      );
      return customerEntity;
    } catch (error) {
      console.error(
        "CustomerRepository - Error finding customer by email:",
        error,
      );
      throw error;
    }
  }

  async findByDocument(document: string): Promise<Customer | null> {
    console.log("CustomerRepository - Finding customer by document:", document);

    try {
      const [customer] = await dbConnection
        .select()
        .from(customers)
        .where(eq(customers.document, document))
        .limit(1);

      console.log("CustomerRepository - Document query result:", customer);

      if (!customer) {
        console.log(
          "CustomerRepository - Customer not found by document:",
          document,
        );
        return null;
      }

      const customerEntity = new Customer({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        document: customer.document,
        phone: customer.phone,
        metadata: customer.metadata as Metadata,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      });

      console.log(
        "CustomerRepository - Customer found by document:",
        customerEntity,
      );
      return customerEntity;
    } catch (error) {
      console.error(
        "CustomerRepository - Error finding customer by document:",
        error,
      );
      throw error;
    }
  }
}
