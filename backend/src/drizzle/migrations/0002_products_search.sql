-- -- Custom SQL migration file, put your code below! --
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- --> statement-breakpoint
-- ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;
-- --> statement-breakpoint
-- CREATE OR REPLACE FUNCTION products_search_vector_update() RETURN trigger AS $$
-- BEGIN
--   NEW.search_vector :=
--     setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
--     setweight(to_tsvector('english', coalesce(NEW.brand, '')), 'B') ||
--     setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
--   RETURN NEW;
-- END
-- $$ LANGUAGE plpgsql;
-- --> statement-breakpoint
-- DROP TRIGGER IF EXISTS products_search_vector_trigger ON "products";
-- --> statement-breakpoint
-- CREATE TRIGGER products_search_vector_trigger
-- BEFORE INSERT OR UPDATE OF name, brand, description ON "products"
-- FOR EACH ROW EXECUTE FUNCTION products_search_vector_update()
-- --> statement-brakpoint
-- UPDATE "products" SET "name" = "name";
-- --> statement-breakpoint
-- CREATE INDEX IF NOT EXISTS products_search_vector_idx ON "products" USING GIN (search_vector);
-- --> statement-breakpoint
-- CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON "products" USING GIN (name gin_trgm_ops);


CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
	NEW.search_vector :=
		setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
		setweight(to_tsvector('english', coalesce(NEW.brand, '')), 'B') ||
		setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
	RETURN NEW;
END
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS products_search_vector_trigger ON "products";
--> statement-breakpoint
CREATE TRIGGER products_search_vector_trigger
BEFORE INSERT OR UPDATE OF name, brand, description ON "products"
FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();
--> statement-breakpoint
UPDATE "products" SET "name" = "name";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS products_search_vector_idx ON "products" USING GIN (search_vector);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON "products" USING GIN (name gin_trgm_ops);