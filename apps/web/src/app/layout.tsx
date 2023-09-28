import "@/styles/globals.css";
import type { Metadata } from "next";
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import MainNav from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Colab-AI"
  // description: "Generated by create turbo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning >
      <body className={cn(
        "font-sans min-h-screen bg-background antialiased",
        fontSans.variable,
        fontMono.variable
      )}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="relative flex min-h-screen flex-col bg-background">
            <div className="flex-1">
              <MainNav className="mx-6" />
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
