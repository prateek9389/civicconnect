
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { getFirestore, doc, getDoc, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { notFound } from "next/navigation";
import { IssueDetailClient, type Issue } from "@/components/issue-detail-client";


async function getIssue(id: string): Promise<Issue | null> {
    const db = getFirestore(app);
    
    const profiledIssueRef = doc(db, "profiledIssues", id);
    let issueSnap = await getDoc(profiledIssueRef);

    if (!issueSnap.exists()) {
        const anonymousIssueRef = doc(db, "anonymousIssues", id);
        issueSnap = await getDoc(anonymousIssueRef);
    }

    if (issueSnap.exists()) {
        const data = issueSnap.data();
        return { 
            id: issueSnap.id,
            ...data,
            // Convert timestamp to string for serialization
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(), 
        } as Issue;
    }
    
    return null;
}


export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const issue = await getIssue(params.id);

  if (!issue) {
    notFound();
  }
    
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
            <IssueDetailClient issue={issue} />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
