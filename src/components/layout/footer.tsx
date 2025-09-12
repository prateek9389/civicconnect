
import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="hidden border-t bg-background md:block">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Building2 className="h-7 w-7 text-primary" />
              <span className="font-headline text-2xl font-bold">
                CivicConnect
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering communities, one report at a time.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">Explore Issues</Link></li>
              <li><Link href="/report-issue" className="text-sm text-muted-foreground hover:text-foreground">Report an Issue</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CivicConnect. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
