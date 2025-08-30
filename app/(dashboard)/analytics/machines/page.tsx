'use client';
export const dynamic = 'force-dynamic';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertTriangle } from 'lucide-react';

// --- Interfaces para los datos ---
interface TopMachine {
    _id: string;
    totalRevenue: number;
    totalSales: number;
}
interface SalesPerformanceData {
    topMachines: TopMachine[];
}

// --- Función de Fetching para React Query ---
const fetchSalesPerformance = async (): Promise<SalesPerformanceData> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/analytics/sales-performance`);
    if (!response.ok) {
        throw new Error("No se pudieron cargar los datos de rendimiento");
    }
    return response.json();
};


export default function MachineAnalyticsPage() {
    const { data, isLoading, isError, error } = useQuery<SalesPerformanceData>({
        queryKey: ['salesPerformanceMetrics'],
        queryFn: fetchSalesPerformance,
    });

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Bot className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <CardTitle>Rendimiento General de Máquinas</CardTitle>
                        <CardDescription>Análisis de todas las máquinas basado en ingresos generados.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ) : isError ? (
                        <div className="text-red-500 flex items-center gap-2 justify-center p-4">
                            <AlertTriangle size={16} /> Error: {error.message}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Máquina</TableHead>
                                    <TableHead className="text-center">Ventas Totales</TableHead>
                                    <TableHead className="text-right">Ingresos Totales</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.topMachines && data.topMachines.length > 0 ? (
                                    data.topMachines.map((machine) => (
                                        <TableRow key={machine._id}>
                                            <TableCell className="font-medium">{machine._id}</TableCell>
                                            <TableCell className="text-center">{machine.totalSales}</TableCell>
                                            <TableCell className="text-right font-semibold">${machine.totalRevenue.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No hay datos de rendimiento disponibles.
                                        </TableCell>
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
