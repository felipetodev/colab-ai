module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
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
