
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, MapPin, CheckCircle2, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, runTransaction, getDoc, DocumentData, setDoc, deleteDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

type IssueStatus = "Pending" | "Confirmation" | "Acknowledgment" | "Resolution";

export type Issue = {
  id: string;
  reporter: string;
  reporterId?: string;
  avatarUrl: string | null;
  time: string;
  imageUrl: string;
  title: string;
  district: string;
  category: string;
  status: IssueStatus;
  description: string;
  aiHint: string;
  createdAt: string;
  address: string;
  votes?: number;
};

type IssueCardProps = {
  issue: Issue;
};

const statuses: IssueStatus[] = ["Pending", "Confirmation", "Acknowledgment", "Resolution"];
const statusLabels: Record<IssueStatus, string> = {
  Pending: "Pending",
  Confirmation: "Confir...",
  Acknowledgment: "Acknowled...",
  Resolution: "Resolved",
};
const statusIndex = (status: IssueStatus) => statuses.indexOf(status);

const statusGradients: Record<IssueStatus, string> = {
  Pending: "from-gray-400 to-gray-500",
  Confirmation: "from-yellow-400 to-orange-500",
  Acknowledgment: "from-blue-400 to-indigo-500",
  Resolution: "from-teal-400 to-green-500",
};


export function IssueCard({ issue }: IssueCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [voteCount, setVoteCount] = useState(issue.votes || 0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayDate, setDisplayDate] = useState("");

  useEffect(() => {
    setDisplayDate(new Date(issue.createdAt).toLocaleDateString());

    const checkUserVoteAndSaveStatus = async () => {
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
    checkUserVoteAndSaveStatus();
  }, [issue.createdAt, issue.id, user]);
  
  const handleVote = async (e: React.MouseEvent, direction: "up" | "down") => {
      e.stopPropagation();
      e.preventDefault();
      
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
                  transaction.set(voteRef, { direction, userId: user.uid });
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

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
                imageUrl: issue.imageUrl,
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


  return (
    <Link href={`/issue/${issue.id}`} passHref>
      <motion.div
        initial={{ boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)' }}
        whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group relative overflow-hidden rounded-2xl border border-white/20 bg-card/50 text-card-foreground backdrop-blur-lg flex flex-col h-full"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={issue.imageUrl}
            alt={issue.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={issue.aiHint}
          />
           <Button 
              size="icon" 
              variant="secondary" 
              className="absolute top-3 right-3 rounded-full h-10 w-10"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Bookmark className={cn("h-5 w-5 transition-colors", isSaved && "fill-primary text-primary")} />
          </Button>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-semibold tracking-tight truncate">{issue.title}</h3>
              <Badge variant="secondary" className="bg-background/70 backdrop-blur-sm shrink-0">
                  <MapPin className="mr-1.5 h-3 w-3" />
                  {issue.district}
              </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{issue.address}</p>
          <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                      {issue.avatarUrl && <AvatarImage src={issue.avatarUrl} alt={issue.reporter} />}
                      <AvatarFallback>
                      {issue.reporter
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "A"}
                      </AvatarFallback>
                  </Avatar>
                  <div>
                      <p className="font-semibold">{issue.reporter}</p>
                      <p className="text-xs text-muted-foreground">{displayDate}</p>
                  </div>
              </div>
              <div className="flex items-center gap-1">
                  <button 
                      onClick={(e) => handleVote(e, 'up')}
                      disabled={isVoting}
                      className={cn(
                          "rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent",
                          voted === "up" ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" : "hover:text-green-500"
                      )}>
                      <ArrowUp size={20} />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{voteCount}</span>
                  <button 
                      onClick={(e) => handleVote(e, 'down')}
                      disabled={isVoting}
                      className={cn(
                          "rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent",
                          voted === "down" ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" : "hover:text-red-500"
                      )}>
                      <ArrowDown size={20} />
                  </button>
              </div>
          </div>
        </div>
        <div className="px-4 pb-4 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Status
            </span>
            <span className="text-xs font-bold text-foreground">
              {issue.status}
            </span>
          </div>
          <div className="relative flex items-center w-full">
              <div className="absolute h-1 w-full bg-secondary rounded-full">
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
              <div className="relative w-full flex justify-between items-center">
                  {statuses.map((status, index) => (
                      <div key={status} className="flex flex-col items-center">
                        <motion.div
                              className={cn(
                                  "h-3 w-3 rounded-full bg-secondary border-2 border-secondary transition-colors duration-500",
                                  statusIndex(issue.status) >= index && "bg-gradient-to-br border-transparent",
                                  statusIndex(issue.status) >= index && statusGradients[statuses[index]]
                              )}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 + index * 0.1 }}
                          >
                              {statusIndex(issue.status) >= index && (
                                  <motion.div initial={{scale:0}} animate={{scale:1}} className="text-white flex items-center justify-center h-full w-full">
                                      <CheckCircle2 size={10} className="text-primary-foreground opacity-75"/>
                                  </motion.div>
                              )}
                          </motion.div>
                      </div>
                  ))}
              </div>
          </div>
          <div className="w-full flex justify-between items-start mt-2 text-xs text-muted-foreground">
              {statuses.map((status) => (
                  <span key={status} className={cn("flex-1 text-center leading-tight truncate", issue.status === status && "font-bold text-foreground")}>
                      {statusLabels[status as IssueStatus]}
                  </span>
              ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
