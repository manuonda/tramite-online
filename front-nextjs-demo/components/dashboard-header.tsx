"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Database, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function DashboardHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <LayoutGrid className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">FormFlow</span>
          </Link>
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
              <Separator orientation="vertical" className="mx-2 h-5" />
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  {item.href ? (
                    <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant={pathname === "/domains" ? "secondary" : "ghost"} size="sm" asChild>
            <Link href="/domains">
              <Database className="mr-1.5 h-4 w-4" />
              Dominios
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
