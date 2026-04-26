import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import j2s from "joi-to-swagger";
import Joi from "joi";
import { signupValidation, loginValidation, googleValidation } from "../validations/auth.validation";

const slackSettingsValidation = Joi.object({
  slackWebhookUrl: Joi.string().uri().allow("").description("Slack webhook URL"),
  newTickets: Joi.boolean().description("Notify on new tickets"),
  ticketAssignments: Joi.boolean().description("Notify on ticket assignments"),
  statusChanges: Joi.boolean().description("Notify on status changes"),
});

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "SupportHub Backend API",
    version: "1.0.0",
    description: "API documentation for SupportHub Backend",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Ticket: {
        type: "object",
        properties: {
          id: { type: "string" },
          ticketCode: { type: "string", example: "TK-1001" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["new", "assigned", "in_progress", "awaiting_client", "resolved", "closed"] },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          aiPriorityScore: { type: "number", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Client: {
        type: "object",
        properties: {
          id: { type: "string" },
          clientCode: { type: "string", example: "C-1001" },
          companyName: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"] },
          supportTier: { type: "string", enum: ["basic", "standard", "premium"] },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          productCode: { type: "string", example: "P-1001" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Users", description: "User profile management" },
    { name: "Clients", description: "Client management (super_admin)" },
    { name: "Products", description: "Product management" },
    { name: "Tickets", description: "Ticket management" },
    { name: "Dashboard", description: "Dashboard statistics" },
    { name: "Settings", description: "Application settings" },
  ],
  paths: {
    // ─── AUTH ────────────────────────────────────────────────────────────────
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: j2s(signupValidation).swagger },
          },
        },
        responses: {
          "201": { description: "User registered successfully" },
          "409": { description: "User already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: j2s(loginValidation).swagger },
          },
        },
        responses: {
          "200": { description: "Login successful, returns JWT token" },
          "400": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/google-signin": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with Google (super_admin only)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: j2s(googleValidation).swagger },
          },
        },
        responses: {
          "200": { description: "Google sign-in successful" },
          "400": { description: "Invalid Google token" },
        },
      },
    },

    // ─── USERS ───────────────────────────────────────────────────────────────
    "/api/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Get current user's profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profile retrieved successfully" },
          "401": { description: "Unauthorized" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update current user's profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Profile updated successfully" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/users/profile/company": {
      put: {
        tags: ["Users"],
        summary: "Update current user's company profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  companyName: { type: "string" },
                  industry: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Company profile updated successfully" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users (super_admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of all users" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/users/{id}/soft-delete": {
      delete: {
        tags: ["Users"],
        summary: "Soft-delete a user by ID (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
        ],
        responses: {
          "200": { description: "User soft-deleted successfully" },
          "403": { description: "Forbidden — requires super_admin" },
          "404": { description: "User not found" },
        },
      },
    },

    // ─── CLIENTS ─────────────────────────────────────────────────────────────
    "/api/clients": {
      get: {
        tags: ["Clients"],
        summary: "Get all clients",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of clients", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Client" } } } } },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Clients"],
        summary: "Create a new client (super_admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["companyName", "email", "firstName", "lastName"],
                properties: {
                  companyName: { type: "string" },
                  email: { type: "string", format: "email" },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  phone: { type: "string" },
                  supportTier: { type: "string", enum: ["basic", "standard", "premium"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Client created successfully" },
          "400": { description: "Validation error or duplicate email" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/clients/users/me": {
      get: {
        tags: ["Clients"],
        summary: "Get client record for the currently logged-in user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Client record", content: { "application/json": { schema: { "$ref": "#/components/schemas/Client" } } } },
          "404": { description: "No client found for this user" },
        },
      },
    },
    "/api/clients/{id}": {
      get: {
        tags: ["Clients"],
        summary: "Get a client by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Client ID" },
        ],
        responses: {
          "200": { description: "Client found", content: { "application/json": { schema: { "$ref": "#/components/schemas/Client" } } } },
          "404": { description: "Client not found" },
        },
      },
      patch: {
        tags: ["Clients"],
        summary: "Update a client (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  companyName: { type: "string" },
                  supportTier: { type: "string", enum: ["basic", "standard", "premium"] },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Client updated successfully" },
          "403": { description: "Forbidden — requires super_admin" },
          "404": { description: "Client not found" },
        },
      },
      delete: {
        tags: ["Clients"],
        summary: "Hard-delete a client (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Client deleted" },
          "403": { description: "Forbidden — requires super_admin" },
          "404": { description: "Client not found" },
        },
      },
    },
    "/api/clients/{id}/status": {
      patch: {
        tags: ["Clients"],
        summary: "Update client status (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["active", "inactive"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Status updated" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/clients/{id}/soft-delete": {
      patch: {
        tags: ["Clients"],
        summary: "Soft-delete a client (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Client soft-deleted" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/clients/{id}/restore": {
      post: {
        tags: ["Clients"],
        summary: "Restore a soft-deleted client (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Client restored" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/clients/{id}/products": {
      get: {
        tags: ["Clients"],
        summary: "Get products assigned to a client",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "List of products for this client" },
          "404": { description: "Client not found" },
        },
      },
    },
    "/api/clients/{id}/products/{productId}": {
      post: {
        tags: ["Clients"],
        summary: "Assign a product to a client (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Client ID" },
          { name: "productId", in: "path", required: true, schema: { type: "string" }, description: "Product ID" },
        ],
        responses: {
          "201": { description: "Product assigned to client" },
          "403": { description: "Forbidden — requires super_admin" },
          "404": { description: "Client or product not found" },
        },
      },
      delete: {
        tags: ["Clients"],
        summary: "Remove a product from a client (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Client ID" },
          { name: "productId", in: "path", required: true, schema: { type: "string" }, description: "Product ID" },
        ],
        responses: {
          "200": { description: "Product removed from client" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },

    // ─── PRODUCTS ────────────────────────────────────────────────────────────
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Get all products",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of all products", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Product" } } } } },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a new product (super_admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "status"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["active", "inactive"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Product created successfully" },
          "400": { description: "Validation error" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/products/client-products": {
      get: {
        tags: ["Products"],
        summary: "Get products assigned to the currently logged-in client",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of products for this client" },
          "404": { description: "No client found for this user" },
        },
      },
    },
    "/api/products/client/{clientCode}": {
      get: {
        tags: ["Products"],
        summary: "Get products assigned to a client by client code",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "clientCode", in: "path", required: true, schema: { type: "string" }, description: "e.g. C-1001" },
        ],
        responses: {
          "200": { description: "List of products" },
          "400": { description: "Client code required" },
        },
      },
    },
    "/api/products/id/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by its database ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Product found", content: { "application/json": { schema: { "$ref": "#/components/schemas/Product" } } } },
          "404": { description: "Product not found" },
        },
      },
    },
    "/api/products/{productCode}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by its product code",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "productCode", in: "path", required: true, schema: { type: "string" }, description: "e.g. P-1001" },
        ],
        responses: {
          "200": { description: "Product found", content: { "application/json": { schema: { "$ref": "#/components/schemas/Product" } } } },
          "404": { description: "Product not found" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update a product by ID (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "productCode", in: "path", required: true, schema: { type: "string" }, description: "Product database ID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["active", "inactive"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Product updated" },
          "403": { description: "Forbidden — requires super_admin" },
          "404": { description: "Product not found" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete a product by ID (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "productCode", in: "path", required: true, schema: { type: "string" }, description: "Product database ID" },
        ],
        responses: {
          "204": { description: "Product deleted" },
          "403": { description: "Forbidden — requires super_admin" },
          "404": { description: "Product not found" },
        },
      },
    },
    "/api/products/{productId}/clients/{clientId}": {
      post: {
        tags: ["Products"],
        summary: "Assign a client to a product (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "productId", in: "path", required: true, schema: { type: "string" } },
          { name: "clientId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "201": { description: "Client assigned to product" },
          "403": { description: "Forbidden — requires super_admin" },
          "404": { description: "Product or client not found" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Remove a client from a product (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "productId", in: "path", required: true, schema: { type: "string" } },
          { name: "clientId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Client removed from product" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },

    // ─── TICKETS ─────────────────────────────────────────────────────────────
    "/api/tickets": {
      post: {
        tags: ["Tickets"],
        summary: "Create a new ticket",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "description", "productId"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  productId: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  files: { type: "array", items: { type: "string", format: "binary" }, description: "Up to 10 file attachments" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Ticket created successfully", content: { "application/json": { schema: { "$ref": "#/components/schemas/Ticket" } } } },
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
        },
      },
      get: {
        tags: ["Tickets"],
        summary: "Get tickets for the current user (clients see only their own)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of tickets", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Ticket" } } } } },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/tickets/all": {
      get: {
        tags: ["Tickets"],
        summary: "Get all tickets (super_admin only — enforced in service)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "All tickets" },
          "403": { description: "Forbidden — requires admin role" },
        },
      },
    },
    "/api/tickets/count": {
      get: {
        tags: ["Tickets"],
        summary: "Get ticket counts grouped by status",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Ticket counts per status" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/tickets/rescore/all": {
      post: {
        tags: ["Tickets"],
        summary: "Re-run AI scoring on all open tickets (super_admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "All open tickets rescored" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/tickets/code/{ticketCode}": {
      get: {
        tags: ["Tickets"],
        summary: "Get a ticket by its ticket code",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "ticketCode", in: "path", required: true, schema: { type: "string" }, description: "e.g. TK-1001" },
        ],
        responses: {
          "200": { description: "Ticket found", content: { "application/json": { schema: { "$ref": "#/components/schemas/Ticket" } } } },
          "404": { description: "Ticket not found" },
        },
      },
    },
    "/api/tickets/{id}": {
      get: {
        tags: ["Tickets"],
        summary: "Get a ticket by its database ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Ticket found", content: { "application/json": { schema: { "$ref": "#/components/schemas/Ticket" } } } },
          "403": { description: "Forbidden — clients can only view their own tickets" },
          "404": { description: "Ticket not found" },
        },
      },
      put: {
        tags: ["Tickets"],
        summary: "Update a ticket",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["new", "assigned", "in_progress", "awaiting_client", "resolved", "closed"] },
                  priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  files: { type: "array", items: { type: "string", format: "binary" } },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Ticket updated" },
          "400": { description: "Validation error or unauthorized change" },
          "404": { description: "Ticket not found" },
        },
      },
      delete: {
        tags: ["Tickets"],
        summary: "Delete a ticket",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "204": { description: "Ticket deleted" },
          "403": { description: "Forbidden — not authorized to delete this ticket" },
          "404": { description: "Ticket not found" },
        },
      },
    },
    "/api/tickets/{id}/rescore": {
      post: {
        tags: ["Tickets"],
        summary: "Re-run AI scoring on a single ticket (super_admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Ticket rescored successfully" },
          "403": { description: "Forbidden — requires super_admin" },
          "404": { description: "Ticket not found" },
        },
      },
    },

    // ─── DASHBOARD ───────────────────────────────────────────────────────────
    "/api/dashboard/all": {
      get: {
        tags: ["Dashboard"],
        summary: "Get full dashboard data — overview, tickets, clients, products (super_admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Full dashboard data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    overview: { type: "object" },
                    tickets: { type: "object" },
                    clients: { type: "object" },
                    products: { type: "object" },
                  },
                },
              },
            },
          },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/dashboard/client": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard data for the currently logged-in client",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Client dashboard stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalTickets: { type: "integer" },
                    openTickets: { type: "integer" },
                    resolvedTickets: { type: "integer" },
                    tickets: { type: "array", items: { "$ref": "#/components/schemas/Ticket" } },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/dashboard/overview": {
      get: {
        tags: ["Dashboard"],
        summary: "Get overview stats — total tickets, clients, open tickets (super_admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Overview stats and status distribution" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/dashboard/tickets-by-status": {
      get: {
        tags: ["Dashboard"],
        summary: "Get tickets grouped by status (super_admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Tickets grouped by status" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/dashboard/clients": {
      get: {
        tags: ["Dashboard"],
        summary: "Get client statistics (super_admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Client stats" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },
    "/api/dashboard/products": {
      get: {
        tags: ["Dashboard"],
        summary: "Get product statistics (super_admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Product stats" },
          "403": { description: "Forbidden — requires super_admin" },
        },
      },
    },

    // ─── SETTINGS ────────────────────────────────────────────────────────────
    "/api/settings/slack-integrations": {
      get: {
        tags: ["Settings"],
        summary: "Get Slack integration settings",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Slack settings retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: {
                      type: "object",
                      nullable: true,
                      properties: {
                        slackWebhookUrl: { type: "string", nullable: true },
                        newTickets: { type: "boolean" },
                        ticketAssignments: { type: "boolean" },
                        statusChanges: { type: "boolean" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Bad request" },
        },
      },
    },
    "/api/settings/slack-integration": {
      post: {
        tags: ["Settings"],
        summary: "Create or update Slack integration settings",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: j2s(slackSettingsValidation).swagger },
          },
        },
        responses: {
          "200": { description: "Slack settings saved" },
          "400": { description: "Bad request" },
        },
      },
      put: {
        tags: ["Settings"],
        summary: "Update Slack integration settings",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: j2s(slackSettingsValidation).swagger },
          },
        },
        responses: {
          "200": { description: "Slack settings updated" },
          "400": { description: "Bad request" },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
