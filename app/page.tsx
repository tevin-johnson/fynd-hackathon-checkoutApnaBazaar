import { connection } from 'next/server';
import CheckoutPage from '@/components/CheckoutPage';

// Server shell. Awaiting connection() opts this route into per-request rendering
// so Next.js can stamp the CSP nonce (set in proxy.ts) onto its inline scripts.
export default async function Page() {
  await connection();
  return <CheckoutPage />;
}
