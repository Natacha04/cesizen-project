/*
  Warnings:

  - You are about to drop the column `description` on the `Ressource` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Ressource` table. All the data in the column will be lost.
  - You are about to drop the column `shared` on the `Ressource` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Ressource` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Ressource` table. All the data in the column will be lost.
  - Added the required column `content` to the `Ressource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readingTime` to the `Ressource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Ressource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ressource" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "shared",
DROP COLUMN "state",
DROP COLUMN "type",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "readingTime" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropEnum
DROP TYPE "RessourceState";

-- DropEnum
DROP TYPE "RessourceType";
