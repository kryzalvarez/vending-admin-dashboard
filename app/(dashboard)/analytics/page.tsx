// app/(dashboard)/analytics/products/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package } from 'lucide-react';

interface TopProduct {
  _id: string;
  totalRevenue: number;
  totalUnitsSold: number;
}
interface SalesPerformanceData {
  topProducts: TopProduct[];
}

export default function ProductAnalyticsPage() {
  const [data, setData] = useState<SalesPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesPerformance = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // Reutilizamos el endpoint que ya tenemos, pidiendo más de 10 para una lista completa
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

  if (loading) return <p className="text-center text-muted-foreground">Cargando análisis de productos...</p>;
  if (error) return <p className="text-center text-destructive">Error: {error}</p>;

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Package className="h-8 w-8 text-muted-foreground" />
          <div>
            <CardTitle>Rendimiento de Productos</CardTitle>
            <CardDescription>Análisis de todos los productos basado en ingresos generados.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Unidades Vendidas</TableHead>
                <TableHead className="text-right">Ingresos Totales</TableHead>
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
    </div>
  );
}