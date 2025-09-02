// app/layout.tsx (Versión Corregida)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import  Providers  from "./providers"; // Se cambió el import a default
import { AuthGuard } from "@/components/auth/AuthGuard"; // 👈 1. Importa el nuevo guardián
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vending Admin Dashboard",
  description: "Dashboard de administración para máquinas expendedoras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {/* 👇 2. AuthGuard envuelve a los hijos para proteger toda la app */}
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}