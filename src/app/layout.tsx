import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import LoadingScreen from "@/components/n10k/LoadingScreen";
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_OG_DESCRIPTION,
  SITE_OG_IMAGE,
  SITE_URL,
} from "@/lib/site-config";
import {
  getItemListJsonLd,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from "@/lib/structured-data";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  authors: [{ name: "N10K" }],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: '/brand/Icon_Mascota.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: '/brand/Icon_Mascota.png',
  },
  other: {
    "font-display": "swap",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_OG_DESCRIPTION,
    type: "website",
    url: "/",
    locale: SITE_LOCALE,
    siteName: "N10K",
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 600,
        height: 215,
        alt: "N10K Caballero — Ropa masculina urbana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_OG_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
};

const structuredData = [
  getOrganizationJsonLd(),
  getWebSiteJsonLd(),
  getItemListJsonLd(),
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#E30613" />
        {structuredData.map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </head>
      <body
        className={`${montserrat.variable} antialiased bg-background text-foreground`}
      >
        <LoadingScreen />
          {children}
          <Toaster />
      </body>
    </html>
  );
}
