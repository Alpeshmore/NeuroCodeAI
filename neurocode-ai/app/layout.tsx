import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroCode AI – Confusion-Aware Code Intelligence",
  description: "AI-powered platform to help developers understand code logic, debug errors, and learn programming concepts through adaptive explanations.",
  keywords: ["AI", "code analysis", "debugging", "learning", "programming"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
