import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanGPT - Weekly AI Timetable Planner",
  description: "AI-powered weekly scheduling app that respects your fixed blocks and automates your task pool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-textMain selection:bg-primary selection:text-surface">
        {children}
      </body>
    </html>
  );
}
