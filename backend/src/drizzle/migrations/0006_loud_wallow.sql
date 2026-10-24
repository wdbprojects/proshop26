ALTER TABLE "checkout_sessions" ALTER COLUMN "ship_latitude" SET DATA TYPE double precision USING "ship_latitude"::double precision; --> statement-breakpoint
ALTER TABLE "checkout_sessions" ALTER COLUMN "ship_longitude" SET DATA TYPE double precision USING "ship_longitude"::double precision;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "ship_latitude" SET DATA TYPE double precision USING "ship_latitude"::double precision;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "ship_longitude" SET DATA TYPE double precision USING "ship_longitude"::double precision;