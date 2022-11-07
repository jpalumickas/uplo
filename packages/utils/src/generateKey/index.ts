import { randomBytes } from 'node:crypto';

export const generateKey = (size: number = 16) => randomBytes(size).toString('hex');
