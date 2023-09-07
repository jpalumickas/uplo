-- CreateTable
CREATE TABLE "FileAttachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "recordType" VARCHAR NOT NULL,
    "recordId" UUID NOT NULL,
    "blobId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileBlob" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "serviceName" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "fileName" VARCHAR NOT NULL,
    "contentType" VARCHAR,
    "size" BIGINT NOT NULL,
    "checksum" VARCHAR NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileBlob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileAttachment_recordType_recordId_name_idx" ON "FileAttachment"("recordType", "recordId", "name");

-- CreateIndex
CREATE INDEX "FileAttachment_blobId_idx" ON "FileAttachment"("blobId");

-- CreateIndex
CREATE UNIQUE INDEX "FileAttachment_recordType_recordId_name_blobId_key" ON "FileAttachment"("recordType", "recordId", "name", "blobId");

-- CreateIndex
CREATE UNIQUE INDEX "FileBlob_key_key" ON "FileBlob"("key");

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_blobId_fkey" FOREIGN KEY ("blobId") REFERENCES "FileBlob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
