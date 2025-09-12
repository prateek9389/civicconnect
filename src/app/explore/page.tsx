
"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ExploreFilters } from "@/components/explore-filters";
import { IssueGrid } from "@/components/issue-grid";
import { Footer } from "@/components/layout/footer";

export type Filters = {
  state?: string;
  district?: string;
  category?: string;
  status?: string;
  dateRange?: string;
  sortBy?: string;
};


export default function ExplorePage() {
  const [filters, setFilters] = useState<Filters>({ sortBy: 'newest' });

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
            <ExploreFilters onFilterChange={setFilters} />
            <IssueGrid filters={filters} />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
