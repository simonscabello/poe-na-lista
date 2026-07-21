-- AlterTable
ALTER TABLE `Purchase` ADD COLUMN `kind` ENUM('GROCERY', 'PROJECT') NOT NULL DEFAULT 'GROCERY';

-- AlterTable
ALTER TABLE `ShoppingList` ADD COLUMN `budgetCap` DECIMAL(10, 2) NULL,
    ADD COLUMN `kind` ENUM('GROCERY', 'PROJECT') NOT NULL DEFAULT 'GROCERY';

-- CreateIndex
CREATE INDEX `Purchase_householdId_kind_purchasedAt_idx` ON `Purchase`(`householdId`, `kind`, `purchasedAt`);

-- CreateIndex
CREATE INDEX `ShoppingList_householdId_kind_idx` ON `ShoppingList`(`householdId`, `kind`);
