import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'error'
}

interface ToastStore {
  toasts: Toast[]
  add: (message: string, type?: Toast['type']) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add(message, type = 'success') {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000)
  },
  remove(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

export const toast = (message: string, type?: Toast['type']) =>
  useToastStore.getState().add(message, type)
