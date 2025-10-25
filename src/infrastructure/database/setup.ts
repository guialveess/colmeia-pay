import { dbConnection, rawDb } from './connection';

export async function setupDatabase() {
  console.log('Setup - Checking database setup...');

  try {
    const usersTableCheck = await rawDb.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    const usersTableExists = usersTableCheck.rows[0].exists;
    console.log('Setup - Users table exists:', usersTableExists);

    if (!usersTableExists) {
      console.log('Setup - Creating users table...');
      await rawDb.query(`
        CREATE TABLE "users" (
          "id" varchar(25) PRIMARY KEY NOT NULL,
          "email" varchar(255) NOT NULL UNIQUE,
          "password" varchar(255) NOT NULL,
          "is_active" boolean DEFAULT true NOT NULL,
          "last_login_at" timestamp,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      console.log('Setup - Users table created successfully');
    }

    const customersTableCheck = await rawDb.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'customers'
      );
    `);

    const customersTableExists = customersTableCheck.rows[0].exists;
    console.log('Setup - Customers table exists:', customersTableExists);

    if (!customersTableExists) {
      console.log('Setup - Creating customers table...');
      await rawDb.query(`
        CREATE TABLE "customers" (
          "id" varchar(25) PRIMARY KEY NOT NULL,
          "name" varchar(255) NOT NULL,
          "email" varchar(255) NOT NULL UNIQUE,
          "document" varchar(32) NOT NULL UNIQUE,
          "phone" varchar(32),
          "password" varchar(255) NOT NULL,
          "metadata" json,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      console.log('Setup - Customers table created successfully');
    } else {
      const columnCheck = await rawDb.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'customers'
          AND column_name = 'metadata'
        );
      `);

      const columnExists = columnCheck.rows[0].exists;
      console.log('Setup - Metadata column exists:', columnExists);

      if (!columnExists) {
        console.log('Setup - Adding metadata column...');
        await rawDb.query(`
          ALTER TABLE "customers" ADD COLUMN "metadata" json;
        `);
        console.log('Setup - Metadata column added successfully');
      }
    }

    console.log('Setup - Database setup completed');
  } catch (error) {
    console.error('Setup - Error setting up database:', error);
    throw error;
  }
}