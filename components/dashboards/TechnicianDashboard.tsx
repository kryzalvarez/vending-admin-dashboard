// components/dashboards/TechnicianDashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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

export function TechnicianDashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/machines`);
      if (!response.ok) {
        throw new Error('No se pudo conectar con el servidor');
      }
      const data = await response.json();
      setMachines(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 30000); // Refresca cada 30 segundos
    return () => clearInterval(interval);
  }, [fetchMachines]);

  // Filtramos las máquinas para mostrar solo las que requieren atención
  const machinesRequiringAttention = machines.filter(
    (machine) => machine.status === 'offline' || machine.status === 'maintenance'
  );

  const getStatusVariant = (status: string): "destructive" | "secondary" => {
    return status === 'offline' ? 'destructive' : 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Centro de Operaciones del Técnico</CardTitle>
        <CardDescription>Máquinas que requieren atención inmediata.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center text-muted-foreground">Cargando estado de la red...</p>}
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
              {machinesRequiringAttention.length > 0 ? (
                machinesRequiringAttention.map((machine) => (
                  <TableRow key={machine._id}>
                    <TableCell className="font-medium">{machine.machineId}</TableCell>
                    <TableCell className="text-muted-foreground">{machine.location}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusVariant(machine.status)}>
                        {machine.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/machines/${machine.machineId}`} passHref>
                        <Button variant="outline" size="sm">
                          Gestionar
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    ¡Buen trabajo! No hay máquinas que requieran atención.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}