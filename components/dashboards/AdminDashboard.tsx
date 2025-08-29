// components/dashboards/AdminDashboard.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiData {
  totalRevenueToday: number;
  offlineMachinesCount: number;
  lowStockItemsCount: number;
}

export function AdminDashboard() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/analytics/kpis`);
      if (!response.ok) {
        throw new Error("No se pudieron cargar los datos de analítica");
      }
      const data: KpiData = await response.json();
      setKpis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  if (loading) {
    return <p className="text-center text-muted-foreground">Cargando KPIs...</p>;
  }

  if (error) {
    return <p className="text-center text-destructive">Error: {error}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ingresos de Hoy
          </CardTitle>
          {/* Aquí podría ir un ícono de dinero */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${kpis?.totalRevenueToday.toFixed(2) ?? '0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            Ventas totales aprobadas hoy
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Máquinas Desconectadas
          </CardTitle>
           {/* Aquí podría ir un ícono de alerta */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis?.offlineMachinesCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Dispositivos que no reportan estado
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Alertas de Inventario Bajo
          </CardTitle>
           {/* Aquí podría ir un ícono de inventario */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis?.lowStockItemsCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Productos con menos de 5 unidades
          </p>
        </CardContent>
      </Card>
    </div>
  );
}