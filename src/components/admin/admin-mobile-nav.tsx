
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Users, Bell, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/dashboard/manage-issues", icon: Package, label: "Issues" },
  { href: "/admin/dashboard/users", icon: Users, label: "Users" },
  { href: "/admin/dashboard/notifications", icon: Bell, label: "Alerts" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 p-2 backdrop-blur-sm sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
            <Link href={item.href} key={item.label} className="relative flex flex-col items-center justify-center">
                <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                    "relative flex h-16 w-full flex-col items-center justify-center rounded-2xl transition-colors",
                    isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
                >
                
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="mt-1 text-xs font-medium">{item.label}</span>

                </motion.div>
            </Link>
            )
        })}
      </div>
    </nav>
  );
}
