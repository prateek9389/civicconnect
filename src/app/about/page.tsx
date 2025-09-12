
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { Building, Users, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              About CivicConnect
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
              CivicConnect is a platform dedicated to empowering communities by
              providing a direct channel to report and track civic issues. We
              believe in the power of collective action to create better cities.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Target className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Our Mission</h2>
              <p className="mt-2 text-muted-foreground">
                To foster transparency and collaboration between citizens and
                local authorities, building smarter, more responsive cities for
                everyone.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Building className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">For Cities</h2>
              <p className="mt-2 text-muted-foreground">
                We provide a streamlined platform for local governments to
                receive, manage, and resolve civic issues efficiently.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">For Citizens</h2>
              <p className="mt-2 text-muted-foreground">
                Empowering you to report problems, track their progress, and
                see real change in your neighborhood. Your voice matters.
              </p>
            </div>
          </div>

           <div className="mt-20">
              <h2 className="text-center font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                How It Works
              </h2>
               <div className="relative mt-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="text-5xl font-bold text-primary">1</div>
                        <h3 className="mt-2 text-xl font-semibold">Report an Issue</h3>
                        <p className="mt-2 text-muted-foreground">Snap a photo, add details, and submit. It's that simple.</p>
                    </div>
                     <div className="flex flex-col items-center text-center">
                        <div className="text-5xl font-bold text-primary">2</div>
                        <h3 className="mt-2 text-xl font-semibold">We Notify Authorities</h3>
                        <p className="mt-2 text-muted-foreground">Your report is automatically sent to the relevant local department.</p>
                    </div>
                     <div className="flex flex-col items-center text-center">
                        <div className="text-5xl font-bold text-primary">3</div>
                        <h3 className="mt-2 text-xl font-semibold">Track Progress</h3>
                        <p className="mt-2 text-muted-foreground">Receive real-time updates as your issue is acknowledged and resolved.</p>
                    </div>
                 </div>
               </div>
           </div>

        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
