import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

import {
  AttachmentNotFoundError,
  BlobValidationError,
  DirectUploadDisabledError,
} from '../../errors'

export const onErrorHandler: ErrorHandler = async (err, c) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    return err.getResponse()
  }

  if (
    err instanceof AttachmentNotFoundError ||
    err instanceof BlobValidationError ||
    err instanceof DirectUploadDisabledError
  ) {
    return c.json(
      {
        success: false,
        error: { message: err.message },
      },
      { status: 422 },
    )
  }

  // TODO: Add error handler to Uplo
  console.error(err)
  return c.json(
    {
      success: false,
      error: { message: 'Internal Server Error' },
    },
    { status: 500 },
  )
}
