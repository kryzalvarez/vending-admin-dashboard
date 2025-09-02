// app/(dashboard)/layout.tsx (Versión Corregida y Simplificada)
'use client';

// BORRAMOS: import { useEffect } from 'react';
// BORRAMOS: import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Sidebar } from '@/components/dashboards/Sidebar';
import { RoleGuard } from '@/components/auth/RoleGuard'; // 👈 1. Importa tu RoleGuard

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isLoading } = useAuth();
  // BORRAMOS: const router = useRouter();
  
  // ELIMINAMOS EL useEffect COMPLETO QUE ESTABA AQUÍ

  // Mantenemos el estado de carga para una mejor experiencia de usuario
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  // Si hay un token, mostramos el layout del dashboard.
  // El nuevo AuthGuard ya se aseguró de que lleguemos aquí solo si estamos autenticados.
  if (token) {
    return (
      // 👇 2. RoleGuard protege las páginas DENTRO del dashboard
      <RoleGuard> 
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </RoleGuard>
    );
  }

  // Si no está cargando y no hay token, no se muestra nada.
  // AuthGuard ya se está encargando de la redirección.
  return null;
}