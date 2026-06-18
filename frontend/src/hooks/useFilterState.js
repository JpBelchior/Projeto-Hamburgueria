import { useState, useCallback, useRef } from "react";

export const useFilterState = (initial) => {
  const initialRef = useRef(initial);
  const [filters, setFilters] = useState(initial);

  const setFilter = useCallback(
    (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value })),
    []
  );

  const dirty = Object.keys(initialRef.current).some(
    (k) => filters[k] !== initialRef.current[k]
  );

  const reset = useCallback(() => setFilters(initialRef.current), []);

  return { filters, setFilter, dirty, reset };
};
