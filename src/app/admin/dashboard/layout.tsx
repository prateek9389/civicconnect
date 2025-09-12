
"use client";

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/toaster";

interface AdminInfo {
  name: string;
  district: string;
  email: string;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // State for super admin's location filter
  const [selectedLocation, setSelectedLocation] = useState<{state?: string, district?: string}>({});

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    const storedAdminInfo = sessionStorage.getItem('adminInfo');
    
    if (!userRole) {
      router.push('/admin');
    } else {
      setRole(userRole);
      if (storedAdminInfo) {
        setAdminInfo(JSON.parse(storedAdminInfo));
      }
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
  }
  
  // Pass down the state and setter to children that need it
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { selectedLocation });
    }
    return child;
  });

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {role && <AdminSidebar userRole={role} adminInfo={adminInfo} />}
      <div className="flex flex-col flex-1 sm:ml-56">
        {role && <AdminHeader 
                    userRole={role} 
                    adminInfo={adminInfo} 
                    onLocationChange={setSelectedLocation} 
                  />}
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8 pb-24 sm:pb-6">
          {childrenWithProps}
        </main>
      </div>
       <AdminMobileNav />
       <Toaster />
    </div>
  );
}

    