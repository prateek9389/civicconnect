
"use client";

import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Bookmark, LogOut, Settings, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

type ProfileDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
};

interface ReportedIssue {
  id: string;
  title: string;
  imageUrls: string[];
  createdAt: any;
}

interface SavedIssue {
  id: string;
  title: string;
  imageUrl: string;
}

export function ProfileDialog({ isOpen, onOpenChange, user }: ProfileDialogProps) {
  const { logout } = useAuth();
  const [reportedIssues, setReportedIssues] = useState<ReportedIssue[]>([]);
  const [savedIssues, setSavedIssues] = useState<SavedIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user && isOpen) {
        setIsLoading(true);
        // Fetch reported issues
        const q = query(collection(db, "profiledIssues"), where("reporterId", "==", user.uid));
        const reportedSnapshot = await getDocs(q);
        const reportedData = reportedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportedIssue));
        setReportedIssues(reportedData);

        // Fetch saved issues
        const savedIssuesQuery = collection(db, "users", user.uid, "savedIssues");
        const savedIssuesSnapshot = await getDocs(savedIssuesQuery);
        const savedData = savedIssuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedIssue));
        setSavedIssues(savedData);
        
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-0">
            <div className="flex items-center space-x-4">
                 <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback className="text-2xl">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <DialogTitle className="text-xl">{user.displayName}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                 <Button variant="ghost" size="icon"><Settings className="h-5 w-5"/></Button>
            </div>
             <div className="flex justify-around text-center pt-4">
                <div>
                    <p className="text-xl font-bold">{reportedIssues.length}</p>
                    <p className="text-xs text-muted-foreground">Reported</p>
                </div>
                <div>
                    <p className="text-xl font-bold">{savedIssues.length}</p>
                    <p className="text-xs text-muted-foreground">Saved</p>
                </div>
            </div>
        </DialogHeader>
        
        <Tabs defaultValue="my-issues" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none">
                <TabsTrigger value="my-issues" className="rounded-none"><FileText className="mr-2 h-4 w-4"/> My Issues</TabsTrigger>
                <TabsTrigger value="saved-issues" className="rounded-none"><Bookmark className="mr-2 h-4 w-4"/> Saved</TabsTrigger>
            </TabsList>
            <div className="p-6 max-h-[40vh] overflow-y-auto">
            {isLoading ? <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin" /></div> : <>
                <TabsContent value="my-issues" className="m-0">
                    {reportedIssues.length > 0 ? (
                        <div className="space-y-4">
                            {reportedIssues.map(issue => (
                                <Link key={issue.id} href={`/issue/${issue.id}`} onClick={() => onOpenChange(false)}>
                                    <div className="flex items-center gap-4 hover:bg-accent p-2 rounded-md">
                                        <Image src={issue.imageUrls?.[0] || "https://picsum.photos/100"} alt={issue.title} width={64} height={64} className="rounded-md object-cover aspect-square" />
                                        <div className="flex-1">
                                            <p className="font-semibold truncate">{issue.title}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(issue.createdAt.seconds * 1000).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <p className="text-center text-muted-foreground text-sm">No reported issues found.</p>}
                </TabsContent>
                <TabsContent value="saved-issues" className="m-0">
                     {savedIssues.length > 0 ? (
                        <div className="space-y-4">
                            {savedIssues.map(issue => (
                                <Link key={issue.id} href={`/issue/${issue.id}`} onClick={() => onOpenChange(false)}>
                                    <div className="flex items-center gap-4 hover:bg-accent p-2 rounded-md">
                                        <Image src={issue.imageUrl || "https://picsum.photos/100"} alt={issue.title} width={64} height={64} className="rounded-md object-cover aspect-square" />
                                        <div className="flex-1">
                                            <p className="font-semibold truncate">{issue.title}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <p className="text-center text-muted-foreground text-sm">No saved issues found.</p>}
                </TabsContent>
             </>}
            </div>
        </Tabs>

        <Separator />
        <div className="p-4">
             <Button variant="outline" className="w-full" onClick={() => { logout(); onOpenChange(false); }}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
