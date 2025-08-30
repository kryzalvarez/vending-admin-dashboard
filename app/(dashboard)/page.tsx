// app/(dashboard)/page.tsx (El "Switcher" final)
'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { TechnicianDashboard } from '@/components/dashboards/TechnicianDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { SalesDashboard } from '@/components/dashboards/SalesDashboard'; // <-- 1. Importamos el dashboard de ventasded

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Leemos el rol del usuario guardado en el navegador
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setLoading(false);
  }, []);

  if (loading) {
    return <p className="text-center text-muted-foreground">Cargando dashboard...</p>;
  }

  // --- Lógica del Switcher ---
  switch (userRole) {
    case 'technician':
      return <TechnicianDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'sales':
      // <-- 2. Renderizamos el nuevo componente de Ventas
      return <SalesDashboard />;
    default:
      return <div>Rol desconocido o no tienes acceso.</div>;
  }
}
