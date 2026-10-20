export class UploError extends Error {}
export class NotImplementedError extends UploError {}
export class SignerError extends UploError {}
export class PurgeNotSupportedError extends NotImplementedError {}
export class BlobPurgeConflictError extends UploError {}

// Validation Errors
export class ValidationError extends UploError {}
export class BlobValidationError extends ValidationError {}
export class DirectUploadDisabledError extends ValidationError {}
export class InvalidSignedIdError extends ValidationError {}
export class BlobAlreadyAttachedError extends ValidationError {}
export class BlobNotUploadedError extends ValidationError {}

// Not Found Errors
export class NotFoundError extends UploError {}
export class BlobNotFoundError extends NotFoundError {}
export class AttachmentNotFoundError extends NotFoundError {}
