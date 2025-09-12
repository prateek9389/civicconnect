
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Send, UserCheck, ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { getFirestore, doc, getDoc, updateDoc, Timestamp, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  id: string;
  title: string;
  reporterId?: string;
  reporterName?: string;
  reporterEmail?: string;
  category: string;
  status: string;
  createdAt: Timestamp;
  description: string;
  district: string;
  state: string;
  imageUrls: string[];
}

export default function ManageIssueDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [originalStatus, setOriginalStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const db = getFirestore(app);
  const { toast } = useToast();

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        let issueRef = doc(db, "profiledIssues", id);
        let issueSnap = await getDoc(issueRef);
        
        if (!issueSnap.exists()) {
            issueRef = doc(db, "anonymousIssues", id);
            issueSnap = await getDoc(issueRef);
        }
        
        if (issueSnap.exists()) {
          const issueData = { id: issueSnap.id, ...issueSnap.data() } as Issue;
          setIssue(issueData);
          setNewStatus(issueData.status);
          setOriginalStatus(issueData.status);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching issue:", error);
        toast({
            title: "Error",
            description: "Failed to fetch issue details.",
            variant: "destructive"
        })
      } finally {
        setIsLoading(false);
      }
    };
    fetchIssue();
  }, [id, db, toast]);

  const handleSaveChanges = async () => {
      if (!issue || newStatus === originalStatus) return;
      setIsSaving(true);
      try {
        let issueRef = doc(db, "profiledIssues", issue.id);
        let issueSnap = await getDoc(issueRef);
        if (!issueSnap.exists()) {
            issueRef = doc(db, "anonymousIssues", issue.id);
        }

        await updateDoc(issueRef, {
            status: newStatus
        });

        // Send notification to user
        if (issue.reporterId) {
            const notificationRef = collection(db, "users", issue.reporterId, "notifications");
            await addDoc(notificationRef, {
                issueId: issue.id,
                message: `The status of your issue "${issue.title}" has changed from ${originalStatus} to ${newStatus}.`,
                type: 'status_update',
                read: false,
                createdAt: serverTimestamp(),
            });
        }
        
        setIssue(prev => prev ? {...prev, status: newStatus} : null);
        setOriginalStatus(newStatus);

        toast({
            title: "Success",
            description: "Issue status has been updated."
        });
      } catch (error) {
         toast({
            title: "Error",
            description: "Failed to update issue status.",
            variant: "destructive"
        });
      } finally {
          setIsSaving(false);
      }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return <div>Issue not found.</div>;
  }

  return (
    <div className="space-y-8">
        <Link href="/admin/dashboard/manage-issues" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Issues
        </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl">{issue.title}</CardTitle>
                    <Badge variant="outline">{issue.category || 'General'}</Badge>
                </div>
                <CardDescription>ID: {issue.id} | Reported on: {issue.createdAt.toDate().toLocaleDateString()} | District: {issue.district}</CardDescription>
            </CardHeader>
            <CardContent>
              {issue.imageUrls && issue.imageUrls.length > 0 ? (
                <Carousel className="w-full mb-6">
                    <CarouselContent>
                    {issue.imageUrls.map((src, index) => (
                        <CarouselItem key={index}>
                        <div className="aspect-video relative">
                            <Image
                            src={src}
                            alt={`${issue.title} - image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            />
                        </div>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </Carousel>
              ) : <p className="text-muted-foreground mb-4">No images were provided for this issue.</p>}
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground">{issue.description}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Internal Communication</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">No messages yet.</div>
                    <div className="flex gap-2">
                        <Textarea placeholder="Type your message... (e.g., @maintenance-team)" />
                        <Button variant="secondary"><Send className="h-4 w-4"/></Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Reporter Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{issue.reporterName || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">{issue.reporterEmail || 'No email provided'}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5"/> Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <label className="text-sm font-medium">Current Status</label>
                        <Badge className="ml-2">{issue.status}</Badge>
                     </div>
                     <div>
                        <label htmlFor="update-status" className="text-sm font-medium">Update Status</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger id="update-status">
                                <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Confirmation">Confirmation</SelectItem>
                                    <SelectItem value="Acknowledgment">Acknowledgment</SelectItem>
                                    <SelectItem value="Resolution">Resolution</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                     </div>
                     <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving || newStatus === originalStatus}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
