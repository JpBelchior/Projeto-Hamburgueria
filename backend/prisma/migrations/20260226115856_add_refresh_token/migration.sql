-- AlterTable
ALTER TABLE `funcionarios` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `ingredientes` ADD COLUMN `essencial` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `refreshToken` TEXT NULL;
