// app/(dashboard)/sales/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';

// --- Interfaces para los datos de la API ---
interface TopProduct {
    _id: string; // Product Name
    totalRevenue: number;
    totalUnitsSold: number;
}

interface TopMachine {
    _id: string; // Machine ID
    totalRevenue: number;
}

interface SalesPerformanceData {
    topProducts: TopProduct[];
    topMachines: TopMachine[];
}

// --- Función de Fetching ---
const fetchSalesPerformance = async (filters: { startDate: string, endDate: string }): Promise<SalesPerformanceData> => {
    const { startDate, endDate } = filters;
    if (!startDate || !endDate) {
        return { topProducts: [], topMachines: [] };
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/analytics/sales-performance?startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) {
        throw new Error('No se pudo obtener la información de ventas');
    }
    return response.json();
};

export default function SalesDashboardPage() {
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery<SalesPerformanceData>({
        queryKey: ['salesPerformance', filters],
        queryFn: () => fetchSalesPerformance(filters),
        enabled: false,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleApplyFilters = () => {
        refetch();
    };
    
    // Ejecuta la consulta una vez al cargar la página con las fechas por defecto
    useState(() => {
        handleApplyFilters();
    });

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Análisis de Rendimiento de Ventas</CardTitle>
                    <CardDescription>Filtra por un rango de fechas para analizar los datos.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    <Button onClick={handleApplyFilters} disabled={isFetching}>
                        {isFetching ? 'Cargando...' : 'Aplicar Filtros'}
                    </Button>
                </CardContent>
            </Card>

            {isError && (
                <div className="text-red-500 flex items-center gap-2"><AlertTriangle size={16} /> Error: {error.message}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Productos por Ingresos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data?.topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                                <YAxis type="category" dataKey="_id" width={120} interval={0} />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="totalRevenue" name="Ingresos" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Máquinas por Ingresos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data?.topMachines}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis tickFormatter={(value) => `$${value}`} />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="totalRevenue" name="Ingresos" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}