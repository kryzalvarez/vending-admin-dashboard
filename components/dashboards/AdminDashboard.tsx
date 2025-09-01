// components/dashboards/AdminDashboard.tsx (Versión Final y Completa)
'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Power, Archive, ArrowUp, ArrowDown, Activity, ShoppingCart } from 'lucide-react';

// Define el mapa como un componente dinámico que solo se carga en el cliente
const FleetMap = dynamic(
  () => import('./FleetMap').then((mod) => mod.FleetMap),
  { 
    ssr: false, // Deshabilita el renderizado en el servidor
    loading: () => <div className="h-full w-full bg-muted rounded-md flex items-center justify-center"><p>Cargando mapa...</p></div>
  }
);


// --- Interfaces para los datos de la API ---
interface KpiData {
  totalRevenueToday: number;
  revenueChangeVsYesterday: number;
  totalUnitsToday: number;
  ticketPromedio: number;
  lowStockItemsCount: number;
}
interface NetworkStatus {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
}
interface SalesChartData {
  _id: string; 
  revenue: number;
}
interface RecentSale {
  _id: string;
  machineId: string;
  items: { price: number; quantity: number }[];
  createdAt: string;
}
interface CriticalAlert {
  _id: string;
  machineId: string;
  status: string;
  lastHeartbeat: string;
}
interface AdminDashboardData {
  kpis: KpiData;
  networkStatus: NetworkStatus;
  salesLast7Days: SalesChartData[];
  recentActivity: {
    sales: RecentSale[];
    alerts: CriticalAlert[];
  };
}

// --- Componente StatCard ---
const StatCard = ({ title, value, icon: Icon, description, change, href }: { title: string, value: string, icon: React.ElementType, description?: string, change?: number, href?: string }) => {
  const cardContent = (
    <Card className="transition-shadow hover:shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {change !== undefined && (
          <div className={`text-xs flex items-center ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {change.toFixed(1)}% vs ayer
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="no-underline">{cardContent}</Link>;
  }
  return cardContent;
};


export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      // 👇 CORRECCIÓN CRÍTICA: Usamos la variable de entorno para la URL del backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("La URL de la API no está configurada. Revisa tus variables de entorno.");
      }
      
      const response = await fetch(`${apiUrl}/api/analytics/admin-dashboard`);
      
      if (!response.ok) {
        throw new Error("No se pudieron cargar los datos del dashboard");
      }
      setData(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  if (loading) return <p className="text-center text-muted-foreground">Cargando centro de mando...</p>;
  if (error) return <p className="text-center text-destructive">Error: {error}</p>;

  const kpis = data?.kpis;
  const network = data?.networkStatus;

  return (
    <div className="flex flex-col gap-8">
      {/* Sección de KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Ingresos de Hoy"
            value={`$${kpis?.totalRevenueToday.toFixed(2) ?? '0.00'}`}
            icon={DollarSign}
            description={`Total de ${kpis?.totalUnitsToday ?? 0} unidades vendidas`}
            change={kpis?.revenueChangeVsYesterday}
            href="/sales"
          />
          <StatCard 
            title="Estado de la Red"
            value={`${network?.online ?? 0} / ${network?.total ?? 0} Online`}
            icon={Activity}
            description={`${network?.offline ?? 0} offline, ${network?.maintenance ?? 0} en mant.`}
            href="/analytics/machines" // Corregido para apuntar a la URL correcta del mapa
          />
          <StatCard 
            title="Ticket Promedio"
            value={`$${kpis?.ticketPromedio.toFixed(2) ?? '0.00'}`}
            icon={ShoppingCart}
            description="Valor promedio por transacción"
          />
          <StatCard 
            title="Inventario Bajo"
            value={`${kpis?.lowStockItemsCount ?? 0}`}
            icon={Archive}
            description="Productos con menos de 5 unidades"
            href="/"
          />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Mapa de la Flota */}
        <Card className="lg:col-span-2 h-[420px]">
          <CardHeader>
            <CardTitle>Estado de la Flota en Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent className="h-[340px] p-0 relative">
            <FleetMap />
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos eventos del sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[320px] overflow-y-auto">
            {data?.recentActivity.alerts.map((alert: CriticalAlert) => (
              <Link href={`/analytics/machines`} key={alert._id} className="block p-2 rounded-md transition-colors hover:bg-muted">
                <div className="flex items-center">
                  <Power className="h-5 w-5 text-red-500 mr-4"/>
                  <div className="text-sm">
                    <p className="font-medium">Máquina Desconectada</p>
                    <p className="text-muted-foreground">{alert.machineId}</p>
                  </div>
                </div>
              </Link>
            ))}
            {data?.recentActivity.sales.map((sale: RecentSale) => (
              <Link href={`/sales`} key={sale._id} className="block p-2 rounded-md transition-colors hover:bg-muted">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-emerald-500 mr-4"/>
                  <div className="text-sm">
                    <p className="font-medium">Venta de ${sale.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</p>
                    <p className="text-muted-foreground">{sale.machineId}</p>
                  </div>
                </div>
              </Link>
            ))}
            {data?.recentActivity.alerts.length === 0 && data?.recentActivity.sales.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-4">No hay actividad reciente.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Gráfico de Ventas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ventas de los Últimos 7 Días</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {data && data.salesLast7Days && data.salesLast7Days.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.salesLast7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No hay datos de ventas para mostrar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}