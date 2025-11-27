"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, FileText, Users2 } from "lucide-react"
import LogoutButton from "@/components/LogoutButton"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: ReadonlyArray<NavItem> = [
  { label: "Publicaciones", href: "/admin/posts", icon: FileText },
  { label: "Usuarios", href: "/admin/users", icon: Users2 },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const renderNavLink = (item: NavItem) => {
    const active = pathname.startsWith(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          active ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground"
        )}
      >
        <item.icon className="size-4" />
        <span>{item.label}</span>
      </Link>
    )
  }

  const title = pathname.startsWith("/admin/posts")
    ? "Publicaciones"
    : pathname.startsWith("/admin/users")
    ? "Usuarios"
    : "Admin"

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:w-60 flex-col border-r bg-card p-4">
        <div className="mb-4 font-semibold text-sm">Panel de Admin</div>
        <nav className="flex flex-col gap-1">
          {navItems.map(renderNavLink)}
        </nav>
        <div className="mt-auto pt-4">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 border-b bg-card p-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir navegación">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Panel de Admin</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-2">
                {navItems.map(renderNavLink)}
              </nav>
              <div className="p-2 mt-auto">
                <LogoutButton />
              </div>
            </SheetContent>
          </Sheet>
          <div className="text-sm font-medium">{title}</div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

