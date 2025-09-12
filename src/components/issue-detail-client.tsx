
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown, MapPin, Share2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, runTransaction, getDoc, DocumentData, setDoc, deleteDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export interface Issue {
  id: string;
  reporterId?: string;
  reporterName?: string;
  avatarUrl?: string | null;
  createdAt: string; 
  imageUrls: string[];
  title: string;
  district: string;
  category: string;
  status: "Pending" | "Confirmation" | "Acknowledgment" | "Resolution";
  description: string;
  address: string;
  votes?: number;
}


type IssueStatus = "Pending" | "Confirmation" | "Acknowledgment" | "Resolution";
const statuses: IssueStatus[] = ["Pending", "Confirmation", "Acknowledgment", "Resolution"];
const statusGradients: Record<IssueStatus, string> = {
  Pending: "from-gray-400 to-gray-500",
  Confirmation: "from-yellow-400 to-orange-500",
  Acknowledgment: "from-blue-400 to-indigo-500",
  Resolution: "from-teal-400 to-green-500",
};
const statusIndex = (status: IssueStatus) => statuses.indexOf(status);


export function IssueDetailClient({ issue }: { issue: Issue }) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [voteCount, setVoteCount] = useState(issue.votes || 0);
    const [voted, setVoted] = useState<"up" | "down" | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [displayDate, setDisplayDate] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setDisplayDate(new Date(issue.createdAt).toLocaleDateString());

        const checkUserStatus = async () => {
            if (user) {
                // Check vote status
                const collectionsToTry = ['profiledIssues', 'anonymousIssues'];
                for (const coll of collectionsToTry) {
                    const voteRef = doc(db, coll, issue.id, "votes", user.uid);
                    const voteSnap = await getDoc(voteRef);
                    if (voteSnap.exists()) {
                        setVoted(voteSnap.data().direction);
                        break;
                    }
                }
                 // Check saved status
                const savedIssueRef = doc(db, "users", user.uid, "savedIssues", issue.id);
                const savedIssueSnap = await getDoc(savedIssueRef);
                setIsSaved(savedIssueSnap.exists());
            }
        };
        checkUserStatus();
      }, [issue.id, user, issue.createdAt]);

    const handleVote = async (direction: "up" | "down") => {
        if (!user) {
            toast({
                title: "Login Required",
                description: "You must be logged in to vote.",
                variant: "destructive"
            });
            router.push("/login");
            return;
        }

        if (isVoting) return;
        setIsVoting(true);

        const collectionsToTry = ['profiledIssues', 'anonymousIssues'];
        let issueRef;
        let issueDoc: DocumentData | null = null;
        let collectionName = '';

        for (const coll of collectionsToTry) {
            const ref = doc(db, coll, issue.id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                issueRef = ref;
                issueDoc = snap;
                collectionName = coll;
                break;
            }
        }
        
        if (!issueRef || !issueDoc) {
            toast({ title: "Error", description: "Issue not found.", variant: "destructive"});
            setIsVoting(false);
            return;
        }
  
        const voteRef = doc(db, collectionName, issue.id, "votes", user.uid);
  
        try {
            await runTransaction(db, async (transaction) => {
                const voteSnap = await transaction.get(voteRef);
                const issueSnap = await transaction.get(issueRef!);
                
                if (!issueSnap.exists()) {
                    throw "Issue does not exist!";
                }
  
                let newVoteCount = issueSnap.data().votes || 0;
                const currentVote = voteSnap.data()?.direction;
  
                if (voteSnap.exists() && currentVote === direction) { 
                    newVoteCount += (direction === 'up' ? -1 : 1);
                    transaction.delete(voteRef);
                    setVoted(null);
                } else {
                    if (currentVote === 'up') newVoteCount -= 1;
                    if (currentVote === 'down') newVoteCount += 1;
                    newVoteCount += (direction === 'up' ? 1 : -1);
                    transaction.set(voteRef, { direction });
                    setVoted(direction);
                }
                
                transaction.update(issueRef!, { votes: newVoteCount });
                setVoteCount(newVoteCount);
            });
             // Send notification to issue reporter
            const issueData = issueDoc.data();
            if (issueData.reporterId && issueData.reporterId !== user.uid) {
                const notificationRef = collection(db, "users", issueData.reporterId, "notifications");
                await addDoc(notificationRef, {
                    issueId: issue.id,
                    message: `${user.displayName || 'Someone'} ${direction === 'up' ? 'upvoted' : 'downvoted'} your issue: "${issue.title}"`,
                    type: 'vote',
                    read: false,
                    createdAt: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error("Vote transaction failed: ", error);
            toast({ title: "Error", description: "Your vote could not be recorded. Please try again.", variant: "destructive"});
        } finally {
            setIsVoting(false);
        }
    };
    
     const handleSave = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "You must be logged in to save issues." });
            router.push("/login");
            return;
        }
        if (isSaving) return;
        setIsSaving(true);
        const savedIssueRef = doc(db, "users", user.uid, "savedIssues", issue.id);

        try {
            if (isSaved) {
                await deleteDoc(savedIssueRef);
                setIsSaved(false);
                toast({ title: "Unsaved", description: `"${issue.title}" removed from your saved issues.`});
            } else {
                await setDoc(savedIssueRef, {
                    title: issue.title,
                    imageUrl: issue.imageUrls?.[0] || 'https://picsum.photos/400/300',
                    createdAt: new Date(),
                });
                setIsSaved(true);
                toast({ title: "Saved!", description: `"${issue.title}" added to your saved issues.`});
            }
        } catch (error) {
            console.error("Save/unsave failed:", error);
            toast({ title: "Error", description: "Could not update saved status. Please try again.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `CivicConnect: ${issue.title}`,
                    text: `Check out this issue on CivicConnect: ${issue.description}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not share the issue at this time.',
                });
            }
        } else {
            // Fallback for browsers that don't support the Web Share API
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: 'Link Copied',
                description: 'Issue link copied to your clipboard.',
            });
        }
    };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <Carousel className="w-full">
                <CarouselContent>
                    {issue.imageUrls.map((src, index) => (
                    <CarouselItem key={index}>
                        <Card className="overflow-hidden border-0 shadow-none">
                            <CardContent className="p-0">
                                <div className="aspect-video relative">
                                <Image
                                    src={src}
                                    alt={`${issue.title} - image ${index + 1}`}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </Carousel>
        </div>

        <div className="lg:col-span-2">
            <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-lg flex flex-col h-full">
                <div className="flex justify-between items-start">
                     <Badge variant="secondary" className="bg-background/70 backdrop-blur-sm shrink-0 mb-2">
                        <MapPin className="mr-1.5 h-3 w-3" />
                        {issue.district}
                    </Badge>
                     <Badge variant="outline">{issue.category}</Badge>
                </div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">{issue.title}</h1>
                
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            {issue.avatarUrl && <AvatarImage src={issue.avatarUrl} alt={issue.reporterName} />}
                            <AvatarFallback>
                            {issue.reporterName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "A"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{issue.reporterName || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground">{displayDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Button size="icon" variant="ghost" className={cn("rounded-full", voted === 'up' && "bg-green-100 dark:bg-green-900/50")} onClick={() => handleVote('up')} disabled={isVoting}>
                            <ArrowUp className="text-green-500" />
                        </Button>
                        <span className="text-lg font-bold text-foreground">{voteCount}</span>
                         <Button size="icon" variant="ghost" className={cn("rounded-full", voted === 'down' && "bg-red-100 dark:bg-red-900/50")} onClick={() => handleVote('down')} disabled={isVoting}>
                            <ArrowDown className="text-red-500"/>
                        </Button>
                    </div>
                </div>

                <Separator className="my-6" />

                <div>
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <p className="text-muted-foreground">{issue.description}</p>
                </div>
                
                <Separator className="my-6" />

                 <div>
                    <h2 className="text-lg font-semibold mb-2">Location</h2>
                    <p className="text-muted-foreground">{issue.address}</p>
                </div>

                <Separator className="my-6" />

                <div>
                     <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold">Status</h2>
                        <span className="text-sm font-bold text-foreground">
                            {issue.status}
                        </span>
                    </div>
                    <div className="relative h-1 w-full bg-secondary rounded-full">
                        <motion.div
                            className={cn(
                                "h-1 rounded-full bg-gradient-to-r",
                                statusGradients[issue.status]
                            )}
                            initial={{ width: '0%' }}
                            animate={{ width: `${(statusIndex(issue.status) / (statuses.length - 1)) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button variant="outline" className="w-full" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                        <Button variant="outline" className="w-full" onClick={handleSave} disabled={isSaving}>
                            <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-primary text-primary")} /> 
                            {isSaved ? 'Saved' : 'Save'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
