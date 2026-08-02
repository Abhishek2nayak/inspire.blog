import { Metadata } from "next";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "How Makeframe works — using prompts, selling your own, pricing, reviews and payouts.",
  alternates: { canonical: absoluteUrl("/faq") },
};

const faqs = [
  {
    question: "Is Makeframe free to use?",
    answer:
      "Browsing is free, and a large part of the library is free to copy and use. Some prompts are sold by their creators — those show a price on the card and unlock after purchase. You never need an account just to read or copy a free prompt.",
  },
  {
    question: "What exactly do I get when I buy a prompt?",
    answer:
      "The full prompt text, plus the negative prompt and the model parameters where the creator supplied them — everything needed to reproduce the example images shown on the listing. It is a one-time purchase and stays in your account.",
  },
  {
    question: "Why can I see the images but not the prompt?",
    answer:
      "For paid prompts the example outputs are always public so you can judge the quality before spending anything. Only the prompt text itself is held back until purchase.",
  },
  {
    question: "Can I sell my own prompts?",
    answer:
      "Yes. Sign in and use 'Sell a prompt'. You set the price, attach up to five example images, and keep 80% of every sale. Listing is free.",
  },
  {
    question: "How long does review take?",
    answer:
      "Every submission is checked by a human before it goes live, usually within a day. We review so the library stays worth browsing — the most common reasons for rejection are example images that do not match the prompt, or prompts copied from elsewhere.",
  },
  {
    question: "Which AI tools do these prompts work with?",
    answer:
      "Every prompt lists the model it was written for — Midjourney, Sora, Nano Banana, ChatGPT Image, Flux, Veo, Kling and Runway among others. You can filter the library by model, and each model has its own page.",
  },
  {
    question: "Do I need to credit Makeframe when I use a prompt?",
    answer:
      "No. Whatever you generate is yours to use, including commercially. You may not resell the prompt text itself.",
  },
  {
    question: "How are the tool reviews funded?",
    answer:
      "Some links to tools are affiliate links, and we say so on every page that carries one. It never changes which tools we recommend or what we say about them — a tool cannot pay to be listed or to be described more favourably.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Account settings has a delete option. It is irreversible and removes your listings along with it. Purchases you have made are also removed, so download anything you want to keep first.",
  },
  {
    question: "Who can I contact for support?",
    answer:
      "Use the Contact page and we will get back to you.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 md:py-24">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-6">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about reading, writing, and growing with Makeframe.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-8">
            Can't find the answer you're looking for? Please chat to our friendly team.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Get in touch
          </Link>
        </div>
      </main>
    </div>
  );
}
