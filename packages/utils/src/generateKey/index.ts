import { randomBytes } from 'crypto';

export const generateKey = (size: number = 16) => randomBytes(size).toString('hex');
