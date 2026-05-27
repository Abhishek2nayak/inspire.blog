import { Metadata } from "next";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Inspire Blog",
  description: "Find answers to common questions about using Inspire Blog, writing articles, and managing your account.",
};

const faqs = [
  {
    question: "Is Inspire Blog free to use?",
    answer: "Yes, absolutely! Reading and writing articles on Inspire Blog is 100% free. We believe in keeping educational content and developer resources accessible to everyone."
  },
  {
    question: "How do I publish my first article?",
    answer: "Once you create an account and sign in, you can click the 'Write' button in the top navigation bar. This will take you to our markdown editor where you can draft, preview, and publish your article."
  },
  {
    question: "Do I retain ownership of the articles I write?",
    answer: "Yes. You retain full ownership and copyright of any content you publish on Inspire Blog. By publishing here, you simply grant us a license to display and distribute your work on our platform."
  },
  {
    question: "Can I cross-post articles from my personal blog?",
    answer: "Yes, cross-posting is encouraged! We recommend adding a canonical link to your original article in your post settings to ensure your personal blog retains its SEO value."
  },
  {
    question: "What kind of content is allowed?",
    answer: "Inspire Blog focuses on artificial intelligence, web development, software engineering, and tech productivity. Tutorials, opinions, news, and deep-dives related to these topics are highly encouraged. We do not allow spam, hate speech, or purely promotional material."
  },
  {
    question: "How can I format my articles?",
    answer: "Our editor supports rich Markdown formatting. You can easily add headings, bold/italic text, lists, blockquotes, code blocks with syntax highlighting, and embed images."
  },
  {
    question: "How do I delete my account?",
    answer: "You can delete your account by navigating to your Account Settings and selecting 'Delete Account'. Please note that this action is irreversible and will remove all your published articles."
  },
  {
    question: "Who can I contact for support?",
    answer: "If you run into any issues or have feature requests, you can reach out to us via the Contact page or email us directly at hello@mythosh.com."
  }
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
            Everything you need to know about reading, writing, and growing with Inspire Blog.
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
