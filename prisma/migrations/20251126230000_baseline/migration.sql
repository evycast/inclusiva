-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('eventos', 'servicios', 'productos', 'usados', 'cursos', 'pedidos');

-- CreateEnum
CREATE TYPE "public"."CommentStatus" AS ENUM ('visible', 'hidden', 'deleted');

-- CreateEnum
CREATE TYPE "public"."Condition" AS ENUM ('nuevo', 'reacondicionado', 'usado');

-- CreateEnum
CREATE TYPE "public"."Level" AS ENUM ('principiante', 'intermedio', 'avanzado');

-- CreateEnum
CREATE TYPE "public"."Mode" AS ENUM ('presencial', 'online', 'hibrido');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('cash', 'debit', 'credit', 'transfer', 'mercadopago', 'crypto', 'barter', 'all');

-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('user', 'moderator', 'admin');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "status" "public"."CommentStatus" NOT NULL DEFAULT 'visible',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModerationLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL,
    "category" "public"."Category" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "location" TEXT NOT NULL,
    "price" INTEGER,
    "priceLabel" TEXT,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER,
    "tags" TEXT[],
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3),
    "payment" "public"."PaymentMethod"[],
    "barterAccepted" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "venue" TEXT,
    "mode" "public"."Mode",
    "capacity" INTEGER,
    "organizer" TEXT,
    "experienceYears" INTEGER,
    "availability" TEXT,
    "serviceArea" TEXT,
    "condition" "public"."Condition",
    "stock" INTEGER,
    "warranty" TEXT,
    "usageTime" TEXT,
    "duration" TEXT,
    "schedule" TEXT,
    "level" "public"."Level",
    "neededBy" TEXT,
    "budgetRange" TEXT,
    "status" "public"."PostStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialLink" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'user',
    "status" "public"."UserStatus" NOT NULL DEFAULT 'pending',
    "emailVerified" TIMESTAMP(3),
    "verifiedPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "public"."Comment"("parentId" ASC);

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "public"."Comment"("postId" ASC);

-- CreateIndex
CREATE INDEX "ModerationLog_targetType_targetId_idx" ON "public"."ModerationLog"("targetType" ASC, "targetId" ASC);

-- CreateIndex
CREATE INDEX "Post_category_idx" ON "public"."Post"("category" ASC);

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "public"."Post"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "public"."Post"("status" ASC);

-- CreateIndex
CREATE INDEX "SocialLink_postId_idx" ON "public"."SocialLink"("postId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialLink" ADD CONSTRAINT "SocialLink_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
