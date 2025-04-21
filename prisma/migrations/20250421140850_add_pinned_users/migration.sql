-- CreateTable
CREATE TABLE "PinnedUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "pinnedUserId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "PinnedUser_userId_idx" ON "PinnedUser"("userId");

-- CreateIndex
CREATE INDEX "PinnedUser_pinnedUserId_idx" ON "PinnedUser"("pinnedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedUser_userId_pinnedUserId_key" ON "PinnedUser"("userId", "pinnedUserId");
