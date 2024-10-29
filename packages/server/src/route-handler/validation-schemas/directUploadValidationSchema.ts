import { z } from 'zod';

export const directUploadValidationSchema = z.object({
  attachmentName: z
    .string({ message: 'attachmentName is required' })
    .trim()
    .regex(/^[a-z0-9-]+\.[a-z0-9-]+$/, {
      message: 'Invalid attachment name. Format: "model.attachment-name"',
    })
    .transform((val) => val as `${string}.${string}`),
  fileName: z.string({ message: 'fileName is required' }).trim(),
  contentType: z.string().trim(),
  checksum: z.string().trim(),
  size: z.number().gt(0).finite(),
  metadata: z.object({}).optional(),
});
