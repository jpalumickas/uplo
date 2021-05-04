import crypto from 'crypto';

const generateKey = () => crypto.randomBytes(16).toString('hex');

export default generateKey;
