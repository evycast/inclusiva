"use client"

import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export default function SafetyNoticeModal({
  storageKey = "safetyNoticeAccepted",
  title = "Advertencia y recomendaciones",
  description = "Cuidá tu seguridad y tomá decisiones informadas antes de avanzar.",
  acceptLabel = "Acepto y asumo la responsabilidad",
  children,
  onAccepted,
}: {
  storageKey?: string
  title?: React.ReactNode
  description?: React.ReactNode
  acceptLabel?: React.ReactNode
  children?: React.ReactNode
  onAccepted?: () => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(storageKey) === "true"
      if (!accepted) setOpen(true)
    } catch {}
  }, [storageKey])

  const accept = () => {
    try {
      localStorage.setItem(storageKey, "true")
    } catch {}
    setOpen(false)
    onAccepted?.()
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          try {
            const accepted = localStorage.getItem(storageKey) === "true"
            if (!accepted) return
          } catch {
            return
          }
        }
        setOpen(o)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogAction onClick={accept}>{acceptLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

