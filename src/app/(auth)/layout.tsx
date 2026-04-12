import Logo from "@/components/shared/Logo";


function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/40 border border-white/50 rounded-xl px-4 py-2.5">
      <span className="text-lg font-bold text-[#1a2e28]">{value}</span>
      <span className="text-[11px] text-[#4a7265] mt-0.5">{label}</span>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — sage green, full height ── */}
      <div
        className="hidden md:flex md:w-[45%] min-h-screen flex-col justify-between p-12 lg:p-16 relative overflow-hidden"
        style={{ backgroundColor: "#b8deca" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-50px] w-60 h-60 rounded-full bg-white/15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Logo size="md" />
        </div>

        {/* Center illustration */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-64 h-56 mb-8">
            <svg viewBox="0 0 220 180" className="w-full h-full" fill="none">
              <rect
                x="25"
                y="125"
                width="170"
                height="9"
                rx="4.5"
                fill="#2d7d59"
                opacity="0.35"
              />
              <rect
                x="70"
                y="134"
                width="6"
                height="20"
                rx="3"
                fill="#2d7d59"
                opacity="0.3"
              />
              <rect
                x="144"
                y="134"
                width="6"
                height="20"
                rx="3"
                fill="#2d7d59"
                opacity="0.3"
              />
              <ellipse
                cx="110"
                cy="105"
                rx="24"
                ry="30"
                fill="#2d7d59"
                opacity="0.55"
              />
              <circle
                cx="110"
                cy="66"
                r="20"
                fill="#a8d5c2"
                stroke="#2d7d59"
                strokeWidth="2.5"
                opacity="0.95"
              />
              <path
                d="M90 61 Q110 46 130 61"
                stroke="#1a2e28"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="104" cy="66" r="2" fill="#1a2e28" opacity="0.6" />
              <circle cx="116" cy="66" r="2" fill="#1a2e28" opacity="0.6" />
              <path
                d="M105 73 Q110 77 115 73"
                stroke="#1a2e28"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M88 105 Q68 116 62 121"
                stroke="#2d7d59"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.55"
              />
              <path
                d="M132 105 Q152 116 158 121"
                stroke="#2d7d59"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.55"
              />
              <rect
                x="60"
                y="112"
                width="100"
                height="14"
                rx="3"
                fill="white"
                opacity="0.75"
              />
              <rect
                x="64"
                y="116"
                width="44"
                height="2.5"
                rx="1"
                fill="#2d7d59"
                opacity="0.5"
              />
              <rect
                x="64"
                y="121"
                width="32"
                height="2.5"
                rx="1"
                fill="#2d7d59"
                opacity="0.4"
              />
              <rect
                x="10"
                y="28"
                width="34"
                height="44"
                rx="5"
                fill="white"
                opacity="0.65"
                transform="rotate(-12 10 28)"
              />
              <rect
                x="15"
                y="35"
                width="20"
                height="2.5"
                rx="1"
                fill="#2d7d59"
                opacity="0.5"
                transform="rotate(-12 10 28)"
              />
              <rect
                x="15"
                y="41"
                width="16"
                height="2.5"
                rx="1"
                fill="#2d7d59"
                opacity="0.4"
                transform="rotate(-12 10 28)"
              />
              <rect
                x="15"
                y="47"
                width="18"
                height="2.5"
                rx="1"
                fill="#2d7d59"
                opacity="0.4"
                transform="rotate(-12 10 28)"
              />
              <circle cx="176" cy="38" r="17" fill="white" opacity="0.65" />
              <path
                d="M176 27 L176 38 L183 38"
                stroke="#2d7d59"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.7"
              />
              <circle cx="176" cy="38" r="2" fill="#2d7d59" opacity="0.6" />
              <rect
                x="172"
                y="112"
                width="7"
                height="14"
                rx="3.5"
                fill="#2d7d59"
                opacity="0.45"
              />
              <ellipse
                cx="175.5"
                cy="105"
                rx="12"
                ry="9"
                fill="#2d7d59"
                opacity="0.4"
              />
              <ellipse
                cx="167"
                cy="110"
                rx="8"
                ry="6"
                fill="#2d7d59"
                opacity="0.3"
              />
              <ellipse
                cx="184"
                cy="110"
                rx="8"
                ry="6"
                fill="#2d7d59"
                opacity="0.3"
              />
              <rect
                x="28"
                y="88"
                width="6"
                height="26"
                rx="3"
                fill="#f5c842"
                opacity="0.85"
                transform="rotate(22 28 88)"
              />
              <path
                d="M26 110 L32 110 L29 118 Z"
                fill="#e05050"
                opacity="0.75"
                transform="rotate(22 28 88)"
              />
              <path
                d="M195 65 L197 69 L201 71 L197 73 L195 77 L193 73 L189 71 L193 69 Z"
                fill="#2d7d59"
                opacity="0.4"
              />
              <path
                d="M42 85 L43.5 88 L47 89.5 L43.5 91 L42 94 L40.5 91 L37 89.5 L40.5 88 Z"
                fill="#2d7d59"
                opacity="0.35"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#1a2e28] mb-3">
            Inspire.blog
          </h2>
          <p className="text-sm text-[#3d6658] leading-relaxed max-w-[240px]">
            Unleash your ideas. Write, read, and grow with a community of
            curious minds.
          </p>

          <div className="flex items-center gap-2 mt-8">
            <span className="w-6 h-1.5 rounded-full bg-[#2d7d59]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d7d59]/35" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d7d59]/35" />
          </div>
        </div>

        {/* Stats */}
        {/* <div className="relative z-10 flex gap-3 justify-center">
          <StatPill value="50K+" label="Writers" />
          <StatPill value="200K+" label="Articles" />
          <StatPill value="1M+" label="Readers" />
        </div> */}
      </div>

      {/* ── Right panel — white, full height ── */}
      <div className="flex-1 min-h-screen bg-white flex flex-col">
        {/* Mobile logo */}
        <div className="md:hidden px-8 pt-8 pb-5 border-b border-gray-100">
          <Logo size="md" />
        </div>

        {/* Form — centered in the full height panel */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-[340px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
