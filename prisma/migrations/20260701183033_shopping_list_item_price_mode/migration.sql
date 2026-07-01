-- AlterTable
ALTER TABLE `ShoppingListItem` ADD COLUMN `priceMode` ENUM('UNIT', 'TOTAL') NOT NULL DEFAULT 'UNIT';
