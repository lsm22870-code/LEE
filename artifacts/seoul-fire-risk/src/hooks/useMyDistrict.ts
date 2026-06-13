import { useState, useCallback } from "react";

const STORAGE_KEY = "seoul-fire-my-district";

export function useMyDistrict() {
  const [myDistrict, setMyDistrictState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setMyDistrict = useCallback((name: string | null) => {
    try {
      if (name) {
        localStorage.setItem(STORAGE_KEY, name);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    setMyDistrictState(name);
  }, []);

  return { myDistrict, setMyDistrict };
}
