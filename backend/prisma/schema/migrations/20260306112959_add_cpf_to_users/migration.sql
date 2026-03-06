-- Adiciona cpf como nullable primeiro
ALTER TABLE `users` ADD COLUMN `cpf` VARCHAR(14) NULL;

-- Preenche os registros existentes com valores temporários únicos
UPDATE `users` SET `cpf` = CONCAT('00000000000', id) WHERE `cpf` IS NULL;

-- Agora torna obrigatório e único
ALTER TABLE `users` MODIFY COLUMN `cpf` VARCHAR(14) NOT NULL;
ALTER TABLE `users` ADD UNIQUE INDEX `users_cpf_key`(`cpf`);
