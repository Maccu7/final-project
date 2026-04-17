import { PrismaClient, UserRoleEnum} from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { UserRole } from "../src/types";
import { debug } from "console";

dotenv.config();

const prisma = new PrismaClient();
async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@gmail.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "Superadmin123...";
  if (!email || !password) {
    throw new Error(
      "Environment variables SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined"
    );
  }
  const roleNames = [
    UserRole.SUPER_ADMIN,
    UserRole.TICKET_MANAGER,
    UserRole.DEVELOPER,
    UserRole.CLIENT,
  ];

  const roles = await Promise.all(
    roleNames.map((roleName) =>
      prisma.roles.upsert({
        where: { name: roleName as UserRoleEnum },
        update: {},
        create: { name: roleName as UserRoleEnum },
      })
    )
  );

  let superAdmin = await prisma.users.findUnique({
    where: { email: email },
  });
  if (!superAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);

    superAdmin = await prisma.users.create({
      data: {
        firstName: "Super",
        lastName: "Admin",
        email: email,
        password: hashedPassword,
        provider: "credentials",
        providerId: "seeded-superadmin",
      },
    });
  }
  const superAdminRole = roles.find((r) => r.name === "super_admin");
  if (superAdmin && superAdminRole) {
    const userRole = await prisma.userRoles.findFirst({
      where: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    });
    if (!userRole) {
      await prisma.userRoles.create({
        data: {
          userId: superAdmin.id,
          roleId: superAdminRole.id,
        },
      });
    }
  }

  // Seed a demo client user
  const clientEmail = "client@supporthub.com";
  const clientPassword = "Client123...";

  let clientUser = await prisma.users.findUnique({
    where: { email: clientEmail },
  });

  if (!clientUser) {
    const hashedClientPassword = await bcrypt.hash(clientPassword, 10);
    clientUser = await prisma.users.create({
      data: {
        firstName: "Demo",
        lastName: "Client",
        email: clientEmail,
        password: hashedClientPassword,
        provider: "credentials",
        providerId: "seeded-client",
      },
    });
  }

  const clientRole = roles.find((r) => r.name === "client");
  if (clientUser && clientRole) {
    const existingRole = await prisma.userRoles.findFirst({
      where: { userId: clientUser.id, roleId: clientRole.id },
    });
    if (!existingRole) {
      await prisma.userRoles.create({
        data: { userId: clientUser.id, roleId: clientRole.id },
      });
    }
  }

  // Create a client record linked to the demo user
  const existingClient = await prisma.clients.findFirst({
    where: { userId: clientUser.id },
  });

  if (!existingClient) {
    const { generateClientCode } = await import("../src/helpers/generateClientCode");
    const clientCode = await generateClientCode(prisma);
    await prisma.clients.create({
      data: {
        clientCode,
        companyName: "Demo Company",
        companyDomain: "democompany.com",
        supportTier: "standard",
        status: "active",
        createdBy: clientUser.id,
        userId: clientUser.id,
      },
    });
  }
}

main()
  .catch((e) => {
    debug("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
