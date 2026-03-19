-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 500,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT,
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "subclass" TEXT NOT NULL DEFAULT 'NONE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" BIGINT NOT NULL DEFAULT 0,
    "hp" INTEGER NOT NULL DEFAULT 100,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "mp" INTEGER NOT NULL DEFAULT 50,
    "maxMp" INTEGER NOT NULL DEFAULT 50,
    "atk" INTEGER NOT NULL DEFAULT 10,
    "def" INTEGER NOT NULL DEFAULT 5,
    "spd" INTEGER NOT NULL DEFAULT 10,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "partyId" TEXT,
    CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Character_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "ownerId" TEXT,
    "atkBonus" INTEGER NOT NULL DEFAULT 0,
    "defBonus" INTEGER NOT NULL DEFAULT 0,
    "hpBonus" INTEGER NOT NULL DEFAULT 0,
    "durability" INTEGER NOT NULL DEFAULT 100,
    "maxDurability" INTEGER NOT NULL DEFAULT 100,
    "isInherited" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Item_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activeFloor" INTEGER NOT NULL DEFAULT 1,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Affinity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "charA" TEXT NOT NULL,
    "charB" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    "buildings" TEXT,
    "gateFloor" INTEGER NOT NULL DEFAULT 100,
    "raidState" TEXT NOT NULL DEFAULT 'IDLE'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
