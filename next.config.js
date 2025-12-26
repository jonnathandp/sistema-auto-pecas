/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },
  env: {
    SKIP_ENV_VALIDATION: '1'
  },
  // Configuração específica para build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Forçar rotas de API como dinâmicas
  rewrites: async () => {
    return []
  }
}

module.exports = nextConfig