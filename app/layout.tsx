import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fix It Up Database | CarLiner",
  description: "Community-maintained vehicle values for Fix It Up."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
