import { Hono } from 'hono';
import { validator } from 'hono/validator';

import type { UploInstance } from '../types';
import { directUploadValidationSchema } from './validation-schemas/directUploadValidationSchema.js';
import { formatZodErrors } from './utils/formatZodErrors.js';
import { onErrorHandler } from './middleware/onErrorHandler.js';

type Options<T> = {
  uplo: T;
  basePath?: string;
};

export const createUploRouteHandler = <T extends UploInstance<any>>({
  uplo,
  basePath = '/uplo',
}: Options<T>) => {
  const app = new Hono().basePath(basePath);

  app.onError(onErrorHandler);

  app.post(
    '/create-direct-upload',
    validator('json', (value, c) => {
      if (!value) {
        return c.json(
          {
            success: false,
            error: { message: 'Request body is required' },
          },
          { status: 422 }
        );
      }

      return value;
    }),
    async (c) => {
      const requestData = await c.req.valid('json');
      if (!requestData) {
        return c.json(
          {
            success: false,
            error: { message: 'Request body is required' },
          },
          { status: 422 }
        );
      }

      const parsed =
        await directUploadValidationSchema.safeParseAsync(requestData);

      if (!parsed.success) {
        return c.json(
          {
            success: false,
            error: {
              message: 'Invalid attachment',
              fields: formatZodErrors(parsed.error),
            },
          },
          { status: 422 }
        );
      }

      const {
        attachmentName,
        fileName,
        contentType,
        size,
        checksum,
        metadata,
      } = parsed.data;

      const attachment = uplo.$findGenericAttachment(attachmentName);
      if (!attachment) {
        return c.json(
          {
            success: false,
            error: {
              message: `Attachment with name "${attachmentName}" was not found`,
            },
          },
          { status: 422 }
        );
      }

      const params = {
        fileName,
        contentType,
        size,
        checksum,
        metadata,
      };

      const data = await attachment.createDirectUpload({ params });

      return c.json(data, { status: 201 });
    }
  );

  return app.fetch;
};
