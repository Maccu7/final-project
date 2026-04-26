import { PrismaClient } from "@prisma/client";

export async function generateClientCode(prisma: PrismaClient | any): Promise<string> {
    const lastClient = await prisma.clients.findFirst({
        orderBy: { clientCode: 'desc' },
        select: { clientCode: true },
    });

    if (!lastClient) return 'C-1001';

    const lastNumber = parseInt(lastClient.clientCode.split('-')[1]);
    return `C-${lastNumber + 1}`;
}
