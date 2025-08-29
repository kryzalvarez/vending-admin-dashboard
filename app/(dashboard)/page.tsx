// app/(dashboard)/page.tsx (El "Switcher" con el AdminDashboard integrado)
'use client';

import { useEffect, useState } from 'react';
import { TechnicianDashboard } from '@/components/dashboards/TechnicianDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard'; // <-- 1. Importamos el nuevo dashboard

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
      // <-- 2. Renderizamos el nuevo componente de Admin
      return <AdminDashboard />;
    case 'sales':
      // Aquí renderizaremos el <SalesDashboard /> en el futuro
      return <div>Bienvenido, Ventas. (Dashboard en construcción)</div>;
    default:
      return <div>Rol desconocido o no tienes acceso.</div>;
  }
}