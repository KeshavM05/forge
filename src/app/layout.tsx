import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge — LaTeX Resume Assembler",
  description:
    "Intelligent resume assembly. Select content from your bank, match ATS keywords, and export your LaTeX template — tailored for every job.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300..800&family=JetBrains+Mono:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
