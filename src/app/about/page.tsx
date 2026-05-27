import { Metadata } from "next";
import { BookOpen, Users, Zap, Github, Twitter, Code } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "About Inspire Blog | Best AI Tools, AI News, Tutorials & AI Community",
  description:
    "Discover Inspire Blog — your trusted platform for AI tools, AI news, ChatGPT alternatives, machine learning resources, AI tutorials, productivity tools, and the latest artificial intelligence trends.",
  keywords: [
    "AI tools",
    "best AI tools",
    "Claude AI",
    "ChatGPT alternatives",
    "Anthropic Claude",
    "generative AI",
    "AI tutorials",
    "machine learning blogs",
    "AI productivity tools",
    "latest AI news",
    "AI software",
    "Gemini AI",
    "AI community",
    "artificial intelligence blog",
  ],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
            Discover the Future of{" "}
            <span className="text-primary">Artificial Intelligence</span>
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Inspire Blog is a modern platform built for AI enthusiasts,
            developers, creators, entrepreneurs, and curious learners who want
            to stay updated with the fast-moving world of artificial
            intelligence.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mt-6">
            From the latest AI tools and ChatGPT alternatives to machine
            learning tutorials, productivity software, automation platforms, and
            honest AI tool reviews — we help people discover smarter ways to
            learn, build, and grow using AI technology.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Our Mission
            </h2>

            <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
              <p>
                Artificial intelligence is changing the world faster than ever
                before, but finding reliable information, useful AI tools, and
                practical learning resources can still feel overwhelming.
              </p>

              <p>
                Our mission is simple — make AI easier, more accessible, and
                more useful for everyone. Whether you're a beginner exploring AI
                for the first time or a developer building advanced AI
                applications, Inspire Blog helps you discover the right tools,
                tutorials, guides, and strategies.
              </p>

              <p>
                We focus on publishing high-quality content around AI software,
                AI automation, productivity tools, generative AI, machine
                learning, ChatGPT, and emerging technology trends that truly
                matter.
              </p>
            </div>
          </div>
        </section>
        {/* Why Write Here Section */}

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Readers Love Inspire Blog
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-secondary/20 rounded-xl">
              <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
                <BookOpen size={32} />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                Trusted AI Resources
              </h3>

              <p className="text-muted-foreground">
                Explore carefully researched articles, AI tool comparisons,
                productivity guides, and practical tutorials designed to help
                you make smarter decisions in the AI space.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-secondary/20 rounded-xl">
              <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
                <Code size={32} />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                Built for AI Enthusiasts
              </h3>

              <p className="text-muted-foreground">
                Whether you're exploring ChatGPT, generative AI, AI coding
                tools, automation software, or machine learning platforms — our
                content is created for people who genuinely love technology and
                innovation.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-secondary/20 rounded-xl">
              <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
                <Users size={32} />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                Growing AI Community
              </h3>

              <p className="text-muted-foreground">
                Join a growing community of developers, creators, founders,
                students, and tech lovers sharing ideas, insights, experiences,
                and the latest trends in artificial intelligence.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section (Placeholder) */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Meet the Founder
          </h2>

          <div className="flex justify-center">
            <div className="text-center group">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-muted group-hover:border-primary transition-colors duration-300 bg-secondary flex items-center justify-center">
                <Users size={48} className="text-muted-foreground" />
              </div>

              <h3 className="text-xl font-bold">Abhishek Nayak</h3>

              <p className="text-muted-foreground mb-3">
                Founder, Developer & AI Enthusiast
              </p>

              <p className="text-muted-foreground max-w-md mx-auto mb-5">
                Passionate about artificial intelligence, web development,
                automation, and helping people discover useful AI tools that
                improve productivity, creativity, and learning.
              </p>

              <div className="flex justify-center space-x-3 text-muted-foreground">
                <Link
                  href="http://github.com/Abhishek2nayak"
                  className="hover:text-foreground transition-colors"
                >
                  <Github size={20} />
                </Link>

                <Link
                  href="https://x.com/abhishekdev26"
                  className="hover:text-foreground transition-colors"
                >
                  <Twitter size={20} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-primary text-primary-foreground rounded-2xl p-10">
          <Zap size={48} className="mx-auto mb-6 opacity-90" />

          <h2 className="text-3xl font-bold mb-4">
            Start Exploring the Best AI Tools Today
          </h2>

          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Stay ahead with the latest AI news, tutorials, productivity tools,
            automation guides, and artificial intelligence resources — all in
            one place.
          </p>

          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-background text-foreground hover:bg-secondary transition-colors shadow-sm"
          >
            Join the Community
          </Link>
        </section>
      </main>
    </div>
  );
}
