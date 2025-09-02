// components/dashboards/TechnicianDashboard.tsx (Versión Final y Corregida)
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// 👇 CORRECCIÓN AQUÍ: Cambiamos PackageWarning por PackageX
import { Power, Wrench, PackageX, HardDrive } from 'lucide-react';

// --- Interfaces para los datos de la API (CORREGIDAS) ---
interface Machine {
  _id: string;
  machineId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'offline' | 'maintenance';
}
interface LowStockItem {
  _id: string;
  machineId: string;
  channelId: string;
  quantity: number;
  productId: {
    name: string;
  };
}
interface TechnicianData {
  machinesRequiringAttention: Machine[];
  lowStockItems: LowStockItem[];
}

// --- Función para obtener los datos desde la API ---
async function fetchTechnicianData(): Promise<TechnicianData> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error("API URL no está configurada.");

    const response = await fetch(`${apiUrl}/api/analytics/technician-dashboard`);
    if (!response.ok) {
        throw new Error('No se pudo conectar con el servidor');
    }
    return response.json();
}

export function TechnicianDashboard() {
  const { data, isLoading, isError, error } = useQuery<TechnicianData>({
    queryKey: ['technicianDashboard'],
    queryFn: fetchTechnicianData,
    refetchInterval: 60000, // Refresca los datos cada 60 segundos
  });
  
  const getStatusVariant = (status: string): "destructive" | "secondary" => {
    return status === 'offline' ? 'destructive' : 'secondary';
  };

  if (isLoading) {
    return <div className="text-center p-10 text-muted-foreground">Cargando tareas pendientes...</div>;
  }
  if (isError) {
    return <p className="text-center text-destructive">Error: {error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel del Técnico</h1>
            <p className="text-muted-foreground">
                Resumen de las tareas y alertas que requieren tu atención inmediata.
            </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
            <Card className="col-span-full">
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Máquinas que Requieren Atención
                    </CardTitle>
                    <CardDescription>Lista de máquinas offline o en mantenimiento.</CardDescription>
                  </div>
                  <Badge variant="destructive" className="text-lg">
                    {data?.machinesRequiringAttention.length ?? 0}
                  </Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID de Máquina</TableHead>
                      <TableHead>Ubicación (Coords)</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data && data.machinesRequiringAttention.length > 0 ? (
                      data.machinesRequiringAttention.map((machine) => (
                        <TableRow key={machine._id}>
                          <TableCell className="font-medium">{machine.machineId}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {`Lat: ${machine.location.latitude}, Lon: ${machine.location.longitude}`}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={getStatusVariant(machine.status)}>
                              {machine.status === 'offline' ? <Power className="h-3 w-3 mr-1.5" /> : <Wrench className="h-3 w-3 mr-1.5" />}
                              {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
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
                        <TableCell colSpan={4} className="h-24 text-center">¡Buen trabajo! No hay máquinas que requieran servicio.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="col-span-full">
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                        {/* 👇 CORRECCIÓN AQUÍ: Usamos el nombre correcto del ícono */}
                        <PackageX className="h-5 w-5 text-amber-600" />
                        Alertas de Inventario Bajo
                    </CardTitle>
                    <CardDescription>Productos con menos de 5 unidades que necesitan ser reabastecidos.</CardDescription>
                  </div>
                   <Badge variant="secondary" className="text-lg bg-amber-100 text-amber-800">
                    {data?.lowStockItems.length ?? 0}
                  </Badge>
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
                          <TableCell className="font-medium">{item.productId?.name ?? 'Producto no disponible'}</TableCell>
                          <TableCell className="text-muted-foreground">{item.machineId}</TableCell>
                          <TableCell className="text-center">{item.channelId}</TableCell>
                          <TableCell className="text-right font-bold text-amber-600">{item.quantity}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">¡Excelente! Todo el inventario está en orden.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </div>
    </div>
  );
}