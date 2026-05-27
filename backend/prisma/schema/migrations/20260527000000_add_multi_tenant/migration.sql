-- Migration: Multi-Tenant SaaS
-- Estratégia em 3 passos para não quebrar dados existentes

-- ─────────────────────────────────────────
-- PASSO A: Criar tabela restaurantes
-- ─────────────────────────────────────────

CREATE TABLE `restaurantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `restaurantes_cnpj_key`(`cnpj`),
    UNIQUE INDEX `restaurantes_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- PASSO B: Adicionar colunas restauranteId como NULLABLE (sem FK ainda)
-- ─────────────────────────────────────────

ALTER TABLE `funcionarios` ADD COLUMN `restauranteId` INTEGER NULL;
ALTER TABLE `pedidos`      ADD COLUMN `restauranteId` INTEGER NULL;
ALTER TABLE `produtos`     ADD COLUMN `restauranteId` INTEGER NULL;
ALTER TABLE `ingredientes` ADD COLUMN `restauranteId` INTEGER NULL;
ALTER TABLE `combos`       ADD COLUMN `restauranteId` INTEGER NULL;

-- ─────────────────────────────────────────
-- PASSO C: Criar restaurante padrão e fazer backfill dos dados existentes
-- ─────────────────────────────────────────

INSERT INTO `restaurantes` (`nome`, `cnpj`, `email`, `active`, `createdAt`, `updatedAt`)
VALUES ('Restaurante Padrão', '00.000.000/0001-00', 'admin@restaurante.com', true, NOW(), NOW());

SET @rid = LAST_INSERT_ID();

UPDATE `funcionarios` SET `restauranteId` = @rid WHERE `restauranteId` IS NULL;
UPDATE `pedidos`      SET `restauranteId` = @rid WHERE `restauranteId` IS NULL;
UPDATE `produtos`     SET `restauranteId` = @rid WHERE `restauranteId` IS NULL;
UPDATE `ingredientes` SET `restauranteId` = @rid WHERE `restauranteId` IS NULL;
UPDATE `combos`       SET `restauranteId` = @rid WHERE `restauranteId` IS NULL;

-- ─────────────────────────────────────────
-- PASSO D: Tornar NOT NULL e adicionar FKs e índices
-- ─────────────────────────────────────────

ALTER TABLE `funcionarios` MODIFY COLUMN `restauranteId` INTEGER NOT NULL;
ALTER TABLE `pedidos`      MODIFY COLUMN `restauranteId` INTEGER NOT NULL;
ALTER TABLE `produtos`     MODIFY COLUMN `restauranteId` INTEGER NOT NULL;
ALTER TABLE `ingredientes` MODIFY COLUMN `restauranteId` INTEGER NOT NULL;
ALTER TABLE `combos`       MODIFY COLUMN `restauranteId` INTEGER NOT NULL;

-- Remover unique constraint global de ingredientes.nome (substituída por composta)
DROP INDEX `ingredientes_nome_key` ON `ingredientes`;

-- Remover unique constraint global de pedidos.numeroPedido (substituída por composta)
DROP INDEX `pedidos_numeroPedido_key` ON `pedidos`;

-- Adicionar unique constraints compostas
ALTER TABLE `ingredientes` ADD UNIQUE INDEX `ingredientes_nome_restauranteId_key`(`nome`, `restauranteId`);
ALTER TABLE `combos`       ADD UNIQUE INDEX `combos_nome_restauranteId_key`(`nome`, `restauranteId`);
ALTER TABLE `pedidos`      ADD UNIQUE INDEX `pedidos_numeroPedido_restauranteId_key`(`numeroPedido`, `restauranteId`);

-- Adicionar FKs
ALTER TABLE `funcionarios` ADD CONSTRAINT `funcionarios_restauranteId_fkey`
    FOREIGN KEY (`restauranteId`) REFERENCES `restaurantes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_restauranteId_fkey`
    FOREIGN KEY (`restauranteId`) REFERENCES `restaurantes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `produtos` ADD CONSTRAINT `produtos_restauranteId_fkey`
    FOREIGN KEY (`restauranteId`) REFERENCES `restaurantes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ingredientes` ADD CONSTRAINT `ingredientes_restauranteId_fkey`
    FOREIGN KEY (`restauranteId`) REFERENCES `restaurantes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `combos` ADD CONSTRAINT `combos_restauranteId_fkey`
    FOREIGN KEY (`restauranteId`) REFERENCES `restaurantes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
