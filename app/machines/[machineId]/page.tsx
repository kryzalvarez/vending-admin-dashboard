// app/machines/[machineId]/page.tsx (Versión con Edición de Inventario)
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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
  
  // Nuevos estados para manejar la edición
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({ quantity: '', price: '' });

  // --- Efecto para Cargar Datos Iniciales ---
  useEffect(() => {
    if (!machineId) return;
    const fetchInventory = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/machines/${machineId}/inventory`);
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
      const response = await fetch(`http://localhost:3000/api/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quantity: Number(editFormData.quantity),
            price: Number(editFormData.price)
        }),
      });

      if (!response.ok) throw new Error('Error al guardar los cambios');
      
      const updatedItem = await response.json();

      // Actualizar la lista de inventario en el frontend con los nuevos datos
      setInventory(prevInventory => 
        prevInventory.map(item => item._id === itemId ? updatedItem : item)
      );
      setEditingItemId(null); // Salir del modo de edición

    } catch (error: any) {
      setError("Error al guardar: " + error.message);
    }
  };

  // --- Renderizado del Componente ---
  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <div className="w-full max-w-4xl">
        <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block">
          &larr; Volver a la lista de máquinas
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Inventario de la Máquina: {decodeURIComponent(machineId)}</h1>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {loading && <p className="p-6 text-gray-500">Cargando inventario...</p>}
          {error && <p className="p-6 text-red-500">Error: {error}</p>}
          
          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id}>
                    {editingItemId === item._id ? (
                      // --- Fila en Modo Edición ---
                      <>
                        <td className="px-6 py-4 font-bold text-gray-900">{item.channelId}</td>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.productId.name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.productId.sku}</div>
                        </td>
                        <td className="px-6 py-4">
                          <input type="number" name="quantity" value={editFormData.quantity} onChange={handleFormChange} className="w-20 p-1 border rounded-md"/>
                        </td>
                        <td className="px-6 py-4">
                          <input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleFormChange} className="w-24 p-1 border rounded-md"/>
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button onClick={() => handleSaveClick(item._id)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600">Guardar</button>
                          <button onClick={handleCancelClick} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300">Cancelar</button>
                        </td>
                      </>
                    ) : (
                      // --- Fila en Modo Visualización ---
                      <>
                        <td className="px-6 py-4 font-bold text-gray-900">{item.channelId}</td>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.productId.name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.productId.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleEditClick(item)} className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600">Editar</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
           {inventory.length === 0 && !loading && !error && (
            <p className="text-center text-gray-500 p-6">No hay inventario configurado para esta máquina.</p>
           )}
        </div>
      </div>
    </main>
  );
}