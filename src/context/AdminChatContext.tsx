"use client";
// src/context/AdminChatContext.tsx
// Admin ↔ customer chat context.

import { createContext, useContext, useState, ReactNode } from "react";

export interface AdminMessage {
  id:   string;
  from: "admin" | "customer";
  text: string;
  time: string;
}

export interface AdminConversation {
  id:           string;
  customerId:   string;
  customerName: string;
  avatar:       string;
  online:       boolean;
  lastMsg:      string;
  lastTime:     string;
  unread:       number;
  messages:     AdminMessage[];
}

const MOCK_ADMIN_CONVS: AdminConversation[] = [
  {
    id: "ac1", customerId: "CUS-001", customerName: "Kwame Asante", avatar: "KA", online: true,
    lastMsg: "What is the status of my booking?", lastTime: "Just now", unread: 2,
    messages: [
      { id: "am1", from: "customer", text: "Hello, I need help with my booking.",          time: "10:00 AM" },
      { id: "am2", from: "admin",    text: "Hi Kwame! How can I assist you today?",        time: "10:01 AM" },
      { id: "am3", from: "customer", text: "What is the status of my BMW booking?",        time: "10:02 AM" },
      { id: "am4", from: "customer", text: "I need it confirmed ASAP.",                    time: "10:02 AM" },
    ],
  },
  {
    id: "ac2", customerId: "CUS-002", customerName: "Abena Osei", avatar: "AO", online: true,
    lastMsg: "Thank you for the quick response!", lastTime: "5 min ago", unread: 1,
    messages: [
      { id: "am5", from: "customer", text: "I'd like to upgrade my rental to a Tesla.",                                          time: "9:45 AM" },
      { id: "am6", from: "admin",    text: "Sure Abena! We have the Tesla Model S available. Would you like to proceed?",        time: "9:47 AM" },
      { id: "am7", from: "customer", text: "Thank you for the quick response!",                                                  time: "9:48 AM" },
    ],
  },
  {
    id: "ac3", customerId: "CUS-003", customerName: "Kofi Mensah", avatar: "KM", online: false,
    lastMsg: "Looking forward to hearing from you.", lastTime: "Yesterday", unread: 0,
    messages: [
      { id: "am8",  from: "customer", text: "I submitted a swap request yesterday. Any updates?",                                              time: "Yesterday 3:00 PM" },
      { id: "am9",  from: "admin",    text: "Hi Kofi, we're reviewing your request and will get back to you within 24 hours.",                time: "Yesterday 3:05 PM" },
      { id: "am10", from: "customer", text: "Looking forward to hearing from you.",                                                            time: "Yesterday 3:06 PM" },
    ],
  },
];

interface AdminChatCtx {
  conversations: AdminConversation[];
  activeId:      string | null;
  setActive:     (id: string | null) => void;
  sendMessage:   (conversationId: string, text: string) => void;
  totalUnread:   number;
}

const AdminChatContext = createContext<AdminChatCtx>({
  conversations: [],
  activeId:      null,
  setActive:     () => {},
  sendMessage:   () => {},
  totalUnread:   0,
});

export function AdminChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<AdminConversation[]>(MOCK_ADMIN_CONVS);
  const [activeId, setActiveId]           = useState<string | null>(null);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const setActive = (id: string | null) => {
    setActiveId(id);
    if (id) {
      // Clear unread for the opened conversation
      setConversations(prev =>
        prev.map(c => c.id === id ? { ...c, unread: 0 } : c)
      );
    }
  };

  const sendMessage = (conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: AdminMessage = {
      id:   `am-${Date.now()}`,
      from: "admin",
      text: trimmed,
      time: now,
    };
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: trimmed, lastTime: "Just now" }
          : c
      )
    );
  };

  return (
    <AdminChatContext.Provider value={{ conversations, activeId, setActive, sendMessage, totalUnread }}>
      {children}
    </AdminChatContext.Provider>
  );
}

export const useAdminChat = () => useContext(AdminChatContext);
