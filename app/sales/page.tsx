// app/sales/page.tsx (Versión rediseñada con Shadcn/UI)
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Importamos los componentes de Shadcn/UI
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
  items: { name: string, quantity: number, price: number }[] 
}

export default function SalesHistory() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/sales`);
        if (!response.ok) throw new Error('Error al obtener las ventas');
        const data = await response.json();
        setSales(data);
      } catch (err: any) { 
        setError(err.message); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchSales();
  }, []);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'approved':
        return 'default'; // Verde
      case 'pending':
        return 'secondary'; // Gris
      case 'rejected':
      case 'cancelled':
        return 'destructive'; // Rojo
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Link href="/" className="inline-block mb-6 text-sm text-muted-foreground hover:underline">
        &larr; Volver al inicio
      </Link>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>Todas las transacciones registradas en la red.</CardDescription>
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
                    <TableHead>Máquina</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{sale.vendingTransactionId}</TableCell>
                        <TableCell className="font-medium">{sale.machineId}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {sale.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${sale.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusVariant(sale.status)}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No se han registrado ventas.
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