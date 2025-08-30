// app/(dashboard)/machines/[machineId]/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Save, X, Activity, DollarSign, Clock } from 'lucide-react';

// --- Definición de Tipos (Interfaces) ---
interface MachineDetailsData {
    _id: string;
    machineId: string;
    location: { name: string; latitude: number; longitude: number; };
    status: string;
    lastHeartbeat: string;
}

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

// --- Componente Reutilizable para KPIs de la Máquina ---
const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

// --- Funciones de Fetching para React Query ---
const fetchMachineDetails = async (machineId: string): Promise<MachineDetailsData> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/machines/${machineId}`);
    if (!response.ok) throw new Error('No se encontraron datos para esta máquina');
    return response.json();
};

const fetchInventory = async (machineId: string): Promise<InventoryItem[]> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/machines/${machineId}/inventory`);
    if (!response.ok) throw new Error('No se pudo cargar el inventario');
    return response.json();
};

const updateInventoryItem = async ({ itemId, data }: { itemId: string; data: { quantity: number; price: number } }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al guardar los cambios');
    return response.json();
};


export default function MachineDetailPage({ params }: { params: { machineId: string } }) {
    const { machineId } = params;
    const queryClient = useQueryClient();

    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<EditFormData>({ quantity: '', price: '' });

    const { data: machine, isLoading: isLoadingMachine, isError: isErrorMachine } = useQuery({
        queryKey: ['machineDetails', machineId],
        queryFn: () => fetchMachineDetails(machineId),
    });

    const { data: inventory, isLoading: isLoadingInventory } = useQuery({
        queryKey: ['inventory', machineId],
        queryFn: () => fetchInventory(machineId),
    });
    
    const mutation = useMutation({
        mutationFn: updateInventoryItem,
        onSuccess: (updatedItem) => {
            queryClient.setQueryData(['inventory', machineId], (oldData: InventoryItem[] | undefined) =>
                oldData?.map(item => item._id === updatedItem._id ? updatedItem : item) || []
            );
            setEditingItemId(null);
        },
        onError: (error) => {
            console.error("Error al guardar:", error);
        }
    });

    const handleEditClick = (item: InventoryItem) => {
        setEditingItemId(item._id);
        setEditFormData({ quantity: item.quantity.toString(), price: item.price.toFixed(2) });
    };
    const handleCancelClick = () => setEditingItemId(null);
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleSaveClick = (itemId: string) => {
        mutation.mutate({ itemId, data: { quantity: Number(editFormData.quantity), price: Number(editFormData.price) } });
    };
    
    if (isLoadingMachine) return <p className="text-center p-10">Cargando detalles de la máquina...</p>;
    if (isErrorMachine) return <p className="text-center p-10 text-destructive">Error al cargar la información de la máquina.</p>;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
                    <ArrowLeft size={16} /> Volver al Dashboard
                </Link>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{machine?.location.name}</h1>
                        <p className="text-muted-foreground">ID: {machineId}</p>
                    </div>
                    <Button asChild variant="outline" className="mt-4 sm:mt-0">
                        <Link href={`/sales?machineId=${machineId}`}>Ver Historial de Ventas</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Estado Actual" 
                    value={machine?.status ? machine.status.charAt(0).toUpperCase() + machine.status.slice(1) : 'Desconocido'} 
                    icon={Activity} 
                />
                <StatCard 
                    title="Último Contacto" 
                    value={machine?.lastHeartbeat ? new Date(machine.lastHeartbeat).toLocaleString('es-MX') : 'Nunca'} 
                    icon={Clock} 
                />
                <StatCard 
                    title="Ingresos (Mes)" 
                    value="$0.00" // Placeholder
                    icon={DollarSign} 
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventario de la Máquina</CardTitle>
                    <CardDescription>Visualiza y gestiona los productos y sus cantidades.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingInventory ? <Skeleton className="h-40 w-full" /> : (
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
                                {inventory && inventory.length > 0 ? (
                                    inventory.map((item) => (
                                        <TableRow key={item._id}>
                                            {editingItemId === item._id ? (
                                                <>
                                                    <TableCell className="font-medium">{item.channelId}</TableCell>
                                                    <TableCell>{item.productId.name}</TableCell>
                                                    <TableCell><Input type="number" name="quantity" value={editFormData.quantity} onChange={handleFormChange} className="h-8"/></TableCell>
                                                    <TableCell><Input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleFormChange} className="h-8"/></TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button onClick={() => handleSaveClick(item._id)} size="sm" disabled={mutation.isPending}><Save size={14}/></Button>
                                                        <Button onClick={handleCancelClick} variant="outline" size="sm"><X size={14}/></Button>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell className="font-medium">{item.channelId}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{item.productId.name}</div>
                                                        <div className="text-xs text-muted-foreground">SKU: {item.productId.sku}</div>
                                                    </TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>${item.price.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button onClick={() => handleEditClick(item)} variant="outline" size="sm"><Edit size={14} className="mr-2"/>Editar</Button>
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No hay inventario configurado para esta máquina.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}