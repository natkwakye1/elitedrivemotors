// src/hooks/useApi.ts
// React hooks for fetching data from the backend API with loading/error state.

"use client";

import { useState, useEffect, useCallback } from "react";
import { carsApi, bookingsApi, swapsApi, adminApi, type ApiCar, type ApiBooking, type ApiSwap, type ApiUser } from "@/src/lib/api";

// ── My Cars ───────────────────────────────────────────────────────────────────
export function useMyCars() {
  const [cars, setCars]       = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    carsApi.myList()
      .then(data => { setCars(data); setError(null); })
      .catch(e   => setError(e?.response?.data?.detail || "Failed to load your cars"))
      .finally(() => setLoading(false));
  }, []);

  return { cars, loading, error };
}

// ── Cars ──────────────────────────────────────────────────────────────────────
export function useCars(params: Parameters<typeof carsApi.browse>[0] = {}) {
  const [cars, setCars]       = useState<ApiCar[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const key = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    carsApi.browse(params)
      .then(res => { setCars(res.data); setTotal(res.total); setError(null); })
      .catch(e  => setError(e?.response?.data?.detail || "Failed to load cars"))
      .finally(() => setLoading(false));
  }, [key]); // eslint-disable-line

  return { cars, total, loading, error };
}

export function useCar(id: string | null) {
  const [car, setCar]         = useState<ApiCar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    carsApi.get(id)
      .then(data => { setCar(data); setError(null); })
      .catch(e   => setError(e?.response?.data?.detail || "Car not found"))
      .finally(() => setLoading(false));
  }, [id]);

  return { car, loading, error };
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export function useBookings() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    bookingsApi.list()
      .then(data => { setBookings(data); setError(null); })
      .catch(e   => setError(e?.response?.data?.detail || "Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { bookings, loading, error, refetch };
}

// ── Swaps ─────────────────────────────────────────────────────────────────────
export function useSwaps() {
  const [swaps, setSwaps]       = useState<ApiSwap[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    swapsApi.list()
      .then(data => { setSwaps(data); setError(null); })
      .catch(e   => setError(e?.response?.data?.detail || "Failed to load swaps"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { swaps, loading, error, refetch };
}

// ── Admin Stats ───────────────────────────────────────────────────────────────
export function useAdminStats() {
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

export function useAdminUsers(page = 1) {
  const [users, setUsers]     = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.users(page)
      .then(data => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return { users, loading };
}

export function useAdminBookings(page = 1) {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    adminApi.allBookings(page)
      .then(data => setBookings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return { bookings, loading };
}
