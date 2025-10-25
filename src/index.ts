import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { swagger } from "@elysiajs/swagger";
import { customerController } from "./presentation/http/controllers/customer.controller";
import { authController } from "./presentation/http/controllers/auth.controller";
import { chargeController } from "./presentation/http/controllers/charge.controller";
import { DIContainer } from "./infrastructure/di/container";
import { setupDatabase } from "./infrastructure/database/setup";
import "dotenv/config";

async function startServer() {
  try {
    await setupDatabase();

    const container = DIContainer.getInstance();

    const app = new Elysia()
      .use(openapi({
        documentation: {
          info: {
            title: "Colmeia Pay API",
            version: "1.0.0",
            description: "API RESTful para um sistema de pagamentos simplificado desenvolvido com Bun, Elysia, PostgreSQL e Drizzle ORM seguindo os principios da Clean Architecture.",
            contact: {
              name: "Colmeia Pay Team",
              email: "support@colmeia-pay.com"
            }
          },
          servers: [
            {
              url: "http://localhost:3000",
              description: "Servidor de desenvolvimento"
            }
          ],
          tags: [
            {
              name: "Autenticacao",
              description: "Gerenciamento de usuarios e autenticacao JWT"
            },
            {
              name: "Clientes",
              description: "CRUD completo de clientes"
            },
            {
              name: "Cobrancas",
              description: "Gerenciamento de cobrancas com multiplos metodos de pagamento"
            }
          ]
        }
      }))
      .use(swagger({
        path: '/docs',
        documentationTitle: 'Colmeia Pay API Documentation',
        theme: {
          store: 'dark'
        }
      }))
      .use(authController)
      .use(customerController)
      .use(chargeController({
        createChargeUseCase: container.getCreateChargeUseCase(),
        getChargeUseCase: container.getGetChargeUseCase(),
        updateChargeUseCase: container.getUpdateChargeUseCase(),
        listChargesUseCase: container.getListChargesUseCase(),
        payChargeUseCase: container.getPayChargeUseCase(),
        refundChargeUseCase: container.getRefundChargeUseCase(),
      }))
      .listen(3000);

    console.log(`Elysia is running at http://localhost:3000`);
    console.log(`Swagger UI documentation available at http://localhost:3000/docs`);
    console.log(`OpenAPI specification at http://localhost:3000/openapi`);
    console.log(`Raw OpenAPI JSON at http://localhost:3000/openapi/json`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
