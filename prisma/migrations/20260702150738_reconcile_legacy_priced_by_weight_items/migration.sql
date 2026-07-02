-- Reconcile pre-existing ShoppingListItem/PantryItem rows for products that were
-- reclassified from WEIGHT (kg) to UNIT + pricedByWeight (ex: cebola, batata, tomate).
-- Only touches rows still carrying a stale `unit` value from before the reclassification.

-- Shopping list items: only pending lists (COMPLETED lists are historical purchase
-- records and must keep the numbers as they were actually bought).
-- Quantity can't be reliably back-derived from a kg value, so it resets to 1 (the
-- new UNIT default) and unit is cleared. priceMode only flips to TOTAL when no price
-- was entered yet, so any price the user already typed in is preserved as-is.
UPDATE `ShoppingListItem` sli
JOIN `Product` p ON sli.`productId` = p.`id`
JOIN `ShoppingList` sl ON sli.`shoppingListId` = sl.`id`
SET
  sli.`unit` = NULL,
  sli.`quantity` = 1,
  sli.`priceMode` = CASE WHEN sli.`price` IS NULL THEN 'TOTAL' ELSE sli.`priceMode` END
WHERE p.`pricedByWeight` = TRUE
  AND sli.`unit` IS NOT NULL
  AND sl.`status` != 'COMPLETED';

-- Pantry items: quantity represents stock on hand, so it's rounded to the nearest
-- whole unit instead of reset (losing "you have some onions" info would be worse
-- than an approximate count). Anything above 0 rounds up to at least 1.
UPDATE `PantryItem` pi
JOIN `Product` p ON pi.`productId` = p.`id`
SET
  pi.`unit` = NULL,
  pi.`quantity` = GREATEST(ROUND(pi.`quantity`), IF(pi.`quantity` > 0, 1, 0))
WHERE p.`pricedByWeight` = TRUE
  AND pi.`unit` IS NOT NULL;
