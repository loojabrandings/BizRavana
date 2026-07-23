import type { Metadata } from "next";
import { Poppins, Lora, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { PreferencesProvider } from "@/providers/preferences-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "BizRavana - Business Dashboard",
  description: "Multi-tenant SaaS dashboard for small and medium businesses",
  icons: {
    icon: "/darkmode-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${poppins.variable} ${lora.variable} ${caveat.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="system" accent="blue">
          <PreferencesProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
