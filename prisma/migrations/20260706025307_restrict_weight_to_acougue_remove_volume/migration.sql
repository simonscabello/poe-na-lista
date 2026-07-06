-- Simplificação de unidade de medida: peso (kg) passa a existir apenas
-- para o Açougue; VOLUME nunca foi exposto na UI e é removido do enum.
--
-- Normaliza dados existentes antes de alterar o enum: qualquer produto que
-- hoje esteja como VOLUME (nunca criado pela UI, mas defensivo) ou como
-- WEIGHT fora da categoria Açougue vira UNIT, para refletir a nova regra
-- e não deixar produtos "presos" em kg fora do Açougue em produção.
UPDATE `Product` p
LEFT JOIN `Category` c ON c.id = p.categoryId
SET p.measureKind = 'UNIT', p.defaultUnit = NULL
WHERE p.measureKind = 'VOLUME'
   OR (p.measureKind = 'WEIGHT' AND (c.slug IS NULL OR c.slug != 'acougue'));

-- AlterTable
ALTER TABLE `Product` MODIFY `measureKind` ENUM('UNIT', 'WEIGHT') NOT NULL DEFAULT 'UNIT';
