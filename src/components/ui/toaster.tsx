"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-[#1A1A1A] border-[#E30613]/30 text-white">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-white font-montserrat-bold text-sm tracking-wide">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-white/60 text-xs font-montserrat-medium">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-white/40 hover:text-white" />
          </Toast>
        )
      })}
      <ToastViewport className="sm:bottom-4 sm:right-4" />
    </ToastProvider>
  )
}