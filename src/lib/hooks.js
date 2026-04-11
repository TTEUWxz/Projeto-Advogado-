import { useState, useEffect } from 'react'

/**
 * Debounce a value — only updates after `delay` ms of inactivity.
 * Prevents excessive re-renders on fast-typing search inputs.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
