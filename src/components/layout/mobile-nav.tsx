"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Search, Bookmark, User, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/explore", icon: Search, label: "Explore" },
  { href: "/chats", icon: MessageSquare, label: "Chats" },
  { href: "/report-issue", icon: Plus, label: "Report" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 p-2 backdrop-blur-sm md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
            <Link href={item.href} key={item.label} className="flex flex-col items-center justify-center">
                <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                    "relative flex h-16 w-16 flex-col items-center justify-center rounded-2xl transition-colors",
                    isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
                >
                {item.label === "Report" ? (
                    <div className="absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <item.icon size={28} strokeWidth={2.5} />
                    </div>
                ) : (
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                )}

                {item.label !== "Report" && (
                    <span className="mt-1 text-xs">{item.label}</span>
                )}
                
                {item.label === 'Chats' && (
                    <span className="absolute top-3 right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                )}
                </motion.div>
            </Link>
            )
        })}
      </div>
    </nav>
  );
}
