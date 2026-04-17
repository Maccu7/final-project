-- AlterTable
ALTER TABLE "Tickets" ADD COLUMN     "agingScore" DOUBLE PRECISION,
ADD COLUMN     "aiPriorityScore" DOUBLE PRECISION,
ADD COLUMN     "complexityScore" DOUBLE PRECISION,
ADD COLUMN     "llmReasoning" TEXT,
ADD COLUMN     "sentimentScore" DOUBLE PRECISION;
