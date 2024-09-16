CREATE TABLE IF NOT EXISTS "file_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"blob_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"record_type" varchar NOT NULL,
	"record_id" integer NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file_blobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_name" varchar NOT NULL,
	"key" varchar NOT NULL,
	"file_name" varchar NOT NULL,
	"content_type" varchar NOT NULL,
	"size" bigint NOT NULL,
	"checksum" varchar NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
