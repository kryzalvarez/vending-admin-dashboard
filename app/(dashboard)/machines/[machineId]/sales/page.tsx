// app/machines/[machineId]/sales/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SaleItem {
  _id: string;
  vendingTransactionId: string;
  machineId: string;
  status: string;
  createdAt: string;
  items: { name: string, quantity: number, price: number }[];
}

export default function MachineSalesHistory() {
  const params = useParams();
  const machineId = params.machineId as string;

  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!machineId) return;

    const fetchSales = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // Apuntamos al nuevo endpoint con el filtro
        const response = await fetch(`${apiUrl}/api/sales?machineId=${machineId}`);
        if (!response.ok) throw new Error('Error al obtener las ventas de la máquina');
        const data = await response.json();
        setSales(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [machineId]);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    // ... (misma función de status que en la otra página de ventas)
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Link href={`/machines/${machineId}`} className="inline-block mb-6 text-sm text-muted-foreground hover:underline">
        &larr; Volver al inventario de la máquina
      </Link>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>Mostrando todas las transacciones para la máquina: {decodeURIComponent(machineId)}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-center text-muted-foreground">Cargando ventas...</p>}
            {error && <p className="text-center text-destructive">Error: {error}</p>}
            {!loading && !error && (
              <Table>
                <TableHeader>
                   <TableRow>
                    <TableHead className="w-[180px]">Fecha</TableHead>
                    <TableHead>ID Transacción</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell className="text-muted-foreground">{new Date(sale.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs">{sale.vendingTransactionId}</TableCell>
                        <TableCell className="text-muted-foreground">{sale.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}</TableCell>
                        <TableCell className="text-right font-semibold">${sale.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</TableCell>
                        <TableCell className="text-center"><Badge variant={getStatusVariant(sale.status)}>{sale.status}</Badge></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">No se han registrado ventas para esta máquina.</TableCell>
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