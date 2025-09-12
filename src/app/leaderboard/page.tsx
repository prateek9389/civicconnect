
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Award } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query } from "firebase/firestore";

interface UserStats {
  uid: string;
  issueCount: number;
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  state?: string;
  district?: string;
  issueCount: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // 1. Get all profiled issues
        const issuesSnapshot = await getDocs(query(collection(db, "profiledIssues")));
        
        // 2. Count issues per user
        const userIssueCounts = issuesSnapshot.docs.reduce((acc, doc) => {
          const reporterId = doc.data().reporterId;
          if (reporterId) {
            acc[reporterId] = (acc[reporterId] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const userIds = Object.keys(userIssueCounts);
        if (userIds.length === 0) {
          setLeaderboard([]);
          setIsLoading(false);
          return;
        }

        // 3. Fetch user profiles for those users individually
        const profiles: UserProfile[] = [];
        for (const userId of userIds) {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if(userSnap.exists()) {
                const userData = userSnap.data();
                profiles.push({
                    uid: userId,
                    displayName: userData.displayName || 'N/A',
                    email: userData.email,
                    photoURL: userData.photoURL,
                    state: userData.state,
                    district: userData.district,
                    issueCount: userIssueCounts[userId] || 0,
                });
            }
        }

        // 4. Sort by issue count descending
        profiles.sort((a, b) => b.issueCount - a.issueCount);

        setLeaderboard(profiles);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);
  
  const getMedal = (index: number) => {
    if (index === 0) return <Award className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Award className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-yellow-700" />;
    return <span className="text-lg font-bold w-6 text-center">{index + 1}</span>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                    Community Leaders
                    </CardTitle>
                    <CardDescription className="mt-4 text-lg text-muted-foreground">
                    Recognizing the most active citizens in our community.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : leaderboard.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="w-16">Rank</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Issues Reported</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard.map((user, index) => (
                                <TableRow key={user.uid}>
                                    <TableCell className="font-medium">{getMedal(index)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                            <AvatarImage src={user.photoURL} />
                                            <AvatarFallback>
                                                {user.displayName?.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.displayName}</div>
                                                <div className="text-sm text-muted-foreground hidden md:block">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.district}, {user.state}</TableCell>
                                    <TableCell className="text-right font-bold text-lg">{user.issueCount}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center py-12 text-muted-foreground">
                            <p>No user data available yet. Start reporting issues to appear on the leaderboard!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
