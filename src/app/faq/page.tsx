
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is CivicConnect?",
    answer:
      "CivicConnect is a platform that allows citizens to report non-emergency civic issues directly to local governments. This helps streamline the process of identifying, tracking, and resolving community problems.",
  },
  {
    question: "How do I report an issue?",
    answer:
      "Simply click the 'Report Issue' button, fill out the form with details about the problem, attach a photo if possible, and submit. Your report will be sent to the correct municipal department.",
  },
  {
    question: "Is there a cost to use CivicConnect?",
    answer:
      "No, CivicConnect is completely free for all citizens to use.",
  },
  {
    question: "What kind of issues can I report?",
    answer:
      "You can report a variety of non-emergency issues such as potholes, broken streetlights, garbage overflow, graffiti, and broken park equipment. For emergencies, please call 911.",
  },
  {
    question: "How can I track the status of my report?",
    answer:
      "Once you submit a report, you can track its status on your profile page or through the issue's detail page. You will see updates as it moves from 'Pending' to 'Resolved'.",
  },
  {
    question: "Can I report issues anonymously?",
    answer:
      "Yes, you have the option to submit reports anonymously. However, creating a profile allows you to easily track all your submitted issues in one place.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Frequently Asked Questions
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                Find answers to the most common questions about CivicConnect.
                </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
