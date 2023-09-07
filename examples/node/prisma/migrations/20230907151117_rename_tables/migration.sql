/*
  Warnings:

  - You are about to drop the `FileAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FileBlob` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FileAttachment" DROP CONSTRAINT "FileAttachment_blobId_fkey";

-- DropTable
DROP TABLE "FileAttachment";

-- DropTable
DROP TABLE "FileBlob";

-- CreateTable
CREATE TABLE "file_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "record_type" VARCHAR NOT NULL,
    "record_id" UUID NOT NULL,
    "blob_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_blobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_name" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "file_name" VARCHAR NOT NULL,
    "content_type" VARCHAR,
    "size" BIGINT NOT NULL,
    "checksum" VARCHAR NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_blobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_attachments_record_type_record_id_name_idx" ON "file_attachments"("record_type", "record_id", "name");

-- CreateIndex
CREATE INDEX "file_attachments_blob_id_idx" ON "file_attachments"("blob_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_attachments_record_type_record_id_name_blob_id_key" ON "file_attachments"("record_type", "record_id", "name", "blob_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_blobs_key_key" ON "file_blobs"("key");

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_blob_id_fkey" FOREIGN KEY ("blob_id") REFERENCES "file_blobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
