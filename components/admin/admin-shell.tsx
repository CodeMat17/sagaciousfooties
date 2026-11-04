"use client";

import {
  ExternalLinkIcon,
  FolderTreeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PackageIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/admin/actions";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/store/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AdminErrorBoundary } from "./admin-error-boundary";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/categories", label: "Categories", icon: FolderTreeIcon },
  { href: "/admin/enquiries", label: "Enquiries", icon: InboxIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <span className="font-display text-lg font-semibold md:hidden">Sagacious Admin</span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              View store <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <AdminErrorBoundary>{children}</AdminErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpenMobile(false)}>
          <LogoMark className="size-9" />
          <span className="leading-tight">
            <span className="block font-display text-xl font-semibold">Sagacious</span>
            <span className="block text-[0.6rem] tracking-[0.28em] text-muted-foreground uppercase">
              Atelier admin
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  "exact" in item && item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      size="lg"
                      render={<Link href={item.href} onClick={() => setOpenMobile(false)} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" target="_blank" />}>
              <ExternalLinkIcon />
              <span>View store</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOutAction}>
              <SidebarMenuButton type="submit">
                <LogOutIcon />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
