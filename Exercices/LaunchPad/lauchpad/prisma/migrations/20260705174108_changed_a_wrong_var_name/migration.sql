/*
  Warnings:

  - You are about to drop the column `lacementId` on the `Suivi` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,lancementId]` on the table `Suivi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lancementId` to the `Suivi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Suivi" DROP CONSTRAINT "Suivi_lacementId_fkey";

-- DropIndex
DROP INDEX "Suivi_userId_lacementId_key";

-- AlterTable
ALTER TABLE "Suivi" DROP COLUMN "lacementId",
ADD COLUMN     "lancementId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Suivi_userId_lancementId_key" ON "Suivi"("userId", "lancementId");

-- AddForeignKey
ALTER TABLE "Suivi" ADD CONSTRAINT "Suivi_lancementId_fkey" FOREIGN KEY ("lancementId") REFERENCES "Lancement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
