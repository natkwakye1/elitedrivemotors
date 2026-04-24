"use client";
// src/app/providers.tsx

import { AdminAuthProvider }          from "@/src/context/AdminAuthContext";
import { CustomerAuthProvider }       from "@/src/context/Customerauthcontext";
import { ThemeProvider }              from "@/src/context/ThemeContext";
import { NotificationProvider }       from "@/src/context/NotificationContext";
import { ChatProvider }               from "@/src/context/ChatContext";
import { FavouritesProvider }         from "@/src/context/FavouritesContext";
import { AdminNotificationProvider }  from "@/src/context/AdminNotificationContext";
import { AdminChatProvider }          from "@/src/context/AdminChatContext";
import RouteProgress                  from "@/src/components/ui/RouteProgress";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RouteProgress />
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <NotificationProvider>
            <ChatProvider>
              <FavouritesProvider>
                <AdminNotificationProvider>
                  <AdminChatProvider>
                    {children}
                  </AdminChatProvider>
                </AdminNotificationProvider>
              </FavouritesProvider>
            </ChatProvider>
          </NotificationProvider>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
