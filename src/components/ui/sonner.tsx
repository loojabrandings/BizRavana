"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  CircleXIcon,
  TriangleAlertIcon,
  InfoIcon,
  Loader2Icon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      visibleToasts={5}
      closeButton
      richColors={false}
      duration={5000}
      gap={10}
      offset={16}
      mobileOffset={16}
      swipeDirections={["right"]}
      icons={{
        success: <CircleCheckIcon className="toast-icon toast-icon-success" />,
        info: <InfoIcon className="toast-icon toast-icon-info" />,
        warning: <TriangleAlertIcon className="toast-icon toast-icon-warning" />,
        error: <CircleXIcon className="toast-icon toast-icon-error" />,
        loading: <Loader2Icon className="toast-icon toast-icon-loading animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "sonner-toast",
          title: "sonner-toast-title",
          description: "sonner-toast-description",
          closeButton: "sonner-toast-close",
          icon: "sonner-toast-icon-wrapper",
          actionButton: "sonner-toast-action",
          cancelButton: "sonner-toast-cancel",
          content: "sonner-toast-content",
          // Type-specific overrides
          success: "sonner-toast--success",
          error: "sonner-toast--error",
          warning: "sonner-toast--warning",
          info: "sonner-toast--info",
          loading: "sonner-toast--loading",
        },
      }}
      style={
        {
          "--width": "360px",
          "--normal-bg": "var(--toast-bg)",
          "--normal-text": "var(--toast-text)",
          "--normal-border": "var(--toast-border)",
          "--toast-button-hover": "var(--toast-action-hover)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
