"use client";

import { create } from "zustand";

interface Notification {
  id: string;
  type: string;
  recipientId: string;
  actorId: string;
  postId?: string | null;
  commentId?: string | null;
  read: boolean;
  createdAt: Date;
}

interface StoreState {
  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAllRead: () => void;
  addNotification: (notification: Notification) => void;
}

// Read initial theme from DOM (set by the anti-flash script in layout)
function getInitialTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export const useStore = create<StoreState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
        localStorage.setItem("theme", next);
      }
      return { theme: next };
    }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),
}));
