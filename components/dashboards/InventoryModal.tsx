// components/dashboards/InventoryModal.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { AssignProductForm } from './AssignProductForm';
import { PlusCircle } from 'lucide-react';

interface InventoryItem {
    _id: string;
    productId: { name: string; sku: string; };
    quantity: number;
    price: number;
    channelId: string;
}

// --- Funciones de API ---
async function fetchInventory(machineId: string): Promise<InventoryItem[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/machines/${machineId}/inventory`);
    if (!response.ok) throw new Error('No se pudo cargar el inventario');
    return response.json();
}

async function updateInventoryItem({ id, quantity, price }: { id: string, quantity: number, price: number }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, price }),
    });
    if (!response.ok) throw new Error('No se pudo actualizar el item');
    return response.json();
}

export function InventoryModal({ machineId, isOpen, onClose }: { machineId: string, isOpen: boolean, onClose: () => void }) {
    const queryClient = useQueryClient();
    const [isAssigning, setAssigning] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ quantity: 0, price: 0 });
    
    const { data: inventory, isLoading, isError, error } = useQuery<InventoryItem[]>({
        queryKey: ['inventory', machineId],
        queryFn: () => fetchInventory(machineId),
        enabled: isOpen,
    });

    const updateMutation = useMutation({
        mutationFn: updateInventoryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', machineId] });
            setEditingItemId(null); // Salir del modo edición
        },
    });

    const handleEditClick = (item: InventoryItem) => {
        setEditingItemId(item._id);
        setEditData({ quantity: item.quantity, price: item.price });
    };

    const handleSaveClick = () => {
        if (!editingItemId) return;
        updateMutation.mutate({ id: editingItemId, ...editData });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Inventario de la Máquina: {machineId}</DialogTitle>
                    {!isAssigning && (
                         <Button onClick={() => setAssigning(true)} className="absolute right-6 top-6">
                            <PlusCircle className="mr-2 h-4 w-4" /> Asignar Producto
                        </Button>
                    )}
                </DialogHeader>
                
                {isAssigning ? (
                    <AssignProductForm machineId={machineId} onFinished={() => setAssigning(false)} />
                ) : (
                    <div className="py-4">
                        {isLoading && <p>Cargando inventario...</p>}
                        {isError && <p className="text-red-500">Error: {error.message}</p>}
                        {inventory && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Canal</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Precio</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory.map(item => (
                                        <TableRow key={item._id}>
                                            <TableCell>{item.channelId}</TableCell>
                                            <TableCell>{item.productId?.name || 'Producto no encontrado'}</TableCell>
                                            <TableCell>
                                                {editingItemId === item._id ? (
                                                    <Input type="number" value={editData.quantity} onChange={e => setEditData({...editData, quantity: Number(e.target.value)})} className="w-20" />
                                                ) : (
                                                    item.quantity
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                 {editingItemId === item._id ? (
                                                    <Input type="number" step="0.01" value={editData.price} onChange={e => setEditData({...editData, price: Number(e.target.value)})} className="w-24" />
                                                ) : (
                                                    `$${item.price.toFixed(2)}`
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                 {editingItemId === item._id ? (
                                                     <>
                                                        <Button size="sm" onClick={handleSaveClick} disabled={updateMutation.isPending}>
                                                             {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => setEditingItemId(null)}>Cancelar</Button>
                                                     </>
                                                 ) : (
                                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Editar</Button>
                                                 )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}