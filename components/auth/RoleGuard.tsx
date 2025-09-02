// components/auth/RoleGuard.tsx (Versión Corregida y Profesional)
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext'; // 👈 1. IMPORTAMOS useAuth

// Definimos qué rutas puede ver cada rol
const roleRoutes: { [key: string]: string[] } = {
  admin: ['/', '/machines', '/sales', '/analytics', '/products'], // El admin puede ver todo
  technician: ['/', '/machines'], // El técnico puede ver el dashboard y las máquinas
  sales: ['/', '/sales'], // El de ventas puede ver el dashboard y las ventas
};

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { userRole, isLoading } = useAuth(); // 👈 2. USAMOS EL ESTADO DEL CONTEXTO
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // No hacemos nada mientras se carga la información del usuario
    if (isLoading || !userRole) {
      return;
    }

    const allowedRoutes = roleRoutes[userRole] || [];
    
    // 👇 3. LÓGICA DE PERMISOS CORREGIDA
    const isAllowed = allowedRoutes.some(route => {
      // Para la ruta raíz, la coincidencia debe ser exacta
      if (route === '/') {
        return pathname === '/';
      }
      // Para otras rutas, verificamos si la ruta actual comienza con la ruta permitida
      return pathname.startsWith(route);
    });

    if (!isAllowed) {
      // Si el usuario intenta acceder a una ruta no permitida, lo redirigimos a su página principal.
      // En un futuro, podría redirigir a una página de "Acceso Denegado".
      router.push('/');
    }
  }, [pathname, router, userRole, isLoading]);

  // Mientras carga o si no hay rol, el layout principal se encarga de mostrar un loader o redirigir a /login
  if (isLoading || !userRole) {
    return null; // O un componente de carga <Spinner />
  }

  return <>{children}</>;
}