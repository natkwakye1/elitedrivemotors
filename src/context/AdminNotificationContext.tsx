"use client";
// src/context/AdminNotificationContext.tsx
// Admin-specific notification context — distinct from customer notifications.

import { createContext, useContext, useState, ReactNode } from "react";

export type AdminNotifType = "customer" | "booking" | "payment" | "fleet" | "swap" | "alert";

export interface AdminNotification {
  id:    string;
  type:  AdminNotifType;
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
  link?: string;
}

const MOCK_ADMIN_NOTIFS: AdminNotification[] = [
  { id: "an1", type: "customer", title: "New Customer Registered",  body: "Kwame Asante just created an account.",                   time: "5 min ago",  read: false, link: "/dashboard/super-admin/customers" },
  { id: "an2", type: "booking",  title: "New Booking Request",      body: "BMW 3 Series booked for Mar 18–21 by Abena Osei.",         time: "12 min ago", read: false, link: "/dashboard/super-admin/rentals"   },
  { id: "an3", type: "payment",  title: "Payment Received",         body: "GH₵ 850.00 received for rental RNT-005.",                 time: "1 hr ago",   read: false, link: "/dashboard/super-admin/payments"  },
  { id: "an4", type: "fleet",    title: "Vehicle Maintenance Due",  body: "Toyota Camry (GT-5512-23) is due for service in 3 days.", time: "2 hrs ago",  read: true,  link: "/dashboard/super-admin/cars"      },
  { id: "an5", type: "swap",     title: "Swap Request Pending",     body: "Kofi Mensah submitted a swap request for Audi A4.",       time: "3 hrs ago",  read: true,  link: "/dashboard/super-admin/swaps"     },
  { id: "an6", type: "alert",    title: "Low Fleet Availability",   body: "Only 2 vehicles available for the next 3 days.",          time: "Yesterday",  read: true                                               },
];

interface AdminNotificationCtx {
  notifications: AdminNotification[];
  unread:        number;
  markRead:      (id: string) => void;
  markAllRead:   () => void;
  dismiss:       (id: string) => void;
}

const AdminNotificationContext = createContext<AdminNotificationCtx>({
  notifications: [],
  unread:        0,
  markRead:      () => {},
  markAllRead:   () => {},
  dismiss:       () => {},
});

export function AdminNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(MOCK_ADMIN_NOTIFS);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <AdminNotificationContext.Provider value={{ notifications, unread, markRead, markAllRead, dismiss }}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

export const useAdminNotifications = () => useContext(AdminNotificationContext);
