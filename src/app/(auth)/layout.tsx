import Link from "next/link";
import { Check } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side — Brand Hero */}
      <div className="hidden md:flex md:w-1/2 bg-[#0d0d0d] text-white flex-col justify-between p-12">
        {/* Logo */}
        <div>
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="w-9 h-9 bg-white flex items-center justify-center rounded-sm">
              <span className="text-[#0d0d0d] font-bold text-lg leading-none">B</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Inspire.blog
            </span>
          </Link>
        </div>

        {/* Main Hero Content */}
        <div className="space-y-10">
          <div>
            <h1 className="text-5xl font-serif font-bold leading-tight text-white mb-4">
              Write. Read.
              <br />
              Discover.
            </h1>
          </div>

          {/* Bullet points */}
          <ul className="space-y-4">
            {[
              "Join 100,000+ writers",
              "Read what matters to you",
              "Publish and get discovered",
            ].map((text) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <div>
          <blockquote className="text-white/50 text-sm italic leading-relaxed">
            &quot;Inspire.blog changed how I share ideas. I found my audience in
            weeks.&quot;
            <br />
            <span className="not-italic text-white/40 text-xs mt-1 block">
              — Sarah K., product designer & writer
            </span>
          </blockquote>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile logo */}
        <div className="md:hidden p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 bg-black flex items-center justify-center rounded-sm">
              <span className="text-white font-bold text-sm leading-none">B</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Inspire.blog</span>
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
