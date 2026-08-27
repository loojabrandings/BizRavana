import type { Metadata } from "next";
import "../landing.css";
import { Poiret_One, Quicksand } from "next/font/google";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// The landing site's typography, exposed as CSS variables so the login page
// (styled with landing.css tokens) uses the same display/body fonts as the
// landing pages. Other auth pages don't reference these variables, so they
// keep their existing look.
const poiret = Poiret_One({
  variable: "--font-poiret",
  subsets: ["latin"],
  weight: "400",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-h-screen bg-background ${poiret.variable} ${quicksand.variable}`}
    >
      {children}
    </div>
  );
}
