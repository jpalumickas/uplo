import { z } from 'zod';

export const directUploadValidationSchema = z.object({
  attachmentName: z
    .string()
    .regex(/^[a-z0-9-]+\.[a-z0-9-]+$/, {
      message: 'Invalid attachment name. Format: "model.attachment-name"',
    })
    .transform((val) => val as `${string}.${string}`),
  fileName: z.string(),
  contentType: z.string(),
  checksum: z.string(),
  size: z.number(),
  metadata: z.object({}).optional(),
});
