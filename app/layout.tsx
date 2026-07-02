import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI COO — Business Operations Agent",
  description:
    "Your AI Chief Operating Officer. Ask questions about inventory, sales, expenses, suppliers, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
