"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NavProgress from "./NavProgress";

const AUTH_PATHS = ["/login", "/register"];

export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isAuth) return <>{children}</>;

  return (
    <>
      {/* useSearchParams needs a Suspense boundary or it opts the whole
          tree into client-side rendering. */}
      <Suspense fallback={null}>
        <NavProgress />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
