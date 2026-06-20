-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeen" TEXT,
    "sheetId" INTEGER,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_sheetId_key" ON "Company"("sheetId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
