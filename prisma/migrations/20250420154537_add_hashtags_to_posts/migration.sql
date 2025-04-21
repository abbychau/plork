-- AlterTable
ALTER TABLE "Post" ADD COLUMN "hashtags" TEXT;

-- CreateIndex
CREATE INDEX "Post_hashtags_idx" ON "Post"("hashtags");
