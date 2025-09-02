// components/auth/AuthGuard.tsx
'use client';

import { useAuth } from "@/lib/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Lista de rutas públicas que no requieren autenticación
const publicRoutes = ['/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si aún está cargando la sesión desde localStorage, no hagas nada todavía.
    if (isLoading) {
      return;
    }

    const isPublicPage = publicRoutes.includes(pathname);

    // CASO 1: El usuario NO tiene token e intenta acceder a una página privada.
    if (!token && !isPublicPage) {
      router.push('/login');
    }

    // CASO 2: El usuario SÍ tiene token e intenta acceder a una página pública (como /login).
    if (token && isPublicPage) {
      router.push('/'); // Redirige a la página principal del dashboard
    }

  }, [token, isLoading, router, pathname]);

  // Mientras carga, muestra una pantalla de carga para evitar parpadeos
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  // Si el usuario tiene token O está en una página pública, muestra el contenido.
  if (token || publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Por seguridad, si no tiene token y no está cargando, no muestra nada
  // mientras el useEffect hace la redirección.
  return null;
}