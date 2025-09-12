
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Menu, Bell, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "../theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProfileDialog } from "../profile-dialog";
import { LanguageSwitcher } from "../language-switcher";
import { useTranslation } from "@/hooks/use-translation";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
      { href: "/explore", label: t('explore') },
      { href: "/report-issue", label: t('report_issue') },
      { href: "/leaderboard", label: t('leaderboard') },
      { href: "/about", label: t('about') },
      { href: "/admin", label: t('admin') },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex h-20 items-center transition-all duration-300",
          scrolled
            ? "border-b bg-background/80 backdrop-blur-sm"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-primary" />
              <span className="font-headline text-2xl font-bold">CivicConnect</span>
          </Link>
          
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map(link => (
                 <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            {user && (
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell />
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="sr-only">Notifications</span>
                </Button>
              </Link>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem onSelect={() => setProfileDialogOpen(true)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost"><Link href="/login">Log In</Link></Button>
                <Button asChild><Link href="/signup">Sign Up</Link></Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 p-6">
                  <nav className="flex flex-col gap-4">
                      {navLinks.map(link => (
                          <Link key={link.href} href={link.href} className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
                      ))}
                      {user && <Link href="/notifications" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Notifications</Link>}
                  </nav>
                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Language</span>
                        <LanguageSwitcher />
                    </div>
                    {user ? (
                        <Button onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</Button>
                    ) : (
                      <>
                        <Button asChild variant="ghost"><Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link></Button>
                        <Button asChild><Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link></Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      {user && <ProfileDialog isOpen={profileDialogOpen} onOpenChange={setProfileDialogOpen} user={user} />}
    </>
  );
}
