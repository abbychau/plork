-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "summary" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "privateKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "profileImage" TEXT,
    "providerId" TEXT,
    "provider" TEXT,
    "actorUrl" TEXT NOT NULL,
    "inboxUrl" TEXT NOT NULL,
    "outboxUrl" TEXT NOT NULL,
    "followersUrl" TEXT NOT NULL,
    "followingUrl" TEXT NOT NULL
);
INSERT INTO "new_User" ("actorUrl", "createdAt", "displayName", "email", "followersUrl", "followingUrl", "id", "inboxUrl", "outboxUrl", "passwordHash", "privateKey", "profileImage", "publicKey", "summary", "updatedAt", "username") SELECT "actorUrl", "createdAt", "displayName", "email", "followersUrl", "followingUrl", "id", "inboxUrl", "outboxUrl", "passwordHash", "privateKey", "profileImage", "publicKey", "summary", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_actorUrl_key" ON "User"("actorUrl");
CREATE UNIQUE INDEX "User_inboxUrl_key" ON "User"("inboxUrl");
CREATE UNIQUE INDEX "User_outboxUrl_key" ON "User"("outboxUrl");
CREATE UNIQUE INDEX "User_followersUrl_key" ON "User"("followersUrl");
CREATE UNIQUE INDEX "User_followingUrl_key" ON "User"("followingUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
