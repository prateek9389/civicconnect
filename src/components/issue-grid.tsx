
"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { IssueGridClient } from "./issue-grid-client";
import { Loader2 } from "lucide-react";
import type { Filters } from "@/app/explore/page";

interface Issue {
  id: string;
  reporterName?: string;
  avatarUrl?: string | null;
  createdAt: { seconds: number; nanoseconds: number; };
  imageUrls: string[];
  title: string;
  district: string;
  state: string;
  category: string;
  status: "Pending" | "Confirmation" | "Acknowledgment" | "Resolution";
  description: string;
  aiHint?: string;
  address: string;
  votes?: number;
}

async function getIssues(filters: Filters): Promise<Issue[]> {
  const db = getFirestore(app);
  
  const collectionsToFetch = [
      collection(db, "issues"),
      collection(db, "anonymousIssues"),
      collection(db, "profiledIssues")
  ];

  let allIssues: Issue[] = [];
  
  for (const coll of collectionsToFetch) {
      let q = query(coll);

      // Apply filters
      if (filters.state) {
        q = query(q, where("state", "==", filters.state));
      }
      if (filters.district) {
        q = query(q, where("district", "==", filters.district));
      }
      if (filters.category) {
        q = query(q, where("category", "==", filters.category));
      }
      if (filters.status) {
        q = query(q, where("status", "==", filters.status));
      }
       
      // Apply sorting
      if (filters.sortBy === 'popular') {
        q = query(q, orderBy("votes", "desc"));
      } else {
        q = query(q, orderBy("createdAt", "desc"));
      }

      // We'll handle 'trending' logic client-side for simplicity
      // and date range filtering as well, as Firestore range filters on different fields are complex.

      const snapshot = await getDocs(q);
      const issues = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      } as Issue));
      allIssues.push(...issues);
  }

  // Combine and sort again as queries are per-collection
  if (filters.sortBy === 'popular') {
      allIssues.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  } else {
      allIssues.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  }

  return allIssues;
}

export function IssueGrid({ filters }: { filters: Filters }) {
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedIssues = await getIssues(filters);
        
        const issuesWithClientProps = fetchedIssues.map((issue) => ({
          ...issue,
          createdAt: new Date(issue.createdAt.seconds * 1000).toISOString(),
          id: issue.id,
          reporter: issue.reporterName || "Anonymous",
          avatarUrl: issue.avatarUrl || null,
          imageUrl: issue.imageUrls?.[0] || "https://picsum.photos/800/600",
          time: "Deprecated",
          aiHint: issue.aiHint || "issue image",
          votes: issue.votes || 0,
        }));

        setIssues(issuesWithClientProps);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [filters]);
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>
  }

  if (issues.length === 0) {
      return <p className="text-center text-muted-foreground">No issues found for the selected filters.</p>
  }

  return (
    <section className="py-4">
        <IssueGridClient issues={issues} />
    </section>
  );
}
