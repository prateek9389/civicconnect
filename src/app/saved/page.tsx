
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { IssueGrid } from "@/components/issue-grid";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SavedPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8">
              <CardHeader>
                  <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">Saved Issues</CardTitle>
                  <CardDescription className="mt-2 text-lg text-muted-foreground">
                    Here are the issues you've saved for later.
                  </CardDescription>
              </CardHeader>
          </Card>
          <IssueGrid />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
