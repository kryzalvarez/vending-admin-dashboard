// components/dashboards/TechnicianDashboard.tsx (Versión Final)
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Power, Wrench, Archive } from 'lucide-react';

// --- Interfaces para los datos de la API ---
interface Machine {
  _id: string;
  machineId: string;
  location: string;
  status: string;
}
interface LowStockItem {
  _id: string;
  machineId: string;
  channelId: number;
  quantity: number;
  productId: {
    name: string;
  };
}
interface TechnicianData {
  machinesRequiringAttention: Machine[];
  lowStockItems: LowStockItem[];
}

export function TechnicianDashboard() {
  const [data, setData] = useState<TechnicianData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechnicianData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/analytics/technician-dashboard`);
      if (!response.ok) {
        throw new Error('No se pudo conectar con el servidor');
      }
      setData(await response.json());
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechnicianData();
    const interval = setInterval(fetchTechnicianData, 60000); // Refresca cada minuto
    return () => clearInterval(interval);
  }, [fetchTechnicianData]);
  
  const getStatusVariant = (status: string): "destructive" | "secondary" => {
    return status === 'offline' ? 'destructive' : 'secondary';
  };

  if (loading) return <p className="text-center text-muted-foreground">Cargando tareas pendientes...</p>;
  if (error) return <p className="text-center text-destructive">Error: {error}</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Máquinas que Requieren Atención</CardTitle>
          <CardDescription>Lista de máquinas offline o en mantenimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Máquina</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.machinesRequiringAttention.length > 0 ? (
                data.machinesRequiringAttention.map((machine) => (
                  <TableRow key={machine._id}>
                    <TableCell className="font-medium">{machine.machineId}</TableCell>
                    <TableCell className="text-muted-foreground">{machine.location}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusVariant(machine.status)}>
                        {machine.status === 'offline' ? <Power className="h-3 w-3 mr-1" /> : <Wrench className="h-3 w-3 mr-1" />}
                        {machine.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/machines/${machine.machineId}`} passHref>
                        <Button variant="outline" size="sm">Gestionar</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">No hay máquinas que requieran servicio.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Alertas de Inventario Bajo</CardTitle>
          <CardDescription>Productos con menos de 5 unidades en toda la red.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead className="text-center">Canal</TableHead>
                <TableHead className="text-right">Cantidad Restante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.lowStockItems.length > 0 ? (
                data.lowStockItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.productId?.name ?? 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{item.machineId}</TableCell>
                    <TableCell className="text-center">{item.channelId}</TableCell>
                    <TableCell className="text-right font-bold text-amber-600">{item.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">No hay productos con bajo inventario.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}