"use client";
// src/components/tracking/LeafletMap.tsx
// Uses Leaflet + OpenStreetMap — 100% free, no API key needed.

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, Marker as LMarker } from "leaflet";

// ── Accra coordinates per car id ─────────────────────────────────────────────
const CAR_COORDS: Record<number, [number, number]> = {
  1:  [5.5604, -0.2019],
  2:  [5.5572, -0.1955],
  3:  [5.5502, -0.2174],
  4:  [5.6037, -0.1870],
  5:  [5.6145, -0.2057],
  6:  [5.5488, -0.1760],
  7:  [5.6350, -0.1681],
  8:  [5.6200, -0.2300],
  9:  [5.5710, -0.2024],
  10: [5.5830, -0.1890],
  11: [5.5950, -0.1920],
  12: [5.5680, -0.1760],
};

const VEH_COORDS: Record<string, [number, number]> = {
  "RNT-001": [5.6037, -0.1870],
  "RNT-005": [5.6350, -0.1681],
  "RNT-003": [5.5604, -0.2019],
  "RNT-002": [5.6145, -0.2057],
  "RNT-006": [5.6200, -0.2300],
};

const STATUS_COLOR: Record<string, string> = {
  "In Transit": "#10B981",
  "Idle":       "#F59E0B",
  "Parked":     "#6B7280",
};

const SALE_PRICES: Record<number, string> = {
  1:"$24,900", 2:"$18,500", 3:"$27,000",  4:"$21,500",
  5:"$52,000", 6:"$22,800", 7:"$68,000",  8:"$19,900",
  9:"$29,500", 10:"$38,000",11:"$44,000", 12:"$72,000",
};

export interface CarPin {
  id:           number;
  name:         string;
  spec:         string;
  price:        number;
  image:        string;
  type:         string;
  fuel:         string;
  transmission: string;
  rating:       number;
  status?:      "Parked" | "In Transit";
  salePrice?:   string;
  listingType?: string;
}

export interface VehiclePin {
  id:       string;
  car:      string;
  plate:    string;
  status:   "In Transit" | "Idle" | "Parked";
  driver:   string;
  speed:    string;
  location: string;
  eta:      string;
}

interface Props {
  dark:            boolean;
  t:               any;
  cars?:           CarPin[];
  vehicles?:       VehiclePin[];
  center?:         { lat: number; lng: number };
  zoom?:           number;
  singleCar?:      CarPin;
  onCarClick?:     (id: number) => void;
  onVehicleClick?: (id: string) => void;
}

// Build a colored circle marker HTML
function circleMarkerHtml(color: string, size = 14) {
  return `<div style="
    width:${size}px; height:${size}px; border-radius:50%;
    background:${color}; border:2.5px solid #fff;
    box-shadow:0 2px 8px ${color}88;
  "></div>`;
}

// Build a car icon marker HTML
function carMarkerHtml(color: string, label: string) {
  return `<div style="
    background:#fff; color:${color};
    border:2px solid ${color};
    border-radius:16px; padding:3px 10px;
    font-size:11px; font-weight:700;
    font-family:'DM Sans',sans-serif;
    white-space:nowrap;
    box-shadow:0 2px 8px rgba(0,0,0,0.18);
  ">${label}</div>`;
}

export default function LeafletMap({
  dark, t, cars, vehicles, center, zoom = 13, singleCar, onCarClick, onVehicleClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LMap | null>(null);

  const defaultCenter: [number, number] = singleCar
    ? (CAR_COORDS[singleCar.id] ?? [5.5908, -0.2043])
    : center ? [center.lat, center.lng] : [5.5908, -0.2043];

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // already initialised

    // Dynamic import keeps Leaflet out of SSR
    import("leaflet").then(L => {
      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center:          defaultCenter,
        zoom:            singleCar ? 15 : zoom,
        zoomControl:     true,
        attributionControl: true,
      });

      mapRef.current = map;

      // ── Maptiler tiles — looks like Google Maps, free 100k/month ────────
      // Sign up free at https://cloud.maptiler.com/account/keys
      const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
      const hasMaptiler = maptilerKey && maptilerKey !== "YOUR_MAPTILER_KEY_HERE";

      if (hasMaptiler) {
        // Maptiler Streets — full Google Maps look: roads, POIs, parks, labels
        const tileUrl = dark
          ? `https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=${maptilerKey}`
          : `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`;
        L.tileLayer(tileUrl, {
          attribution: '© <a href="https://www.maptiler.com/copyright/">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1,
        }).addTo(map);
      } else {
        // Fallback — CARTO (no key needed, clean minimal style)
        const tileUrl = dark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
        L.tileLayer(tileUrl, {
          attribution: '© <a href="https://carto.com">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          maxZoom: 19,
        }).addTo(map);
      }

      // ── Single car mini-map ───────────────────────────────────────────────
      if (singleCar) {
        const pos   = CAR_COORDS[singleCar.id] ?? defaultCenter;
        const st    = singleCar.status ?? (singleCar.id % 2 === 0 ? "In Transit" : "Parked");
        const color = st === "In Transit" ? "#10B981" : "#6B7280";
        const icon  = L.divIcon({ html: circleMarkerHtml(color, 16), className: "", iconAnchor: [8, 8] });
        L.marker(pos, { icon })
          .addTo(map)
          .bindPopup(`<b>${singleCar.name}</b><br/><small>${singleCar.spec}</small>`);
      }

      // ── Car browse markers ───────────────────────────────────────────────
      if (cars) {
        cars.forEach(car => {
          const pos   = CAR_COORDS[car.id] ?? defaultCenter;
          const st    = car.status ?? (car.id % 2 === 0 ? "In Transit" : "Parked");
          const color = st === "In Transit" ? "#10B981" : car.listingType === "Buy" || car.listingType === "Swap" ? "#6B7280" : "#4F46E5";
          const label = car.salePrice ?? `$${car.price}/day`;
          const icon  = L.divIcon({ html: carMarkerHtml(color, label), className: "", iconAnchor: [0, 0] });
          const marker = L.marker(pos, { icon }).addTo(map);
          marker.bindPopup(`<b>${car.name}</b><br/><small>${car.spec}</small><br/><b style="color:${color}">${label}</b>`);
          marker.on("click", () => { if (onCarClick) onCarClick(car.id); });
        });
      }

      // ── Vehicle tracking markers ─────────────────────────────────────────
      if (vehicles) {
        vehicles.forEach(veh => {
          const pos   = VEH_COORDS[veh.id] ?? defaultCenter;
          const color = STATUS_COLOR[veh.status] ?? "#6B7280";
          const html  = `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:32px;height:32px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 10px ${color}88;display:flex;align-items:center;justify-content:center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div style="background:rgba(0,0,0,0.7);color:#fff;border-radius:5px;padding:1px 6px;font-size:9px;font-weight:700;font-family:'DM Sans',sans-serif;white-space:nowrap">${veh.car}</div>
          </div>`;
          const icon = L.divIcon({ html, className: "", iconAnchor: [16, 16] });
          const marker = L.marker(pos, { icon }).addTo(map);
          marker.bindPopup(`
            <b>${veh.car}</b><br/>
            <small>${veh.plate} · ${veh.id}</small><br/>
            Driver: <b>${veh.driver}</b><br/>
            Speed: <b>${veh.speed}</b><br/>
            ETA: <b>${veh.eta}</b><br/>
            <span style="font-size:10px;color:${color}">${veh.status}</span>
          `);
          marker.on("click", () => { if (onVehicleClick) onVehicleClick(veh.id); });
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        .leaflet-container { background: ${dark ? "#1C1C2E" : "#f0f4f8"}; }
        .leaflet-popup-content-wrapper { border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; }
        .leaflet-popup-content { margin: 10px 14px; }
        .leaflet-control-attribution { font-size: 9px !important; opacity: 0.5; }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
