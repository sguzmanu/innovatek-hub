"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  Cpu,
  Zap,
  PlugZap,
  ChevronRight,
} from "lucide-react"

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/marcas",
    label: "Marcas",
    icon: ShoppingBag,
  },
  {
    href: "/skills",
    label: "Skills",
    icon: Cpu,
  },
  {
    href: "/automatizaciones",
    label: "Automatizaciones",
    icon: Zap,
  },
  {
    href: "/apis",
    label: "APIs",
    icon: PlugZap,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-border bg-card flex flex-col z-40">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">IK</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">InnovateK Hub</p>
            <p className="text-[10px] text-muted-foreground leading-tight">UnionX · Marcas Propias</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-3 w-3 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Sebastián Guzmán · {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  )
}
