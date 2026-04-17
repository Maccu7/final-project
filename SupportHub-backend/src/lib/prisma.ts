import { PrismaClient } from "@prisma/client";
import { softDeleteExtension } from "./prismaMiddleware";

const prisma = new PrismaClient().$extends(softDeleteExtension);

export default prisma;