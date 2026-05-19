import type { Metadata, Viewport } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Saraci Core",
    template: "%s · Saraci Core",
  },
  description: "Lead Research, Checks und Berichte für Saraci Core.",
  applicationName: "Saraci Core",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Saraci Core",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#060606",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`dark h-full antialiased ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Saraci Core" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text-primary)]"
        suppressHydrationWarning
      >
        {children}
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
