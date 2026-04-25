import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

// next/font downloads the font at build time and self-hosts it: no runtime
// request to Google, no layout shift. The generated internal font name is
// random ("Bricolage_Grotesque__abc123"), so we expose the CSS variable
// --font-bricolage and reference it from globals.css (@theme --font-display).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "bunq Split",
  description: "AI-powered bill splitter — chat, drag & drop, native share",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={bricolage.variable}>
      <body>{children}</body>
    </html>
  );
}
