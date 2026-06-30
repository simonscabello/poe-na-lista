-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: novas colunas (slug temporariamente NULL para backfill)
ALTER TABLE `Product`
    ADD COLUMN `slug` VARCHAR(191) NULL,
    ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isGlobal` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `categoryId` VARCHAR(191) NULL,
    ADD COLUMN `barcode` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `brand` VARCHAR(191) NULL;

-- Backfill: slug provisório único (= id) e flag global derivada de householdId.
-- A canonização de nomes/slugs/categorias dos produtos globais ocorre no seed.
UPDATE `Product` SET `slug` = `id` WHERE `slug` IS NULL;
UPDATE `Product` SET `isGlobal` = (`householdId` IS NULL);

-- slug agora obrigatório
ALTER TABLE `Product` MODIFY COLUMN `slug` VARCHAR(191) NOT NULL;

-- DropColumn legado
ALTER TABLE `Product` DROP COLUMN `category`;

-- CreateIndex
CREATE INDEX `Product_name_idx` ON `Product`(`name`);
CREATE INDEX `Product_categoryId_idx` ON `Product`(`categoryId`);
CREATE INDEX `Product_isGlobal_active_idx` ON `Product`(`isGlobal`, `active`);
CREATE UNIQUE INDEX `Product_householdId_slug_key` ON `Product`(`householdId`, `slug`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
