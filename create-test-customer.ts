import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { customers } from './src/infrastructure/database/schema';
import bcrypt from 'bcryptjs';

async function createTestCustomer() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL não está definida');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    const hashedPassword = await bcrypt.hash('senha123', 10);

    const customer = {
      id: "d9ntxrdi4i3alurwws7w6j5c",
      name: "Guilherme Alves",
      email: "97guilherme.alves@gmail.com",
      document: "12345678988",
      phone: "81981770644",
      password: hashedPassword,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(customers).values(customer).onConflictDoNothing();
    console.log('Cliente de teste criado com sucesso:', customer.id);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
  } finally {
    await client.end();
  }
}

createTestCustomer();