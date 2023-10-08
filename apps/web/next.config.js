module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  experimental: {
    serverActions: true,
  },
  async redirects() {
    return [
      {
        source: '/discord',
        destination: 'https://discord.gg/xjBVSGSYCX',
        permanent: true,
      },
    ]
  },
};
