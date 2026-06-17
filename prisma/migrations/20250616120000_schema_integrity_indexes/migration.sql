-- Safe additive migration: indexes, constraints, review dedupe key.
-- Apply on existing SQLite DB after backup: cp db/custom.db db/custom.db.bak
--
-- If this migration fails on duplicate CartItem/WishlistItem/Review rows,
-- dedupe manually before re-running (see docs/PLAN-CORRECCION-AUDITORIA.md §14).

-- Product list filters
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "Product_isNew_sortOrder_idx" ON "Product"("isNew", "sortOrder");

-- Reviews by product
CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");

-- Orders by user + status
CREATE INDEX IF NOT EXISTS "Order_userId_status_idx" ON "Order"("userId", "status");

-- Normalize nullable cart/wishlist keys before unique constraints
UPDATE "CartItem" SET "color" = '' WHERE "color" IS NULL;
UPDATE "CartItem" SET "size" = '' WHERE "size" IS NULL;
UPDATE "WishlistItem" SET "colorName" = '' WHERE "colorName" IS NULL;

-- Review dedupe key (backfill from userName)
ALTER TABLE "Review" ADD COLUMN "reviewerKey" TEXT;
UPDATE "Review" SET "reviewerKey" = lower(trim("userName")) WHERE "reviewerKey" IS NULL OR "reviewerKey" = '';

-- Remove duplicate reviews keeping the oldest row per (productId, reviewerKey)
DELETE FROM "Review"
WHERE "id" NOT IN (
  SELECT MIN("id")
  FROM "Review"
  WHERE "reviewerKey" IS NOT NULL AND "reviewerKey" != ''
  GROUP BY "productId", "reviewerKey"
);

-- ProductSize: one row per product + label
CREATE UNIQUE INDEX IF NOT EXISTS "ProductSize_productId_label_key" ON "ProductSize"("productId", "label");

-- Cart / wishlist uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_userId_productId_color_size_key" ON "CartItem"("userId", "productId", "color", "size");
CREATE UNIQUE INDEX IF NOT EXISTS "Review_productId_reviewerKey_key" ON "Review"("productId", "reviewerKey");

-- Note: User.role and Order.status enum enforcement is handled by Prisma Client
-- after `prisma generate`. Existing TEXT values must match enum members.
