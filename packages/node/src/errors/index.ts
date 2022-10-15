export class UploError extends Error {}
export class NotImplementedError extends UploError {}
export class AnalyzeError extends UploError {}
export class SignerError extends UploError {}
export class NotFoundError extends UploError {}
export class BlobNotFoundError extends NotFoundError {}
