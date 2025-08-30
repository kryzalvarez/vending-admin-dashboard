// app/(dashboard)/analytics/machines/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bot } from 'lucide-react';

interface TopMachine {
  _id: string;
  totalRevenue: number;
  totalSales: number;
}
interface SalesPerformanceData {
  topMachines: TopMachine[];
}

export default function MachineAnalyticsPage() {
  const [data, setData] = useState<SalesPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesPerformance = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/analytics/sales-performance`);
      if (!response.ok) {
        throw new Error("No se pudieron cargar los datos de rendimiento");
      }
      setData(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesPerformance();
  }, [fetchSalesPerformance]);

  if (loading) return <p className="text-center text-muted-foreground">Cargando análisis de máquinas...</p>;
  if (error) return <p className="text-center text-destructive">Error: {error}</p>;

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Bot className="h-8 w-8 text-muted-foreground" />
          <div>
            <CardTitle>Rendimiento de Máquinas</CardTitle>
            <CardDescription>Análisis de todas las máquinas basado en ingresos generados.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Máquina</TableHead>
                <TableHead className="text-center">Ventas Totales</TableHead>
                <TableHead className="text-right">Ingresos Totales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.topMachines.map((machine) => (
                <TableRow key={machine._id}>
                  <TableCell className="font-medium">{machine._id}</TableCell>
                  <TableCell className="text-center">{machine.totalSales}</TableCell>
                  <TableCell className="text-right font-semibold">${machine.totalRevenue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}