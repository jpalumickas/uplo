/**
 * Structural type describing the subset of a Prisma generated client that this
 * adapter relies on. Prisma 7 stopped exporting a base `PrismaClient` class
 * from `@prisma/client` — that type now only exists in the user-generated
 * client. We type the client by shape instead, which works with any
 * `PrismaClient` produced by `prisma generate` regardless of where it lives.
 */
export interface PrismaModelDelegate {
  create: (args: any) => Promise<any>
  findUnique: (args: any) => Promise<any>
  findMany: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
  deleteMany: (args: any) => Promise<any>
}

export interface PrismaClient {
  fileBlob: PrismaModelDelegate
  fileAttachment: PrismaModelDelegate
  $transaction: <T>(fn: (prisma: PrismaClient) => Promise<T>) => Promise<T>
}
