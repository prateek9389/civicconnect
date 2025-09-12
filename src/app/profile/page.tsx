
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Loader2, FileText, Bookmark, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import type { Issue } from "@/components/issue-card";

interface SavedIssue {
    id: string;
    title: string;
    imageUrl: string;
}

function ProfileContent() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [reportedIssues, setReportedIssues] = useState<Issue[]>([]);
  const [savedIssues, setSavedIssues] = useState<SavedIssue[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        setIsLoadingContent(true);
        // Fetch reported issues
        const q = query(collection(db, "profiledIssues"), where("reporterId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const issuesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Issue));
        setReportedIssues(issuesData);

        // Fetch saved issues
        const savedIssuesQuery = collection(db, "users", user.uid, "savedIssues");
        const savedIssuesSnapshot = await getDocs(savedIssuesQuery);
        const savedData = savedIssuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedIssue));
        setSavedIssues(savedData);

        setIsLoadingContent(false);
      }
    };
    fetchProfileData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                            <AvatarFallback className="text-3xl">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">{user.displayName}</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                         <div className="flex space-x-4">
                            <Button variant="outline" onClick={logout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
                            <Button><Settings className="mr-2 h-4 w-4" /> Edit Profile</Button>
                        </div>
                    </div>
                    <Separator className="my-6" />
                    <div className="flex justify-around text-center">
                        <div>
                            <p className="text-2xl font-bold">{reportedIssues.length}</p>
                            <p className="text-muted-foreground">Issues Reported</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold">{savedIssues.length}</p>
                            <p className="text-muted-foreground">Issues Saved</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Tabs defaultValue="my-issues" className="mt-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="my-issues"><FileText className="mr-2 h-4 w-4"/> My Issues</TabsTrigger>
                    <TabsTrigger value="saved-issues"><Bookmark className="mr-2 h-4 w-4"/> Saved Issues</TabsTrigger>
                </TabsList>
                <TabsContent value="my-issues">
                    <Card>
                        <CardHeader><CardTitle>My Reported Issues</CardTitle></CardHeader>
                        <CardContent>
                            {isLoadingContent ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : (
                                reportedIssues.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {reportedIssues.map(issue => (
                                             <Link key={issue.id} href={`/issue/${issue.id}`} className="group">
                                                <Card className="overflow-hidden h-full">
                                                    <div className="relative aspect-video">
                                                        <Image src={issue.imageUrls?.[0] || 'https://picsum.photos/400/300'} alt={issue.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <h3 className="font-semibold truncate group-hover:text-primary">{issue.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{new Date(issue.createdAt as any).toLocaleDateString()}</p>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                ) : <p className="text-center text-muted-foreground">You haven't reported any issues yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="saved-issues">
                     <Card>
                        <CardHeader><CardTitle>My Saved Issues</CardTitle></CardHeader>
                        <CardContent>
                             {isLoadingContent ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : (
                                savedIssues.length > 0 ? (
                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {savedIssues.map(issue => (
                                           <Link key={issue.id} href={`/issue/${issue.id}`} className="group">
                                                <Card className="overflow-hidden h-full">
                                                    <div className="relative aspect-video">
                                                        <Image src={issue.imageUrl || 'https://picsum.photos/400/300'} alt={issue.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <h3 className="font-semibold truncate group-hover:text-primary">{issue.title}</h3>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                ) : <p className="text-center text-muted-foreground">You haven't saved any issues yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default function ProfilePage() {
    return <ProfileContent />
}
