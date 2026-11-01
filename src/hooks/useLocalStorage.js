import { useState, useEffect } from 'react';
import { getStoredData, setStoredData } from '../services/storage.js';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => getStoredData(key, initialValue));

  useEffect(() => {
    setStoredData(key, value);
  }, [key, value]);

  return [value, setValue];
}
