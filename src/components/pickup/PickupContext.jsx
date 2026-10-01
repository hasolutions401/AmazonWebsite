import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { findProduct } from '../../data/catalog.js';
import { track } from '../../lib/analytics.js';

const STORAGE_KEY = 'ab-pickup-list';
const PickupContext = createContext(null);

export const itemKey = (brandSlug, model, variant) => [brandSlug, model, variant].join('|');

/** Re-reads each saved item from the catalog so prices/images stay current. */
function refresh(saved) {
  return saved
    .map((it) => {
      const p = findProduct(it.brandSlug, it.model, it.variant);
      if (!p || !p.variant) return null;
      return {
        key: itemKey(p.brand.slug, p.model.name, p.variant.name),
        brandSlug: p.brand.slug,
        brandName: p.brand.name,
        model: p.model.name,
        variant: p.variant.name,
        label: p.brand.models.length > 1 ? p.model.name : p.brand.name,
        price: p.variant.price,
        inStock: p.variant.inStock,
        image: p.image,
        to: p.to,
        qty: Math.min(Math.max(1, it.qty | 0), 99),
      };
    })
    .filter(Boolean);
}

export function PickupProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const toastTimer = useRef(null);

  // Load after hydration (the pre-rendered HTML always starts with an empty list)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setItems(refresh(saved));
    } catch {
      /* storage unavailable or corrupted — start empty */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const slim = items.map(({ brandSlug, model, variant, qty }) => ({ brandSlug, model, variant, qty }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      /* private mode etc. — list still works for this visit */
    }
  }, [items, loaded]);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const add = useCallback(
    (brandSlug, model, variant, qty = 1) => {
      setItems((list) => {
        const key = itemKey(brandSlug, model, variant);
        const existing = list.find((i) => i.key === key);
        if (existing) return list.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, 99) } : i));
        return [...list, ...refresh([{ brandSlug, model, variant, qty }])];
      });
      track('add_to_pickup', { brand: brandSlug, item: `${model} - ${variant}` });
      showToast(`Added · ${variant}`);
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      add,
      setQty: (key, qty) =>
        setItems((list) =>
          qty <= 0 ? list.filter((i) => i.key !== key) : list.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 99) } : i)),
        ),
      remove: (key) => setItems((list) => list.filter((i) => i.key !== key)),
      clear: () => setItems([]),
      has: (key) => items.some((i) => i.key === key),
      open,
      openList: () => {
        setToast(null);
        setOpen(true);
      },
      closeList: () => setOpen(false),
      toast,
      dismissToast: () => setToast(null),
    }),
    [items, open, toast, add],
  );

  return <PickupContext.Provider value={value}>{children}</PickupContext.Provider>;
}

export const usePickup = () => useContext(PickupContext);
