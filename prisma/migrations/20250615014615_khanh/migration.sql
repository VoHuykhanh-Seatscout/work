/*
  Warnings:

  - You are about to drop the column `featuredOnHomepage` on the `Talkshow` table. All the data in the column will be lost.
  - You are about to drop the column `socialMediaLinks` on the `Talkshow` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Talkshow_audienceType_idx";

-- DropIndex
DROP INDEX "Talkshow_date_idx";

-- DropIndex
DROP INDEX "Talkshow_locationType_idx";

-- DropIndex
DROP INDEX "Talkshow_organizerId_idx";

-- DropIndex
DROP INDEX "Talkshow_registrationType_idx";

-- DropIndex
DROP INDEX "Talkshow_ticketingType_idx";

-- AlterTable
ALTER TABLE "Talkshow" DROP COLUMN "featuredOnHomepage",
DROP COLUMN "socialMediaLinks",
ADD COLUMN     "paymentQrCode" TEXT,
ALTER COLUMN "duration" SET DEFAULT '60',
ALTER COLUMN "duration" SET DATA TYPE TEXT;
