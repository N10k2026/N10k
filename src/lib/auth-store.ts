import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register' | 'profile';
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  setAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: 'login' | 'register' | 'profile') => void;
  checkSession: () => Promise<void>;
}

const authFetch = (input: string, init?: RequestInit) =>
  fetch(input, { ...init, credentials: 'include' });

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthModalOpen: false,
  authMode: 'login',

  login: async (email: string, password: string) => {
    try {
      const res = await authFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.user?.id) return false;
      set({ user: data.user, isAuthModalOpen: false });
      return true;
    } catch {
      return false;
    }
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await authFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.user?.id) return false;
      set({ user: data.user, isAuthModalOpen: false });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Clear client state even if network fails
    }
    set({ user: null, isAuthModalOpen: false, authMode: 'login' });
  },

  updateProfile: async (data: Partial<User>) => {
    const current = get().user;
    if (!current) return false;

    try {
      const payload: { name?: string; phone?: string } = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.phone !== undefined) payload.phone = data.phone;

      const res = await authFetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updated = await res.json().catch(() => null);
      if (!res.ok || !updated?.id) return false;

      set({ user: { ...current, ...updated } });
      return true;
    } catch {
      return false;
    }
  },

  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setAuthMode: (mode) => set({ authMode: mode }),

  checkSession: async () => {
    try {
      const res = await authFetch('/api/auth/me');
      if (!res.ok) {
        set({ user: null });
        return;
      }
      const user = await res.json();
      if (user?.id) {
        set({ user });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    }
  },
}));
