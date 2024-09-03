import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Head from "next/head";
import { headers } from "next/headers";
import React from "react";
import { cookieToInitialState } from "wagmi";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "./shared/components/Footer";
import Header from "./shared/components/Header";
import Modal from "./shared/components/Modal";
import { getConfig } from "./shared/constants/wagmi-config";
import Script from "next/script";
import GoogleAnalytics from "./shared/components/GoogleAnalytics";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const title = "FlareSwap | Fast, Secure, and Low-Fee Decentralized Exchange on FlareNetwork";
const description =
  "Discover FlareSwap, the ultimate decentralized exchange (DEX) built on FlareNetwork. Experience lightning-fast transactions, minimal fees, and a user-friendly interface that makes trading effortless. Whether you're a crypto newbie or a seasoned trader, FlareSwap offers a seamless trading experience designed for everyone. Join the revolution and start trading smarter today!";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  viewport: "width=device-width, initial-scale=1",
  keywords: "FlareSwap, DEX, decentralized exchange, FlareNetwork, cryptocurrency trading, low fees, fast transactions",
  authors: [{ name: "FlareSwap Team" }],
  creator: "FlareSwap",
  publisher: "FlareSwap",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title,
    description,
    url: "https://flareswap.finance",
    siteName: "FlareSwap",
    images: [
      {
        url: "https://flareswap.finance/images/metadata_FSW.png",
        width: 1200,
        height: 630,
        alt: "FlareSwap - Decentralized Exchange",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@FlareSwapDEX",
    images: ["https://flareswap.finance/images/metadata_FSW.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(getConfig(), headers().get("cookie"));

  return (
    <html lang="en" className={poppins.variable}>
      <Head>
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph meta tags */}
        <meta property="og:title" content={metadata.title as string} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://flareswap.finance/images/metadata_FSW.png" />
        <meta property="og:url" content="https://flareswap.finance" />
        <meta property="og:type" content="website" />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@FlareSwap" />
        <meta name="twitter:title" content={metadata.title as string} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://flareswap.finance/images/metadata_FSW.png" />

        {/* Additional meta tags */}
        <meta name="keywords" content="FlareSwap, DEX, Flare Network, DeFi, Decentralized Exchange" />
        <meta name="author" content="FlareSwap Team" />
        <link rel="canonical" href="https://flareswap.finance" />
      </Head>
      <body className="font-sans">
        <GoogleAnalytics ga_id="G-ZLDV6XVSTF"/>
        <Providers initialState={initialState}>
          <main className="min-h-screen relative">
            {/* Background */}
            <div className="absolute z-0 opacity-[0.35] top-0 left-0 bottom-0 right-0 bg-auto bg-repeat bg-[url('/images/bg.png')]"></div>
            <div className="absolute z-[1] top-0 left-0 bottom-0 right-0 bg-auto bg-repeat-x bg-[url('/images/bg-vector-mb.png')] md:bg-[url('/images/bg-vector.png')]"></div>
            {/* Content */}
            <div className="relative z-[2]">
              <Header />
              {children}
              <Footer />
            </div>
            <div id="modal-root"></div>
            <Modal />
          </main>
        </Providers>
      </body>
    </html>
  );
}
