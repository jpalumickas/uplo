export class UploError extends Error {}
export class NotImplementedError extends UploError {}
export class AnalyzeError extends UploError {}
export class SignerError extends UploError {}

// Not Found Errors
export class NotFoundError extends UploError {}
export class BlobNotFoundError extends NotFoundError {}
export class AttachmentNotFoundError extends NotFoundError {}
