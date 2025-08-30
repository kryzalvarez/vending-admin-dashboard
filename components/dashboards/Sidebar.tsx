// components/dashboards/Sidebar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Power, BarChart2, HardDrive } from 'lucide-react';

export function Sidebar() {
  const { userName, logout } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-100 dark:bg-gray-900 p-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Vending Admin</h2>
        <p className="text-sm text-muted-foreground">Hola, {userName || 'Usuario'}</p>
      </div>

      <nav className="flex flex-col gap-2">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <Home className="h-4 w-4" />
          Dashboard Principal
        </Link>
        <Link href="/machines" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <HardDrive className="h-4 w-4" />
          Máquinas
        </Link>
        <Link href="/sales" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <BarChart2 className="h-4 w-4" />
          Análisis de Ventas
        </Link>
      </nav>

      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
          <Power className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}