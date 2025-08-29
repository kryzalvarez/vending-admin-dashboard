// app/(dashboard)/layout.tsx (Versión final con encabezado y menú de usuario)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserNav } from '@/components/auth/UserNav'; // <-- Importamos el menú de usuario
import { Link } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  if (isVerified) {
    return (
      <RoleGuard>
        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
              >
                {/* Aquí podrías poner un logo en el futuro */}
                <span className="font-bold">Vending System</span> 
              </Link>
              <Link
                href="/sales"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Ventas
              </Link>
            </nav>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <div className="ml-auto flex-1 sm:flex-initial">
                 {/* Componente de Menú de Usuario */}
                <UserNav />
              </div>
            </div>
          </header>
          {/* El contenido de cada página se renderizará aquí */}
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </main>
        </div>
      </RoleGuard>
    );
  }
  
  return null; // Mientras se verifica, no se muestra nada.
}