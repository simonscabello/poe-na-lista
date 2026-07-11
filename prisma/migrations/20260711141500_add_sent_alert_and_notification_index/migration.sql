-- CreateTable
CREATE TABLE `SentAlert` (
    `id` VARCHAR(191) NOT NULL,
    `householdId` VARCHAR(191) NOT NULL,
    `type` ENUM('LIST_CREATED', 'PURCHASE_FINALIZED', 'MEMBER_JOINED', 'ITEM_ADDED', 'BUDGET_ALERT', 'PANTRY_EXPIRING') NOT NULL,
    `periodKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SentAlert_householdId_idx`(`householdId`),
    UNIQUE INDEX `SentAlert_householdId_type_periodKey_key`(`householdId`, `type`, `periodKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Notification_householdId_type_createdAt_idx` ON `Notification`(`householdId`, `type`, `createdAt`);

-- AddForeignKey
ALTER TABLE `SentAlert` ADD CONSTRAINT `SentAlert_householdId_fkey` FOREIGN KEY (`householdId`) REFERENCES `Household`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
