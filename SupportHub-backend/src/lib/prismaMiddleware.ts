import { Prisma } from "@prisma/client";

export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      clients: {
        async findUnique({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findMany({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
      },
    },
  });
});