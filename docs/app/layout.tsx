import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { Inter } from "next/font/google";
import { Provider } from "@/components/provider";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import "./global.css";

import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Privacy Header Docs",
  description: "Documentation for Privacy Header extension",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>
          <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
            {children}
          </DocsLayout>
        </Provider>
      </body>
    </html>
  );
}
