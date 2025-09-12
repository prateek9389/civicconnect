
"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { useState, useEffect } from "react";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="lead">Last updated: {lastUpdated}</p>

            <h2>Introduction</h2>
            <p>
              Welcome to CivicConnect. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>

            <h2>Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Service includes:
            </p>
            <ul>
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Service.</li>
              <li><strong>Geo-Location Information:</strong> We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using our mobile application, to provide location-based services.</li>
              <li><strong>Report Data:</strong> Information you provide when reporting an issue, including images, descriptions, and categories.</li>
            </ul>

            <h2>Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
            </p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Forward your reported issues to the appropriate municipal authorities.</li>
              <li>Email you regarding your account or order.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
            </ul>

            <h2>Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
            
            <h2>Contact Us</h2>
            <p>
                If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@civicconnect.example.com">privacy@civicconnect.example.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
