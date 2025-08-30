'use client';

import { useEffect, useState, useCallback } from "react";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Bot } from 'lucide-react';

// --- Interfaces para los datos de la API ---
interface TopProduct {
  _id: string;
  totalRevenue: number;
  totalUnitsSold: number;
}
interface TopMachine {
  _id: string;
  totalRevenue: number;
  totalSales: number;
}
interface SalesPerformanceData {
  topProducts: TopProduct[];
  topMachines: TopMachine[];
}

export function SalesDashboard() {
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

  if (loading) return <p className="text-center text-muted-foreground">Cargando datos de rendimiento...</p>;
  if (error) return <p className="text-center text-destructive">Error: {error}</p>;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Link href="/analytics/products" className="no-underline">
        <Card className="transition-shadow hover:shadow-lg h-full">
          <CardHeader className="flex flex-row items-center gap-4">
            <Package className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
              <CardDescription>Basado en ingresos. Clic para ver el reporte completo.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Unidades</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.topProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product._id}</TableCell>
                    <TableCell className="text-center">{product.totalUnitsSold}</TableCell>
                    <TableCell className="text-right font-semibold">${product.totalRevenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Link>
      
      <Link href="/analytics/machines" className="no-underline">
        <Card className="transition-shadow hover:shadow-lg h-full">
          <CardHeader className="flex flex-row items-center gap-4">
            <Bot className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Top 10 Máquinas con Mejor Rendimiento</CardTitle>
              <CardDescription>Basado en ingresos. Clic para ver el reporte completo.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Máquina</TableHead>
                  <TableHead className="text-center">Ventas Totales</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
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
      </Link>
    </div>
  );
}