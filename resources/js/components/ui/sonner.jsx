"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { 
  CircleCheckIcon, 
  InfoIcon, 
  TriangleAlertIcon, 
  OctagonXIcon, 
  Loader2Icon,
} from "lucide-react"

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="top-right"
      className="toaster group"
      // 1. Close button explicitly enable kora holo
      closeButton={true} 
      icons={{
        success: <CircleCheckIcon className="size-5 text-success" />,
        info: <InfoIcon className="size-5 text-info" />,
        warning: <TriangleAlertIcon className="size-5 text-warning" />,
        error: <OctagonXIcon className="size-5 text-destructive" />,
        loading: <Loader2Icon className="size-5 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:gap-3",
          title: "group-[.toast]:font-bold group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          
          // 2. Close Button Fix: Pointer events auto kora hoyeche jate click kaj kore
          closeButton: "group-[.toast]:static group-[.toast]:translate-x-0 group-[.toast]:translate-y-0 group-[.toast]:opacity-100 group-[.toast]:pointer-events-auto group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-foreground/50 hover:group-[.toast]:text-foreground hover:group-[.toast]:bg-accent transition-all",

          success: "group-[.toaster]:border-success/30 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-success/10",
          error: "group-[.toaster]:border-destructive/30 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-destructive/10",
        },
      }}
      style={{
        "--border-radius": "var(--radius)",
      }}
      {...props} 
    />
  );
}

export { Toaster }
