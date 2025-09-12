
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Home,
  LineChart,
  Package,
  PanelLeft,
  Users2,
  Bell,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "../theme-toggle";
import { states } from "@/lib/india-states-districts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface AdminInfo {
  name: string;
  district: string;
  email: string;
}

interface AdminHeaderProps {
  userRole: string;
  adminInfo: AdminInfo | null;
  onLocationChange: (location: { state?: string; district?: string }) => void;
}


export function AdminHeader({ userRole, adminInfo, onLocationChange }: AdminHeaderProps) {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");


  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('adminInfo');
    router.push('/admin');
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const stateData = states.find(s => s.state === stateName);
    const newDistricts = stateData ? stateData.districts : [];
    setDistricts(newDistricts);
    setSelectedDistrict(""); // Reset district
    onLocationChange({ state: stateName === 'all' ? undefined : stateName });
  };
  
  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    onLocationChange({
        state: selectedState,
        district: districtName === 'all' ? undefined : districtName
    });
  };

  const adminNavLinks = [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { href: "/admin/dashboard/manage-issues", icon: Package, label: "Manage Issues" },
    { href: "/admin/dashboard/users", icon: Users2, label: "Users" },
    { href: "/admin/dashboard/notifications", icon: Bell, label: "Notifications" },
    { href: "/admin/dashboard/reports", icon: LineChart, label: "Reports" }
  ];

  const superAdminNavLinks = [
    ...adminNavLinks,
    { href: "/admin/dashboard/approve-admins", icon: UserCheck, label: "Approve Admins" },
  ];

  const navLinks = userRole === 'superadmin' ? superAdminNavLinks : adminNavLinks;


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/admin/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Building2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">CivicConnect Admin</span>
            </Link>
            {navLinks.map(link => (
                 <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="hidden md:block">
        <h1 className="font-semibold text-lg">
          {userRole === 'superadmin' ? 'Super Admin Dashboard' : `${adminInfo?.district || ''} District Dashboard`}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
          {userRole === 'superadmin' && (
             <div className="flex gap-2">
                <Select onValueChange={handleStateChange} value={selectedState}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">All States</SelectItem>
                            {states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                 <Select onValueChange={handleDistrictChange} value={selectedDistrict} disabled={!selectedState || selectedState === 'all'}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                             <SelectItem value="all">All Districts</SelectItem>
                            {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select>
             </div>
          )}
          <ThemeToggle />
      </div>
    </header>
  );
}

    