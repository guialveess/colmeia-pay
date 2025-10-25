import { Elysia } from "elysia";
import { DIContainer } from "../../../infrastructure/di/container";
import {
  NotFoundError,
  DuplicateError,
} from "../../../domain/errors/domain.errors";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerParamsSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type CustomerParams,
} from "./customer.schemas";
import { authMiddleware, type AuthContext } from "../../../infrastructure/middleware/auth.middleware";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Erro desconhecido";
}

const container = DIContainer.getInstance();

const createCustomerUseCase = container.getCreateCustomerUseCase();
const getCustomerUseCase = container.getGetCustomerUseCase();
const listCustomersUseCase = container.getListCustomersUseCase();
const updateCustomerUseCase = container.getUpdateCustomerUseCase();
const deleteCustomerUseCase = container.getDeleteCustomerUseCase();

export const customerController = new Elysia({ prefix: "/customers" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ body, set, user }: { body: any; set: any; user: AuthContext }) => {
      try {
        console.log("POST /customers - Request body:", body);

        const validatedBody = createCustomerSchema.parse(body);
        console.log("POST /customers - Validated body:", validatedBody);

        const result = await createCustomerUseCase.execute(validatedBody);
        console.log("POST /customers - Success:", result);

        set.status = 201;
        return result;
      } catch (error) {
        console.error("POST /customers - Error:", error);
        console.error(
          "POST /customers - Error type:",
          error?.constructor?.name,
        );
        console.error(
          "POST /customers - Error message:",
          getErrorMessage(error),
        );
        console.error("POST /customers - Error stack:", (error as any)?.stack);

        if (error instanceof DuplicateError) {
          console.log("POST /customers - DuplicateError detected");
          set.status = 400;
          return { error: error.message };
        }

        if (
          error instanceof Error &&
          (error.message.includes("Validation") || error.name === "ZodError")
        ) {
          console.log("POST /customers - Validation error detected");
          set.status = 400;
          return { error: error.message };
        }

        if (error instanceof Error && error.message.includes("23505")) {
          console.log("POST /customers - Database constraint error detected");
          set.status = 400;
          return {
            error: "Cliente com este email ou documento ja existe",
          };
        }

        console.log("POST /customers - Generic internal error");
        set.status = 500;
        return {
          error: "Erro interno do servidor",
          details: getErrorMessage(error),
        };
      }
    },
    {
      body: createCustomerSchema,
    },
    {
      detail: {
        tags: ['Clientes'],
        summary: 'Criar novo cliente',
        description: 'Cadastra um novo cliente no sistema com informacoes basicas (nome, e-mail, documento, telefone). Cada cliente possui um identificador unico e nao podem existir e-mails ou documentos duplicados.'
      }
    }
  )
  .get(
    "/:id",
    async ({ params, set, user }: { params: any; set: any; user: AuthContext }) => {
      try {
        const validatedParams = customerParamsSchema.parse(params);
        const result = await getCustomerUseCase.execute(validatedParams.id);
        return result;
      } catch (error) {
        if (error instanceof NotFoundError) {
          set.status = 404;
          return { error: error.message };
        }
        if (
          error instanceof Error &&
          (error.message.includes("Validation") || error.name === "ZodError")
        ) {
          set.status = 400;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Erro interno do servidor" };
      }
    },
    {
      params: customerParamsSchema,
    },
    {
      detail: {
        tags: ['Clientes'],
        summary: 'Buscar cliente por ID',
        description: 'Retorna as informacoes detalhadas de um cliente especifico pelo seu identificador unico.'
      }
    }
  )
  .get("/", async ({ set, user }: { set: any; user: AuthContext }) => {
    try {
      const result = await listCustomersUseCase.execute();
      return result;
    } catch (error) {
      set.status = 500;
      return { error: "Erro interno do servidor" };
    }
  })
  .patch(
    "/:id",
    async ({ params, body, set, user }: { params: any; body: any; set: any; user: AuthContext }) => {
      try {
        const validatedParams = customerParamsSchema.parse(params);
        const validatedBody = updateCustomerSchema.parse(body);
        const result = await updateCustomerUseCase.execute(
          validatedParams.id,
          validatedBody,
        );
        return result;
      } catch (error) {
        if (error instanceof NotFoundError) {
          set.status = 404;
          return { error: error.message };
        }
        if (error instanceof DuplicateError) {
          set.status = 400;
          return { error: error.message };
        }
        if (
          error instanceof Error &&
          (error.message.includes("Validation") || error.name === "ZodError")
        ) {
          set.status = 400;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Erro interno do servidor" };
      }
    },
    {
      params: customerParamsSchema,
      body: updateCustomerSchema,
    },
  )
  .delete(
    "/:id",
    async ({ params, set, user }: { params: any; set: any; user: AuthContext }) => {
      try {
        const validatedParams = customerParamsSchema.parse(params);
        const result = await deleteCustomerUseCase.execute(validatedParams.id);
        return result;
      } catch (error) {
        if (error instanceof NotFoundError) {
          set.status = 404;
          return { error: error.message };
        }
        if (
          error instanceof Error &&
          (error.message.includes("Validation") || error.name === "ZodError")
        ) {
          set.status = 400;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Erro interno do servidor" };
      }
    },
    {
      params: customerParamsSchema,
    },
  );
