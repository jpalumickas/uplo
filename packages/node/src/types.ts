export interface Config {
  privateKey?: string;
  signedIdExpiresIn?: number;
}

export abstract class Service {
  constructor() { }
  abstract updateMetadata(): any;
}

export abstract class Adapter {
  constructor() { }
  abstract findBlob(): any;
  abstract attachBlob(): any;
}
