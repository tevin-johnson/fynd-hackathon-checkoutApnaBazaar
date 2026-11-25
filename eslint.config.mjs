import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.next-e2e/**',
      'playwright-report/**',
      'test-results/**',
      'docs/**',
      'next-env.d.ts',
    ],
  },
];

export default config;
