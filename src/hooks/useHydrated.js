import { useEffect, useState } from 'react';

/** false during pre-render and the first client render, true afterwards. */
export default function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
