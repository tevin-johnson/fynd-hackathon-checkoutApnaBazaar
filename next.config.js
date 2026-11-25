/** @type {import('next').NextConfig} */
const nextConfig = {
  // A separate build dir lets the e2e build (which exposes test hooks) never
  // overwrite the production build in .next/.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Always define the flag so it is inlined as a literal: in a normal build it
  // becomes "0" and the test-hook code is removed as dead code.
  env: {
    NEXT_PUBLIC_PLAYWRIGHT_TEST: process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST === '1' ? '1' : '0',
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
