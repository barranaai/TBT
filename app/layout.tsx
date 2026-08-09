import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Pinyon_Script } from "next/font/google";
import "./globals.css";
import AnalyticsConsent from "./components/AnalyticsConsent";
import MetaPixel from "./components/MetaPixel";
import SmoothScroll from "./components/SmoothScroll";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const siteTitle = "Teeth by Trev — Cosmetic & Implant Dentistry";
const siteDescription =
  "Dr. Trevor J. Thomas crafts life-changing smiles. Cosmetic dentistry, implants, and full-mouth rehabilitation in Beverly Hills, New York, Atlanta, Houston, Miami, Washington D.C., Tampa & Memphis. Real people. Real problems. Real results.";

// metadataBase makes the auto-generated og:image / icon URLs absolute (social
// scrapers require that). The preview image + icons come from the convention
// files in app/: opengraph-image.png, twitter-image.png, icon.png,
// apple-icon.png, favicon.ico.
export const metadata: Metadata = {
  metadataBase: new URL("https://teethbytrev.com"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://teethbytrev.com",
    siteName: "Teeth by Trev",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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
      className={`${cormorant.variable} ${inter.variable} ${pinyon.variable} h-full`}
    >
      <head>
        <meta
          name="facebook-domain-verification"
          content="b8gdf7ixkspje299s6h9umwv89cnpv"
        />
      </head>
      <body className="min-h-full flex flex-col bg-ivory text-ink">
        <MetaPixel />
        <SmoothScroll />
        {children}
        <div className="grain" aria-hidden="true" />
        <AnalyticsConsent />
      </body>
    </html>
  );
}
