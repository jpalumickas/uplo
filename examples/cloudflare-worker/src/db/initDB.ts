import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export const initDB = async ({ databaseUrl }: { databaseUrl: string }) => {
  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  return { db };
};

export type DB = Awaited<ReturnType<typeof initDB>>['db'];
