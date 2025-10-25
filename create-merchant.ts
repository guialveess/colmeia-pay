import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { merchants } from './src/infrastructure/database/schema';

async function createMerchant() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL não está definida');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    const merchant = {
      id: "cldefaultmerchant0001", // Mesmo ID do controller
      name: "Default Merchant",
      slug: "default-merchant",
      website: "https://colmeia-pay.example.com",
      settings: { default: true },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(merchants).values(merchant).onConflictDoNothing();
    console.log('✅ Merchant criado com sucesso:', merchant.id);
  } catch (error) {
    console.error('❌ Erro ao criar merchant:', error);
  } finally {
    await client.end();
  }
}

createMerchant();