CREATE TABLE "audit_logs" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"entity" varchar(128) NOT NULL,
	"entity_id" varchar(255),
	"action" varchar(128) NOT NULL,
	"actor" varchar(255),
	"before" json,
	"after" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boleto_payment_details" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"charge_id" varchar(25) NOT NULL,
	"barcode" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"due_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "boleto_payment_details_charge_id_unique" UNIQUE("charge_id")
);
--> statement-breakpoint
CREATE TABLE "charges" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"merchant_id" varchar(25) NOT NULL,
	"customer_id" varchar(25),
	"amount" numeric(14, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"payment_method" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"description" text,
	"external_id" varchar(255),
	"metadata" json,
	"expires_at" timestamp,
	"paid_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_card_payment_details" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"charge_id" varchar(25) NOT NULL,
	"last_four_digits" varchar(4) NOT NULL,
	"brand" varchar(50) NOT NULL,
	"holder_name" varchar(255) NOT NULL,
	"installments" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_card_payment_details_charge_id_unique" UNIQUE("charge_id")
);
--> statement-breakpoint
CREATE TABLE "customer_merchants" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"customer_id" varchar(25) NOT NULL,
	"merchant_id" varchar(25) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"document" varchar(32) NOT NULL,
	"phone" varchar(32),
	"password" varchar(255) NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email"),
	CONSTRAINT "customers_document_unique" UNIQUE("document")
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"charge_id" varchar(25) NOT NULL,
	"request_hash" varchar(255),
	"response_status" integer,
	"response_body" json,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idempotency_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"website" varchar(255),
	"settings" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"customer_id" varchar(25) NOT NULL,
	"type" varchar(50) NOT NULL,
	"provider" varchar(50),
	"token" varchar(255) NOT NULL,
	"last4" varchar(4),
	"brand" varchar(50),
	"metadata" json,
	"is_default" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pix_payment_details" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"charge_id" varchar(25) NOT NULL,
	"qr_code" text NOT NULL,
	"qr_code_base64" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pix_payment_details_charge_id_unique" UNIQUE("charge_id")
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"charge_id" varchar(25) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"reason" varchar(255),
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"external_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallet_entries" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"wallet_id" varchar(25) NOT NULL,
	"charge_id" varchar(25),
	"type" varchar(32) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"balance_after" numeric(14, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"merchant_id" varchar(25) NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"balance" numeric(14, 2) DEFAULT '0' NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"webhook_id" varchar(25),
	"event_type" varchar(128) NOT NULL,
	"payload" json NOT NULL,
	"delivered_at" timestamp,
	"attempts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"merchant_id" varchar(25),
	"target_url" varchar(2048) NOT NULL,
	"last_status" integer,
	"last_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boleto_payment_details" ADD CONSTRAINT "boleto_payment_details_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_card_payment_details" ADD CONSTRAINT "credit_card_payment_details_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_merchants" ADD CONSTRAINT "customer_merchants_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_merchants" ADD CONSTRAINT "customer_merchants_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pix_payment_details" ADD CONSTRAINT "pix_payment_details_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_entries" ADD CONSTRAINT "wallet_entries_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_entries" ADD CONSTRAINT "wallet_entries_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;