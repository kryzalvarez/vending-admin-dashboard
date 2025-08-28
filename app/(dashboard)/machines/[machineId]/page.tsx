// app/machines/[machineId]/page.tsx (Versión rediseñada con Shadcn/UI)
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Importamos los componentes de Shadcn/UI que usaremos
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Definición de Tipos (Interfaces) ---
interface InventoryProduct {
  _id: string;
  sku: string;
  name: string;
}
interface InventoryItem {
  _id: string;
  channelId: number;
  productId: InventoryProduct;
  quantity: number;
  price: number;
}
interface EditFormData {
    quantity: string;
    price: string;
}

export default function MachineDetails() {
  const params = useParams();
  const machineId = params.machineId as string;

  // --- Estados del Componente ---
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para manejar la edición
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({ quantity: '', price: '' });

  // --- Efecto para Cargar Datos Iniciales ---
  useEffect(() => {
    if (!machineId) return;
    const fetchInventory = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/machines/${machineId}/inventory`);
        if (!response.ok) throw new Error('La respuesta de la red no fue exitosa');
        const data = await response.json();
        setInventory(data);
      } catch (error: any) { setError(error.message);
      } finally { setLoading(false); }
    };
    fetchInventory();
  }, [machineId]);

  // --- Funciones para Manejar la Edición ---

  const handleEditClick = (item: InventoryItem) => {
    setEditingItemId(item._id);
    setEditFormData({
        quantity: item.quantity.toString(),
        price: item.price.toFixed(2)
    });
  };

  const handleCancelClick = () => {
    setEditingItemId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async (itemId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quantity: Number(editFormData.quantity),
            price: Number(editFormData.price)
        }),
      });

      if (!response.ok) throw new Error('Error al guardar los cambios');
      
      const updatedItem = await response.json();

      setInventory(prevInventory => 
        prevInventory.map(item => item._id === itemId ? updatedItem : item)
      );
      setEditingItemId(null);

    } catch (error: any) {
      setError("Error al guardar: " + error.message);
    }
  };

  // --- Renderizado del Componente ---
  return (
    <div className="container mx-auto py-10">
      <Link href="/" className="inline-block mb-6 text-sm text-muted-foreground hover:underline">
        &larr; Volver a la lista de máquinas
      </Link>
      <main>
        <Card>
          {/* --- SECCIÓN MODIFICADA --- */}
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inventario de la Máquina</CardTitle>
              <CardDescription>ID: {decodeURIComponent(machineId)}</CardDescription>
            </div>
            <Link href={`/machines/${machineId}/sales`}>
              <Button variant="outline">Ver Ventas</Button>
            </Link>
          </CardHeader>
          {/* --- FIN DE LA SECCIÓN MODIFICADA --- */}
          <CardContent>
            {loading && <p className="text-center text-muted-foreground">Cargando inventario...</p>}
            {error && <p className="text-center text-destructive">Error: {error}</p>}

            {!loading && !error && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Canal</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="w-[120px]">Cantidad</TableHead>
                    <TableHead className="w-[120px]">Precio</TableHead>
                    <TableHead className="text-right w-[200px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.length > 0 ? (
                    inventory.map((item) => (
                      <TableRow key={item._id}>
                        {editingItemId === item._id ? (
                          // --- Fila en Modo Edición ---
                          <>
                            <TableCell className="font-medium">{item.channelId}</TableCell>
                            <TableCell>
                              <div className="font-medium">{item.productId.name}</div>
                              <div className="text-xs text-muted-foreground">SKU: {item.productId.sku}</div>
                            </TableCell>
                            <TableCell>
                              <Input type="number" name="quantity" value={editFormData.quantity} onChange={handleFormChange} className="h-8"/>
                            </TableCell>
                            <TableCell>
                              <Input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleFormChange} className="h-8"/>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button onClick={() => handleSaveClick(item._id)} size="sm">Guardar</Button>
                              <Button onClick={handleCancelClick} variant="outline" size="sm">Cancelar</Button>
                            </TableCell>
                          </>
                        ) : (
                          // --- Fila en Modo Visualización ---
                          <>
                            <TableCell className="font-medium">{item.channelId}</TableCell>
                            <TableCell>
                              <div className="font-medium">{item.productId.name}</div>
                              <div className="text-xs text-muted-foreground">SKU: {item.productId.sku}</div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button onClick={() => handleEditClick(item)} variant="outline" size="sm">Editar</Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No hay inventario configurado para esta máquina.
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