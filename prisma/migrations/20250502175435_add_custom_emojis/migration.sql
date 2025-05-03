-- CreateTable
CREATE TABLE "CustomEmoji" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "CustomEmoji_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserEmojiCollection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customEmojiId" TEXT NOT NULL,
    CONSTRAINT "UserEmojiCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserEmojiCollection_customEmojiId_fkey" FOREIGN KEY ("customEmojiId") REFERENCES "CustomEmoji" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CustomEmoji_creatorId_idx" ON "CustomEmoji"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomEmoji_creatorId_name_key" ON "CustomEmoji"("creatorId", "name");

-- CreateIndex
CREATE INDEX "UserEmojiCollection_userId_idx" ON "UserEmojiCollection"("userId");

-- CreateIndex
CREATE INDEX "UserEmojiCollection_customEmojiId_idx" ON "UserEmojiCollection"("customEmojiId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmojiCollection_userId_name_key" ON "UserEmojiCollection"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmojiCollection_userId_customEmojiId_key" ON "UserEmojiCollection"("userId", "customEmojiId");
