import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

let pool: Pool;
let db: ReturnType<typeof drizzle>;

if (process.env.DATABASE_URL) {
  console.log('Connection - Using DATABASE_URL:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));

  // Only use SSL in production
  const isProduction = process.env.NODE_ENV === 'production';

  const poolConfig: any = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    connectionTimeoutMillis: 10000,
  };

  if (isProduction) {
    poolConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  pool = new Pool(poolConfig);
} else {
  console.log('Connection - Using individual DB parameters');
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'colmeia_pay',
    max: 20,
  });
}

db = drizzle({ client: pool, schema });

pool.on('connect', () => {
  console.log('Database - Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Database - Unexpected error on idle client', err);
});

export const dbConnection = db;
export const closeDb = async () => {
  await pool.end();
  console.log('Database - Connection closed');
};

export const rawDb = pool;

export default db;