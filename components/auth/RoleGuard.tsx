// components/auth/RoleGuard.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Definimos qué rutas puede ver cada rol
const roleRoutes: { [key: string]: string[] } = {
  admin: ['/'], // El admin puede ver la raíz del dashboard
  technician: ['/', '/machines'], // El técnico puede ver la raíz y las máquinas
  sales: ['/', '/sales'], // El de ventas puede ver la raíz y las ventas
};

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');

    if (userRole) {
      const allowedRoutes = roleRoutes[userRole] || [];
      // Verificamos si la ruta actual (pathname) está permitida para el rol del usuario.
      // Incluimos una verificación para las sub-rutas (ej. /machines/VM001)
      const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));

      if (!isAllowed) {
        // Si no está permitido, lo redirigimos a la página principal del dashboard.
        // En un futuro, podría redirigir a una página de "Acceso Denegado".
        router.push('/');
      }
    }
    // Si no hay rol, el guardián principal (layout.tsx) ya se habrá encargado de redirigir a /login
  }, [pathname, router]);

  return <>{children}</>;
}