import nextPwa from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const withPwa = nextPwa({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
});

const config = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withPwa(config);
