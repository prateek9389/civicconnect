
"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ReportIssueForm } from "@/components/report-issue-form";
import { Footer } from "@/components/layout/footer";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function ReportIssueContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
            <ReportIssueForm />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}


export default function ReportIssuePage() {
    return (
        <AuthProvider>
            <ReportIssueContent />
        </AuthProvider>
    )
}
