/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      // A página de apresentação passa a ser servida directamente em "/".
      // Antes, "/" redireccionava temporariamente para /landing.html, o que
      // contrariava o canonical da página (https://familia.proteinaludica.com/).
      beforeFiles: [{ source: "/", destination: "/landing.html" }],
    };
  },
};
module.exports = nextConfig;
