
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getFirestore, collection, getDocs, Timestamp, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  id: string;
  title: string;
  reporterName?: string;
  category: string;
  status: string;
  createdAt: Timestamp;
  imageUrls: string[];
}

interface AdminInfo {
    district: string;
    state: string;
}

interface SelectedLocation {
    state?: string;
    district?: string;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Pending: "destructive",
  Confirmation: "secondary",
  Acknowledgment: "outline",
  Resolution: "default",
};

export default function ManageIssuesPage({ selectedLocation }: { selectedLocation?: SelectedLocation }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const db = getFirestore(app);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    const info = sessionStorage.getItem('adminInfo');
    setUserRole(role);
    if (info) {
      setAdminInfo(JSON.parse(info));
    }
  }, []);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!userRole) return; 

      setIsLoading(true);
      try {
        let locationFilter: SelectedLocation = {};
        if (userRole === 'admin' && adminInfo) {
            locationFilter = { state: adminInfo.state, district: adminInfo.district };
        } else if (userRole === 'superadmin' && selectedLocation) {
            locationFilter = selectedLocation;
        }

        const collectionsToQuery = ["anonymousIssues", "profiledIssues"];
        let allIssues: Issue[] = [];

        for (const coll of collectionsToQuery) {
            let issuesQuery = query(collection(db, coll));
            
             if (locationFilter.state) {
                issuesQuery = query(issuesQuery, where("state", "==", locationFilter.state));
             }
             if (locationFilter.district) {
               issuesQuery = query(issuesQuery, where("district", "==", locationFilter.district));
             }

            const querySnapshot = await getDocs(issuesQuery);
            const issuesData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Issue));
            allIssues = [...allIssues, ...issuesData];
        }
        
        allIssues.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

        setIssues(allIssues);
      } catch (error) {
        console.error("Error fetching issues: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch issues.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch immediately if admin/superadmin info is available.
    if (userRole === 'superadmin' || (userRole === 'admin' && adminInfo)) {
        fetchIssues();
    } else if (userRole) { // If role is known but info isn't yet, it might be loading, so don't show "no issues"
        setIsLoading(false);
    }
  }, [db, toast, userRole, adminInfo, selectedLocation]);

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manage Issues</CardTitle>
          <CardDescription>
            Review, update, and resolve reported civic issues.
          </CardDescription>
        </CardHeader>
      </Card>
      {isLoading ? (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : issues.length === 0 ? (
        <p className="text-center text-muted-foreground">No issues found for the selected location.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
            <Card key={issue.id} className="flex flex-col overflow-hidden">
                <Link href={`/admin/dashboard/manage-issues/${issue.id}`} className="block hover:opacity-90 transition-opacity">
                <div className="relative aspect-video">
                    <Image 
                    src={issue.imageUrls?.[0] || "https://picsum.photos/800/600"}
                    alt={issue.title}
                    fill
                    className="object-cover"
                    />
                </div>
                </Link>
                <CardHeader>
                <div className="flex justify-between items-start">
                    <Link href={`/admin/dashboard/manage-issues/${issue.id}`} className="block">
                        <CardTitle className="text-lg hover:underline">{issue.title}</CardTitle>
                    </Link>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/manage-issues/${issue.id}`} className="w-full h-full">
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                        Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardDescription>ID: {issue.id}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Reporter</p>
                    <p className="text-sm">{issue.reporterName || 'Anonymous'}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm">{issue.category || 'General'}</p>
                </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Badge variant={statusVariant[issue.status] || 'secondary'}>{issue.status}</Badge>
                    <p className="text-sm text-muted-foreground">{issue.createdAt.toDate().toLocaleDateString()}</p>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}

    