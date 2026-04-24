"use client";
// src/components/tracking/MapView.tsx
// Wraps LeafletMap with dynamic import (no SSR) for Next.js compatibility.

import dynamic from "next/dynamic";
import { Car } from "@/src/types/car";
import { Theme } from "@/src/lib/theme";
import { CarPin } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

interface MapViewProps {
  cars:   Car[];
  t:      Theme;
  dark?:  boolean;
  singleCar?: Car;   // for the slide-in panel mini-map
}

export default function MapView({ cars, t, dark = false, singleCar }: MapViewProps) {
  const toPin = (c: Car): CarPin => ({
    id:           c.id,
    name:         c.name,
    spec:         c.spec,
    price:        c.price,
    image:        c.image,
    type:         c.type,
    fuel:         c.fuel,
    transmission: c.transmission,
    rating:       c.rating,
    status:       c.id % 2 === 0 ? "In Transit" : "Parked",
  });

  if (singleCar) {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <LeafletMap
          dark={dark}
          t={t}
          singleCar={toPin(singleCar)}
          zoom={15}
        />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: "hidden" }}>
      <LeafletMap
        dark={dark}
        t={t}
        cars={cars.map(toPin)}
        center={{ lat: 5.5908, lng: -0.2043 }}
        zoom={13}
      />
    </div>
  );
}
