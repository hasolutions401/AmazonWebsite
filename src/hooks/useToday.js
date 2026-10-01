import useHydrated from './useHydrated.js';

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Today as YYYY-MM-DD: the build date while pre-rendering/hydrating, the visitor's date afterwards. */
export default function useToday() {
  const hydrated = useHydrated();
  return hydrated ? localToday() : __BUILD_DATE__; // eslint-disable-line no-undef
}
