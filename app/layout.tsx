import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import '@rainbow-me/rainbowkit/styles.css';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#9333ea',
}

export const metadata: Metadata = {
  title: "NFT Scout | Discover Early NFTs on Base",
  description: "Track newly minted NFTs on Base blockchain in real-time. No storage, no backend, pure blockchain data.",
  keywords: ["NFT", "Base", "Ethereum", "Discovery", "Mints", "Early Score"],
  authors: [{ name: "NFT Scout" }],
  creator: "NFT Scout",
  publisher: "NFT Scout",
  metadataBase: new URL('https://base-phi-tan.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://base-phi-tan.vercel.app',
    siteName: 'NFT Scout',
    title: 'NFT Scout | Discover Early NFTs on Base',
    description: 'Track newly minted NFTs on Base blockchain in real-time. No storage, no backend, pure blockchain data.',
    images: [
      {
        url: 'https://base-phi-tan.vercel.app/api/frame/image',
        width: 1200,
        height: 628,
        alt: 'NFT Scout - Discover Early NFTs on Base',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NFT Scout | Discover Early NFTs on Base',
    description: 'Track newly minted NFTs on Base blockchain in real-time. No storage, no backend, pure blockchain data.',
    images: ['https://base-phi-tan.vercel.app/api/frame/image'],
    creator: '@nftscout',
  },
  icons: {
    icon: '/icon-192x192.png',
    shortcut: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  manifest: '/manifest.json',
  other: {
    // Farcaster Frame Protocol
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://base-phi-tan.vercel.app/api/frame/image',
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:post_url': 'https://base-phi-tan.vercel.app/api/frame',
    'fc:frame:button:1': '🔍 Discover NFTs',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:target': 'https://base-phi-tan.vercel.app/api/frame',
    'fc:frame:button:2': '👛 Check Wallet',
    'fc:frame:button:2:action': 'post',
    'fc:frame:button:2:target': 'https://base-phi-tan.vercel.app/api/frame/wallet',
    'fc:frame:button:3': '🌐 Open App',
    'fc:frame:button:3:action': 'link',
    'fc:frame:button:3:target': 'https://base-phi-tan.vercel.app',
    'fc:frame:input:text': 'Enter wallet address (0x...)',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9333ea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NFT Scout" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white min-h-screen`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}