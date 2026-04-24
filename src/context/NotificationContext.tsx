"use client";
// src/context/NotificationContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";

export type NotifType = "booking" | "payment" | "rental" | "swap" | "system";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotifCtx {
  notifications: Notification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

const MOCK_NOTIFS: Notification[] = [
  { id:"n1", type:"booking",  title:"Booking Confirmed",       body:"Your Toyota Camry booking for Mar 18–21 is confirmed.",  time:"2 min ago",  read:false },
  { id:"n2", type:"payment",  title:"Payment Processed",       body:"GH₵ 450.00 payment for rental RNT-003 was successful.",  time:"1 hr ago",   read:false },
  { id:"n3", type:"rental",   title:"Rental Starts Tomorrow",  body:"Your BMW 3 Series rental begins at 9:00 AM tomorrow.",   time:"3 hrs ago",  read:false },
  { id:"n4", type:"swap",     title:"Swap Request Approved",   body:"Your swap request for the Audi A4 has been approved.",   time:"Yesterday",  read:true  },
  { id:"n5", type:"system",   title:"Profile Updated",         body:"Your profile details were updated successfully.",         time:"2 days ago", read:true  },
];

const NotifContext = createContext<NotifCtx>({
  notifications: [],
  unread: 0,
  markRead: () => {},
  markAllRead: () => {},
  dismiss: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifs] = useState<Notification[]>(MOCK_NOTIFS);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = (id: string) =>
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifs(ns => ns.filter(n => n.id !== id));

  return (
    <NotifContext.Provider value={{ notifications, unread, markRead, markAllRead, dismiss }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotifications = () => useContext(NotifContext);
