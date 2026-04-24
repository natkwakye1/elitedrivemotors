// src/lib/api.ts
// Axios instance with JWT auto-refresh and request interceptors.
// Used by all pages and hooks to talk to the FastAPI backend.

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Attach JWT on every request ───────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("emd_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (typeof window !== "undefined") {
        const refresh = localStorage.getItem("emd_refresh_token");
        if (refresh) {
          try {
            const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
              refresh_token: refresh,
            });
            localStorage.setItem("emd_access_token", data.access_token);
            original.headers.Authorization = `Bearer ${data.access_token}`;
            return api(original);
          } catch {
            localStorage.removeItem("emd_access_token");
            localStorage.removeItem("emd_refresh_token");
            window.location.href = "/auth/login";
          }
        }
      }
    }
    return Promise.reject(err);
  }
);

// ── Token helpers ─────────────────────────────────────────────────────────────
export const tokenStore = {
  set(access: string, refresh: string) {
    localStorage.setItem("emd_access_token", access);
    localStorage.setItem("emd_refresh_token", refresh);
  },
  clear() {
    localStorage.removeItem("emd_access_token");
    localStorage.removeItem("emd_refresh_token");
    localStorage.removeItem("emd_user");
  },
  getUser(): ApiUser | null {
    try {
      const raw = localStorage.getItem("emd_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setUser(user: ApiUser) {
    localStorage.setItem("emd_user", JSON.stringify(user));
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ApiUser {
  id:             string;
  email:          string;
  first_name:     string;
  last_name:      string;
  full_name:      string;
  role:           "customer" | "owner" | "admin" | "super_admin";
  status:         string;
  avatar_url?:    string;
  wallet_balance: number;
  city?:          string;
  phone?:         string;
}

export interface ApiCar {
  id:               string;
  make:             string;
  model:            string;
  year:             number;
  color?:           string;
  plate_number:     string;
  fuel_type:        string;
  transmission:     string;
  seats:            number;
  mileage_km:       number;
  listing_type:     string;
  daily_rate?:      number;
  sale_price?:      number;
  status:           string;
  description?:     string;
  features?:        string[];
  cover_image_url?: string;
  image_urls?:      string[];
  location_city?:   string;
  location_address?:string;
  latitude?:        number;
  longitude?:       number;
  is_verified:      boolean;
  rating_avg:       number;
  rating_count:     number;
  created_at:       string;
}

export interface ApiBooking {
  id:               string;
  car_id:           string;
  car?: {
    id:              string;
    make:            string;
    model:           string;
    plate_number:    string;
    cover_image_url?: string;
  };
  customer_id:      string;
  booking_type:     string;
  status:           string;
  pickup_location:  string;
  dropoff_location: string;
  start_date:       string;
  end_date:         string;
  daily_rate:       number;
  subtotal:         number;
  service_fee:      number;
  total_amount:     number;
  notes?:           string;
  created_at:       string;
}

export interface ApiSwap {
  id:              string;
  requester_id:    string;
  offered_car_id:  string;
  wanted_car_id:   string;
  offered_car?: {
    id: string; make: string; model: string;
    plate_number: string; cover_image_url?: string;
  };
  wanted_car?: {
    id: string; make: string; model: string;
    plate_number: string; cover_image_url?: string;
  };
  status:          string;
  message?:        string;
  top_up_amount:   number;
  responded_at?:   string;
  created_at:      string;
}

export interface ApiPayment {
  id:            string;
  booking_id?:   string;
  amount:        number;
  currency:      string;
  method:        string;
  status:        string;
  provider?:     string;
  provider_ref?: string;
  paid_at?:      string;
  created_at:    string;
  checkout_url?: string;
}

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  async login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    tokenStore.set(data.access_token, data.refresh_token);
    tokenStore.setUser(data.user);
    return data;
  },
  async register(payload: {
    email: string; password: string;
    first_name: string; last_name: string;
    phone?: string; role?: string;
  }) {
    const { data } = await api.post("/auth/register", payload);
    tokenStore.set(data.access_token, data.refresh_token);
    tokenStore.setUser(data.user);
    return data;
  },
  async logout() {
    const refresh = localStorage.getItem("emd_refresh_token");
    if (refresh) {
      try { await api.post("/auth/logout", { refresh_token: refresh }); } catch {}
    }
    tokenStore.clear();
  },
  async getMe(): Promise<ApiUser> {
    const { data } = await api.get("/users/me");
    return data;
  },
};

// ── Cars API ──────────────────────────────────────────────────────────────────
export const carsApi = {
  async browse(params: {
    city?: string; listing_type?: string;
    min_price?: number; max_price?: number;
    fuel?: string; transmission?: string;
    seats?: number; page?: number; limit?: number;
  } = {}) {
    const { data } = await api.get("/cars", { params });
    return data as { total: number; page: number; limit: number; data: ApiCar[] };
  },
  async myList(): Promise<ApiCar[]> {
    const { data } = await api.get("/cars/my");
    return data;
  },
  async get(id: string): Promise<ApiCar> {
    const { data } = await api.get(`/cars/${id}`);
    return data;
  },
  async create(payload: Partial<ApiCar>) {
    const { data } = await api.post("/cars", payload);
    return data as ApiCar;
  },
  async update(id: string, payload: Partial<ApiCar>) {
    const { data } = await api.patch(`/cars/${id}`, payload);
    return data as ApiCar;
  },
  async delete(id: string) {
    await api.delete(`/cars/${id}`);
  },
  async myListings() {
    const { data } = await api.get("/cars?owner=me&limit=50");
    return data.data as ApiCar[];
  },
};

// ── Bookings API ──────────────────────────────────────────────────────────────
export const bookingsApi = {
  async create(payload: {
    car_id: string; booking_type?: string;
    start_date: string; end_date: string;
    pickup_location: string; dropoff_location: string;
    payment_method?: string; notes?: string;
  }) {
    const { data } = await api.post("/bookings", payload);
    return data as ApiBooking;
  },
  async list() {
    const { data } = await api.get("/bookings");
    return data as ApiBooking[];
  },
  async get(id: string) {
    const { data } = await api.get(`/bookings/${id}`);
    return data as ApiBooking;
  },
  async cancel(id: string, reason?: string) {
    const { data } = await api.patch(`/bookings/${id}/cancel`, { reason });
    return data as ApiBooking;
  },
  async confirm(id: string) {
    const { data } = await api.patch(`/bookings/${id}/confirm`);
    return data as ApiBooking;
  },
  async reject(id: string, reason?: string) {
    const { data } = await api.patch(`/bookings/${id}/reject`, { reason });
    return data as ApiBooking;
  },
};

// ── Payments API ──────────────────────────────────────────────────────────────
export const paymentsApi = {
  async initiate(payload: { booking_id: string; method: string; phone_number?: string }) {
    const { data } = await api.post("/payments/initiate", payload);
    return data as ApiPayment;
  },
  async get(id: string) {
    const { data } = await api.get(`/payments/${id}`);
    return data as ApiPayment;
  },
};

// ── Swaps API ─────────────────────────────────────────────────────────────────
export const swapsApi = {
  async create(payload: { offered_car_id: string; wanted_car_id: string; message?: string; top_up_amount?: number }) {
    const { data } = await api.post("/swaps", payload);
    return data as ApiSwap;
  },
  async list() {
    const { data } = await api.get("/swaps");
    return data as ApiSwap[];
  },
  async listIncoming() {
    const { data } = await api.get("/swaps/incoming");
    return data as ApiSwap[];
  },
  async get(id: string) {
    const { data } = await api.get(`/swaps/${id}`);
    return data as ApiSwap;
  },
  async respond(id: string, action: "approve" | "reject", reason?: string) {
    const { data } = await api.patch(`/swaps/${id}/respond`, { action, reason });
    return data as ApiSwap;
  },
  async cancel(id: string) {
    await api.delete(`/swaps/${id}`);
  },
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminApi = {
  async stats() {
    const { data } = await api.get("/admin/stats");
    return data;
  },
  async users(page = 1, limit = 20) {
    const { data } = await api.get("/admin/users", { params: { page, limit } });
    return data as ApiUser[];
  },
  async updateUserStatus(id: string, status: string) {
    await api.patch(`/admin/users/${id}/status`, null, { params: { status } });
  },
  async allBookings(page = 1) {
    const { data } = await api.get("/admin/bookings", { params: { page } });
    return data as ApiBooking[];
  },
  async verifyCar(id: string) {
    await api.patch(`/admin/cars/${id}/verify`);
  },
};

// ── Tracking API ──────────────────────────────────────────────────────────────
export const trackingApi = {
  async getLocation(carId: string) {
    const { data } = await api.get(`/tracking/cars/${carId}/location`);
    return data;
  },
  async pushLocation(carId: string, payload: {
    latitude: number; longitude: number;
    speed_kmh?: number; heading?: number; state?: string;
  }) {
    await api.post(`/tracking/cars/${carId}/location`, payload);
  },
};

export default api;
