import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CUTANEO | Reservas de Depilación",
  description: "Reserva, reprograma y gestiona tus turnos de depilación de forma online, rápida y elegante en CUTANEO.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="font-sans antialiased bg-[#faf9f6] text-[#1a1a1a] min-h-screen selection:bg-[#1a1a1a] selection:text-[#faf9f6]">
        {children}
      </body>
    </html>
  );
}
