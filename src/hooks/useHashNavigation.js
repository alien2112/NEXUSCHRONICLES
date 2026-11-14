import { useCallback, useEffect, useState } from 'react';
import { canonicalHash, resolveHash } from '../data/routes';

export default function useHashNavigation() {
  const [currentPage, setCurrentPage] = useState(() => resolveHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(resolveHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback(page => {
    const hash = canonicalHash(page);
    setCurrentPage(resolveHash(hash));
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, []);

  return { currentPage, navigate };
}
