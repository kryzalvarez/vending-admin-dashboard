// app/sales/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
        // --- LÍNEA CORREGIDA ---
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/sales`);
        // --- FIN DE LA CORRECCIÓN ---

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

  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <div className="w-full max-w-6xl">
        <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block">&larr; Volver al inicio</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Historial de Ventas</h1>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {loading && <p className="p-6 text-gray-500">Cargando ventas...</p>}
          {error && <p className="p-6 text-red-500">Error: {error}</p>}
          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transacción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Máquina</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sale.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{sale.vendingTransactionId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{sale.machineId}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {sale.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${sale.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{sale.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
            {sales.length === 0 && !loading && !error && (
             <p className="text-center text-gray-500 p-6">No se han registrado ventas.</p>
            )}
        </div>
      </div>
    </main>
  );
}
