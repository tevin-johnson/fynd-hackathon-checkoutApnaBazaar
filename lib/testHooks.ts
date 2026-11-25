// Test-only globals. NEXT_PUBLIC_PLAYWRIGHT_TEST is inlined at build time, so in
// a normal production build this function returns immediately and the hooks
// never exist on window.

import { getPlaceOrderCallCount, resetPlaceOrderCallCount } from './order.ts';
import { useCheckoutStore } from './store.ts';

declare global {
  interface Window {
    __resetStore?: () => void;
    __getPlaceOrderCallCount?: () => number;
  }
}

export function installTestHooks(): void {
  if (process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST !== '1') return;
  window.__resetStore = () => {
    useCheckoutStore.getState().reset();
    resetPlaceOrderCallCount();
  };
  window.__getPlaceOrderCallCount = getPlaceOrderCallCount;
}
