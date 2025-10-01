import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HORIZON-AI POD CAST GENERATOR",
  description: "Generate AI-powered podcasts with multiple speakers using Horizon-AI AI Workflow",
  manifest: '/manifest.json',
  metadataBase: new URL('https://horizonai-podcast.onrender.com'),
  openGraph: {
    title: 'HORIZON-AI POD CAST GENERATOR',
    description: 'Generate AI-powered podcasts with multiple speakers using Horizon-AI AI Workflow',
    url: 'https://horizonai-podcast.onrender.com',
    siteName: 'HORIZON-AI POD CAST GENERATOR',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HORIZON-AI POD CAST GENERATOR',
    description: 'Generate AI-powered podcasts with multiple speakers using Horizon-AI AI Workflow',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/favicon.ico',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
