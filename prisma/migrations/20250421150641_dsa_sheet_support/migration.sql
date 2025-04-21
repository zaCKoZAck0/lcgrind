-- AlterTable
ALTER TABLE "Sheet" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ownerName" TEXT NOT NULL DEFAULT 'N/A';

-- AlterTable
ALTER TABLE "SheetProblem" ADD COLUMN     "group" TEXT NOT NULL DEFAULT 'N/A';
