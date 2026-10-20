import type { BlobData } from '@uplo/types'

// GCS refuses PUT uploads with a different size (400 Bad Request).
// Min and max are the same, so the uploaded file must match the declared size.
export const contentLengthRangeHeader = (blob: BlobData) => {
  const size = Number(blob.size)
  return { 'x-goog-content-length-range': `${size},${size}` }
}
