import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
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
    <html
      lang="en"
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem("theme");
                if (t === "light") document.documentElement.classList.remove("dark");
                else document.documentElement.classList.add("dark");
              })();
            `,
          }}
        />
      </head>
      <body className="h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
