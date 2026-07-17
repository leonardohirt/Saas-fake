import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { CRMProvider } from "@/context/CRMContext";

export const metadata: Metadata = {
  title: "Freelancer CRM - Gestão de Clientes e Projetos",
  description: "Sistema moderno de CRM para desenvolvedores freelancers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col">
        <CRMProvider>
          {children}
        </CRMProvider>
      </body>
    </html>
  );
}
