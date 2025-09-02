/*
  Warnings:

  - A unique constraint covering the columns `[qrData]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Table_qrData_key" ON "public"."Table"("qrData");
