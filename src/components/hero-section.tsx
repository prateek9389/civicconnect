"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex h-[50vh] w-full items-center justify-center bg-background py-4 md:py-8">
       <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-b from-background via-background/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      <div className="container z-10 mx-auto flex flex-col items-center px-4 text-center">
        <h1
          className="font-headline text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl"
        >
          Raise Your Voice.
        </h1>
        <h2 className="mt-2 font-headline text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Fix Your <span className="text-primary">City</span>.
        </h2>
        <p
          className="mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Report civic issues instantly, track resolutions transparently, and be part of a smarter community.
        </p>
      </div>
    </section>
  );
}
