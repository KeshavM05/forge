import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge — LaTeX Resume Assembler",
  description:
    "Select your best content for any job description, assemble a tailored LaTeX resume, and check ATS keyword coverage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=JetBrains+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
