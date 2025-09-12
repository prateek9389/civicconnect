
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ListChecks, UserCheck, Users, Loader2 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getCountFromServer, getDocs } from 'firebase/firestore';


const chartData = [
    { month: "January", issues: 186 },
    { month: "February", issues: 305 },
    { month: "March", issues: 237 },
    { month: "April", issues: 273 },
    { month: "May", issues: 209 },
    { month: "June", issues: 214 },
];
const chartConfig = {
    issues: {
      label: "Issues",
      color: "hsl(var(--primary))",
    },
};

interface DashboardStats {
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    pendingApprovals: number;
}
interface SelectedLocation {
    state?: string;
    district?: string;
}

export default function AdminDashboardPage({ selectedLocation }: { selectedLocation?: SelectedLocation }) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    const info = sessionStorage.getItem('adminInfo');
    setUserRole(role);
    if(info) {
        setAdminInfo(JSON.parse(info));
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
        setIsLoading(true);
        
        let locationFilter: SelectedLocation = {};
        if (userRole === 'admin' && adminInfo) {
            locationFilter = { state: adminInfo.state, district: adminInfo.district };
        } else if (userRole === 'superadmin' && selectedLocation) {
            locationFilter = selectedLocation;
        }

        const collections = ["anonymousIssues", "profiledIssues"];
        let totalIssues = 0;
        let resolvedIssues = 0;
        let pendingIssues = 0;

        for (const coll of collections) {
            let q = query(collection(db, coll));
            if (locationFilter.state) {
                q = query(q, where('state', '==', locationFilter.state));
            }
            if (locationFilter.district) {
                q = query(q, where('district', '==', locationFilter.district));
            }

            const totalSnapshot = await getCountFromServer(q);
            totalIssues += totalSnapshot.data().count;

            const resolvedQuery = query(q, where('status', '==', 'Resolution'));
            const resolvedSnapshot = await getCountFromServer(resolvedQuery);
            resolvedIssues += resolvedSnapshot.data().count;
            
            const pendingQuery = query(q, where('status', 'in', ['Pending', 'Confirmation', 'Acknowledgment']));
            const pendingSnapshot = await getCountFromServer(pendingQuery);
            pendingIssues += pendingSnapshot.data().count;
        }
        
        let pendingApprovals = 0;
        if (userRole === 'superadmin') {
            const approvalQuery = query(collection(db, 'admins'), where('status', '==', 'pending'));
            const approvalSnapshot = await getCountFromServer(approvalQuery);
            pendingApprovals = approvalSnapshot.data().count;
        }

        setStats({ totalIssues, resolvedIssues, pendingIssues, pendingApprovals });
        setIsLoading(false);
    };

    if (userRole) {
        fetchStats();
    }
  }, [userRole, adminInfo, selectedLocation]);

  if (isLoading || !stats) {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }
  
  return (
     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {userRole === 'superadmin' && (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                     <Link href="/admin/dashboard/approve-admins">
                        <Button variant="link" className="p-0 h-auto text-xs">View applications</Button>
                    </Link>
                </CardContent>
            </Card>
        )}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalIssues}</div>
                <p className="text-xs text-muted-foreground">in selected area</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.resolvedIssues}</div>
                <p className="text-xs text-muted-foreground">
                    {stats.totalIssues > 0 ? `${((stats.resolvedIssues / stats.totalIssues) * 100).toFixed(0)}% resolution rate` : 'No issues yet'}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.pendingIssues}</div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
        </Card>
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Issues Reported Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <RechartsBarChart accessibilityLayer data={chartData}>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="issues" fill="var(--color-issues)" radius={4} />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}

    