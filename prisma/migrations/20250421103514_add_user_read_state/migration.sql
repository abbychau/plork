-- CreateTable
CREATE TABLE "UserReadState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastReadAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "authorUsername" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "UserReadState_userId_idx" ON "UserReadState"("userId");

-- CreateIndex
CREATE INDEX "UserReadState_authorUsername_idx" ON "UserReadState"("authorUsername");

-- CreateIndex
CREATE UNIQUE INDEX "UserReadState_userId_authorUsername_key" ON "UserReadState"("userId", "authorUsername");
