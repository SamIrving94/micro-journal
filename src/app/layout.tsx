import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Microjournal - Your Personal Journal",
  description: "A simple, beautiful way to journal your thoughts with WhatsApp integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
