
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Building2,
  Home,
  LineChart,
  Package,
  LogOut,
  Users2,
  Bell,
  UserCheck,
  MoreHorizontal,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface AdminInfo {
  name: string;
  district: string;
  email: string;
}

export function AdminSidebar({ userRole, adminInfo }: { userRole: string; adminInfo: AdminInfo | null }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('adminInfo');
        router.push('/admin');
    };

    const navItems = [
        { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
        { href: "/admin/dashboard/manage-issues", icon: Package, label: "Manage Issues" },
        { href: "/admin/dashboard/users", icon: Users2, label: "Users" },
        { href: "/admin/dashboard/notifications", icon: Bell, label: "Notifications" },
    ];

    const shortcutItems = [
        { href: "/admin/dashboard/reports", icon: LineChart, label: "Reports" },
        ...(userRole === 'superadmin' ? [{ href: "/admin/dashboard/approve-admins", icon: UserCheck, label: "Approve Admins" }] : []),
        { href: "#", icon: Settings, label: "Settings" }
    ]


  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r bg-sidebar text-sidebar-foreground sm:flex">
      <div className="flex flex-col h-full">
        <div className="p-4">
            <Link
            href="/admin/dashboard"
            className="group mb-4 flex items-center gap-2"
            >
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">
                CivicConnect
            </span>
            </Link>
        </div>
        
        <nav className="flex-1 space-y-2 px-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive 
                        ? "bg-sidebar-hover text-sidebar-active-foreground" 
                        : "hover:bg-sidebar-hover hover:text-sidebar-hover-foreground"
                    )}
                >
                    <item.icon className={cn("h-4 w-4", isActive && "text-sidebar-active")} />
                    <span className="flex-1">{item.label}</span>
                </Link>
                )
            })}
        </nav>

        <div className="px-4 mt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Shortcuts</h3>
             <nav className="space-y-2">
                {shortcutItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                            isActive 
                            ? "bg-sidebar-hover text-sidebar-active-foreground" 
                            : "hover:bg-sidebar-hover hover:text-sidebar-hover-foreground"
                        )}
                    >
                        <item.icon className={cn("h-4 w-4", isActive && "text-sidebar-active")} />
                        <span>{item.label}</span>
                    </Link>
                    )
                })}
            </nav>
        </div>
        
        <div className="mt-auto border-t p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/id/1027/48/48" />
                        <AvatarFallback>{adminInfo?.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{adminInfo?.name || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground">{adminInfo?.district || 'District'}</p>
                    </div>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                          <LogOut className="mr-2 h-4 w-4"/>
                          Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
            </div>
        </div>
      </div>
    </aside>
  );
}
