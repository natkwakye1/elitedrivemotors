"use client";
// src/context/ChatContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";

export interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: string;
  online: boolean;
  lastMsg: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

interface ChatCtx {
  conversations: Conversation[];
  activeId: string | null;
  setActive: (id: string | null) => void;
  sendMessage: (convId: string, text: string) => void;
  totalUnread: number;
}

const MOCK_CONVS: Conversation[] = [
  {
    id: "c1",
    name: "EliteDrive Support",
    avatar: "ES",
    role: "Support Team",
    online: true,
    lastMsg: "Hi! How can we help you today?",
    lastTime: "Just now",
    unread: 1,
    messages: [
      { id: "m1", from: "them", text: "Hi! Welcome to EliteDrive Motors. How can we assist you today?", time: "10:00 AM" },
      { id: "m2", from: "me",   text: "I'd like to know the status of my rental booking.", time: "10:02 AM" },
      { id: "m3", from: "them", text: "Sure! Your BMW 3 Series booking is confirmed for Mar 18–21. Is there anything else?", time: "10:03 AM" },
    ],
  },
  {
    id: "c2",
    name: "Fleet Manager",
    avatar: "FM",
    role: "Vehicle Support",
    online: false,
    lastMsg: "Your swap request is under review.",
    lastTime: "Yesterday",
    unread: 0,
    messages: [
      { id: "m4", from: "them", text: "Hello! Your swap request for the Audi A4 has been received.", time: "Yesterday 2:00 PM" },
      { id: "m5", from: "me",   text: "Great, when will I get a response?", time: "Yesterday 2:05 PM" },
      { id: "m6", from: "them", text: "Within 24-48 hours. We'll notify you as soon as it's reviewed.", time: "Yesterday 2:07 PM" },
    ],
  },
];

const ChatContext = createContext<ChatCtx>({
  conversations: [],
  activeId: null,
  setActive: () => {},
  sendMessage: () => {},
  totalUnread: 0,
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConvs] = useState<Conversation[]>(MOCK_CONVS);
  const [activeId, setActive] = useState<string | null>(null);

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  const sendMessage = (convId: string, text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setConvs(cs =>
      cs.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: text, lastTime: "Just now", unread: 0 }
          : c
      )
    );
  };

  return (
    <ChatContext.Provider value={{ conversations, activeId, setActive, sendMessage, totalUnread }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
