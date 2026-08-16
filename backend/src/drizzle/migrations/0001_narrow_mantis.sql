ALTER TABLE "products" ALTER COLUMN "price_cents" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "images" text[];--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stock" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price" numeric(10, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rating" numeric(3, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "numReviews" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "isFeatured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "banner" text;