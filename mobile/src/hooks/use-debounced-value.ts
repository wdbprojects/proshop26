/* this utility waits until the user stops typing before the search runs. without it, every keystroke would hit your backend */

import { useEffect, useState } from "react";

export const useDebouncedValue = <T>(value: T, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
