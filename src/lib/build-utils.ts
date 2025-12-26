// Middleware para verificar se estamos em ambiente de build
export function isBuildTime(): boolean {
  return (
    process.env.VERCEL_ENV === 'build' ||
    process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    !process.env.DATABASE_URL
  )
}

export function buildTimeResponse(data: any = {}) {
  return {
    success: true,
    buildTime: true,
    ...data
  }
}