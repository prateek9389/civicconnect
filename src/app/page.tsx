
"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HeroSection } from "@/components/hero-section";
import { IssueGrid } from "@/components/issue-grid";
import { HomeFilters } from "@/components/home-filters";
import { Footer } from "@/components/layout/footer";
import type { Filters } from "./explore/page";

export default function Home() {
  const [filters, setFilters] = useState<Filters>({ sortBy: 'newest' });

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <HeroSection />
        <div className="container z-10 mx-auto -mt-12 px-4">
          <HomeFilters onFilterChange={setFilters} />
        </div>
        <div className="container mx-auto px-4 py-8">
          <IssueGrid filters={filters} />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
