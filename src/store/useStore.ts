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

export const useStore = create<StoreState>((set) => ({
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
