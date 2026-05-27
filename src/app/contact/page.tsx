import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Inspire Blog",
  description:
    "Get in touch with the Inspire Blog team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 md:py-24">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question, feedback, or want to collaborate? We'd love to hear
            from you. Fill out the form below or reach out directly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Whether you're a reader looking for specific content, a
                developer wanting to contribute, or an AI tool creator seeking a
                review — our inbox is always open.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4 mt-1">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="text-muted-foreground mt-1">
                    For general inquiries and support.
                  </p>
                  <a
                    href="mailto:hello@mythosh.com"
                    className="text-primary hover:underline mt-1 inline-block"
                  >
                    hello@mythosh.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4 mt-1">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Social Media</h3>
                  <p className="text-muted-foreground mt-1">
                    Follow us on X (Twitter) for the latest updates.
                  </p>
                  <a
                    href="https://x.com/abhishekdev26"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline mt-1 inline-block"
                  >
                    @abhishekdev26
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4 mt-1">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Location</h3>
                  <p className="text-muted-foreground mt-1">
                    Based in India, accessible globally.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            {/* Note: This is a static form UI. You can wire it up to an API route (e.g., using Resend or SendGrid) later. */}
            <form className="space-y-6" action="#">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What is this regarding?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="How can we help you?"
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
