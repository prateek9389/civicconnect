
"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { useState, useEffect } from "react";

export default function TermsPage() {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="prose dark:prose-invert max-w-4xl mx-auto">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Terms of Service
            </h1>
            <p className="lead">Last updated: {lastUpdated}</p>

            <h2>1. Agreement to Terms</h2>
            <p>
              By using our services, you agree to be bound by these Terms. If you don’t agree to be bound by these Terms, do not use the services.
            </p>

            <h2>2. User Conduct</h2>
            <p>
              You agree that you will not violate any law, contract, intellectual property, or other third-party right or commit a tort, and that you are solely responsible for your conduct while on the Service. You agree that you will abide by these Terms and will not:
            </p>
            <ul>
              <li>Provide false or misleading information.</li>
              <li>Harass, threaten, or defame any person or entity.</li>
              <li>Distribute spam or malicious content.</li>
              <li>Use the service for any illegal or unauthorized purpose.</li>
            </ul>

            <h2>3. Content</h2>
            <p>
              You are responsible for the content, such as photos and text, that you post to the Service. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
            </p>

            <h2>4. Termination</h2>
            <p>
              We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            
            <h2>Contact Us</h2>
            <p>
                If you have any questions about these Terms, please contact us at: <a href="mailto:terms@civicconnect.example.com">terms@civicconnect.example.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
