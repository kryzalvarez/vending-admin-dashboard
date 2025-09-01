// components/dashboards/AssignProductForm.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Interfaces ---
interface Product {
  _id: string;
  name: string;
  sku: string;
}

interface AssignPayload {
  machineId: string;
  productId: string;
  channelId: string;
  quantity: number;
  price: number;
}

// --- Funciones para llamar a la API ---
async function fetchProducts(): Promise<Product[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/products`);
    if (!response.ok) throw new Error('No se pudieron obtener los productos');
    return response.json();
}

async function assignProduct(payload: AssignPayload) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('No se pudo asignar el producto');
    return response.json();
}


export function AssignProductForm({ machineId, onFinished }: { machineId: string, onFinished: () => void }) {
    const queryClient = useQueryClient();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [channelId, setChannelId] = useState('');
    const [quantity, setQuantity] = useState(10);
    const [price, setPrice] = useState(0);
    const [isComboOpen, setComboOpen] = useState(false);

    // Obtener la lista de todos los productos para el buscador
    const { data: products } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    // Mutación para enviar los datos del nuevo item de inventario
    const mutation = useMutation({
        mutationFn: assignProduct,
        onSuccess: () => {
            // Refresca la lista de inventario de la máquina para ver el nuevo producto
            queryClient.invalidateQueries({ queryKey: ['inventory', machineId] });
            onFinished(); // Cierra el formulario
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            alert("Por favor, selecciona un producto.");
            return;
        }
        mutation.mutate({
            machineId,
            productId: selectedProduct._id,
            channelId,
            quantity,
            price
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4 border-t mt-4 pt-6">
             <h3 className="text-lg font-medium text-center mb-4">Asignar Nuevo Producto</h3>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">Producto</Label>
                <Popover open={isComboOpen} onOpenChange={setComboOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full col-span-3 justify-between"
                        >
                            {selectedProduct ? selectedProduct.name : "Selecciona un producto..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar producto..." />
                            <CommandList>
                                <CommandEmpty>No se encontró el producto.</CommandEmpty>
                                <CommandGroup>
                                    {products?.map((product) => (
                                        <CommandItem
                                            key={product._id}
                                            value={product.name}
                                            onSelect={() => {
                                                setSelectedProduct(product);
                                                setComboOpen(false);
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", selectedProduct?._id === product._id ? "opacity-100" : "opacity-0")} />
                                            {product.name} ({product.sku})
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="channelId" className="text-right">Canal/Slot</Label>
                <Input id="channelId" value={channelId} onChange={(e) => setChannelId(e.target.value.toUpperCase())} className="col-span-3" required placeholder="Ej: A1"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Cantidad</Label>
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Precio ($)</Label>
                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="col-span-3" required placeholder="Ej: 18.50" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="outline" onClick={onFinished}>Cancelar</Button>
                 <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Asignando..." : "Asignar Producto"}
                </Button>
            </div>
             {mutation.isError && <p className="text-sm text-red-500 text-right mt-2">Error: {mutation.error.message}</p>}
        </form>
    );
}