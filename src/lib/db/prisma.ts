import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  console.log('Initializing PrismaClient...');
  try {
    return new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  } catch (err) {
    console.error('Failed to initialize PrismaClient:', err);
    throw err;
  }
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
