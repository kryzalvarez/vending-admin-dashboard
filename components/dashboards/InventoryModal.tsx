// components/dashboards/InventoryModal.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Importa Card

interface InventoryItem {
    _id: string;
    productId: { name: string; sku: string; };
    quantity: number;
    price: number;
    channelId: string;
}

async function fetchInventory(machineId: string): Promise<InventoryItem[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/machines/${machineId}/inventory`);
    if (!response.ok) {
        throw new Error('No se pudo cargar el inventario');
    }
    return response.json();
}

export function InventoryModal({ machineId, isOpen, onClose }: { machineId: string, isOpen: boolean, onClose: () => void }) {
    const { data: inventory, isLoading, isError, error } = useQuery<InventoryItem[]>({
        queryKey: ['inventory', machineId],
        queryFn: () => fetchInventory(machineId),
        enabled: isOpen, // Solo ejecuta la query cuando el modal está abierto
    });

    const FormDialog = Dialog;

    return (
        <FormDialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Inventario de la Máquina: {machineId}</DialogTitle>
                    <DialogDescription>
                        Visualiza y gestiona los productos asignados a esta máquina.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isLoading && <p>Cargando inventario...</p>}
                    {isError && <p className="text-red-500">Error: {error.message}</p>}
                    {inventory && (
                        <Card>
                            <CardContent className="p-0">
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
                                                <TableCell>{item.productId.name}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm">Editar</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </FormDialog>
    );
}