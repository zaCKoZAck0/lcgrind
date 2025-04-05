-- CreateTable
CREATE TABLE "Problem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetProblem" (
    "problemId" INTEGER NOT NULL,
    "sheetId" INTEGER NOT NULL,
    "sheetOrder" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "prevOrder" DECIMAL(65,30) NOT NULL
);

-- CreateTable
CREATE TABLE "Sheet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isCompany" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Sheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Problem_url_key" ON "Problem"("url");

-- CreateIndex
CREATE INDEX "Problem_url_tags_idx" ON "Problem"("url", "tags");

-- CreateIndex
CREATE UNIQUE INDEX "SheetProblem_problemId_sheetId_key" ON "SheetProblem"("problemId", "sheetId");

-- AddForeignKey
ALTER TABLE "SheetProblem" ADD CONSTRAINT "SheetProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetProblem" ADD CONSTRAINT "SheetProblem_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
