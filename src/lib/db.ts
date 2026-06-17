import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// Reuse a single client in long-running servers (dev HMR and production).
globalForPrisma.prisma = db

let shutdownHookRegistered = false

function registerShutdownHook() {
  if (shutdownHookRegistered || typeof process === 'undefined') return
  shutdownHookRegistered = true

  const disconnect = () => {
    void db.$disconnect()
  }

  process.once('beforeExit', disconnect)
  process.once('SIGINT', () => {
    disconnect()
    process.exit(0)
  })
  process.once('SIGTERM', () => {
    disconnect()
    process.exit(0)
  })
}

registerShutdownHook()
