CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"image_kit_file_id" text
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "long_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_images_product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_one_primary_idx" ON "product_images" USING btree ("product_id") WHERE "product_images"."is_primary" = true;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "images";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "banner";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "image_kit_file_id";