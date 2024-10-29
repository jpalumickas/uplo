export class UploError extends Error {}
export class NotImplementedError extends UploError {}
export class SignerError extends UploError {}

// Validation Errors
export class ValidationError extends UploError {}
export class BlobValidationError extends ValidationError {}

// Not Found Errors
export class NotFoundError extends UploError {}
export class BlobNotFoundError extends NotFoundError {}
export class AttachmentNotFoundError extends NotFoundError {}
