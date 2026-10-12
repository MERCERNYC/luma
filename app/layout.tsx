import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luma",
  description: "Built step by step",
};

/**
 * Root layout — wraps every page.
 * Add shared providers, fonts, or nav here as you build.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
