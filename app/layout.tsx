import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/Sidebar";
import { SessionProvider } from "next-auth/react";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestor Financiero",
  description: "Mini-ERP financiero personal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geist.variable} antialiased bg-gray-950 text-gray-100`}>
        <SessionProvider>
          <Sidebar />
          <main className="md:ml-56 min-h-screen p-4 md:p-6 pt-16 md:pt-6">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
