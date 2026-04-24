"use client";
// src/context/FavouritesContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface FavCtx {
  favourites: string[];
  toggle: (id: string) => void;
  isFav: (id: string) => boolean;
}

const FavContext = createContext<FavCtx>({
  favourites: [],
  toggle: () => {},
  isFav: () => false,
});

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("edm-favs");
      if (s) setFavs(JSON.parse(s));
    } catch {}
  }, []);

  const toggle = (id: string) =>
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      try { localStorage.setItem("edm-favs", JSON.stringify(next)); } catch {}
      return next;
    });

  const isFav = (id: string) => favourites.includes(id);

  return (
    <FavContext.Provider value={{ favourites, toggle, isFav }}>
      {children}
    </FavContext.Provider>
  );
}

export const useFavourites = () => useContext(FavContext);
