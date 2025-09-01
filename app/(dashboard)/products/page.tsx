// app/(dashboard)/products/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ProductTable } from '@/components/dashboards/ProductTable';
import { ProductForm } from '@/components/dashboards/ProductForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Importa los componentes de Card

// --- Interfaz para los datos del producto ---
interface Product {
    _id: string;
    name: string;
    sku: string;
    description: string;
}

// --- Función para obtener los datos desde tu API ---
async function fetchProducts(): Promise<Product[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error("API URL no está configurada.");

    const res = await fetch(`${apiUrl}/api/products`);
    if (!res.ok) throw new Error('No se pudieron obtener los datos de los productos');
    
    return res.json();
}

export default function ProductsPage() {
    const [isFormOpen, setFormOpen] = useState(false);

    const { data: products, isLoading, isError, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    if (isLoading) {
        return <p className="text-center p-10 text-muted-foreground">Cargando productos...</p>;
    }

    if (isError) {
        return <p className="text-center p-10 text-red-500">Error: {error.message}</p>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
                    <p className="text-muted-foreground">
                        Gestiona todos los productos disponibles en tu sistema.
                    </p>
                </div>
                <Button onClick={() => setFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            {products && products.length > 0 ? (
                // Reutilicé ProductTable pero lo envolví en Card para consistencia
                // Si ya tienes Card dentro de ProductTable, puedes quitarlo de aquí.
                <ProductTable products={products} />
            ) : (
                <Card className="text-center py-10">
                    <CardHeader>
                        <CardTitle>No hay productos</CardTitle>
                        <CardDescription>Aún no has añadido ningún producto. ¡Agrega el primero!</CardDescription>
                    </CardHeader>
                </Card>
            )}

            <ProductForm
                isOpen={isFormOpen}
                onClose={() => setFormOpen(false)}
            />
        </div>
    );
}