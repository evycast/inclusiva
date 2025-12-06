/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[postId,name]` on the table `SocialLink` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropTable
DROP TABLE "Comment";

-- DropEnum
DROP TYPE "CommentStatus";

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_postId_name_key" ON "SocialLink"("postId", "name");
