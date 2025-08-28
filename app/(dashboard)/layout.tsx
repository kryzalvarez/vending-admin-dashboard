// app/(dashboard)/page.tsx (Versión Corregida)
'use client';

import { useState, useEffect, useCallback } from 'react'; // <-- Añadimos useCallback
import Link from 'next/link';

// (El resto de tus importaciones de Shadcn/UI)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Machine {
  _id: string;
  machineId: string;
  location: string;
  status: string;
}

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- CAMBIO: Envolvemos la función en useCallback ---
  const fetchMachines = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/machines`);
      if (!response.ok) {
        throw new Error('La respuesta de la red no fue exitosa');
      }
      const data = await response.json();
      setMachines(data);
    } catch (error: any) {
      setError(error.message);
      console.error("Error al obtener las máquinas:", error);
    } finally {
      setLoading(false);
    }
  }, []); // El array vacío significa que esta función no cambiará entre renders

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 15000);
    return () => clearInterval(interval);
    // --- CAMBIO: Ahora podemos incluir fetchMachines de forma segura ---
  }, [fetchMachines]);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'online': return 'default';
      case 'maintenance': return 'secondary';
      case 'offline': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    // (El resto del código JSX de la página no cambia)
    <div className="container mx-auto py-10">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Portal de Administración Vending</h1>
        <p className="text-muted-foreground mt-2">Gestiona tus máquinas, inventario y ventas desde un solo lugar.</p>
      </header>
      
      <main className="grid gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lista de Máquinas</CardTitle>
              <CardDescription>Un resumen de todos los dispositivos en tu red.</CardDescription>
            </div>
            <Link href="/sales">
              <Button>Ver Historial de Ventas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-center text-muted-foreground">Cargando máquinas...</p>}
            {error && <p className="text-center text-destructive">Error: {error}</p>}
            
            {!loading && !error && (
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
                  {machines.length > 0 ? (
                    machines.map((machine) => (
                      <TableRow key={machine._id}>
                        <TableCell className="font-medium">{machine.machineId}</TableCell>
                        <TableCell className="text-muted-foreground">{machine.location}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusVariant(machine.status)}>
                            {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/machines/${machine.machineId}`} passHref>
                            <Button variant="outline" size="sm">
                              Ver Inventario
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No se encontraron máquinas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}