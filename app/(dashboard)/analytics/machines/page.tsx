// app/(dashboard)/machines/page.tsx (Versión Final y Correcta)
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { MachineCard } from '@/components/dashboards/MachineCard';
import { MachineForm } from '@/components/dashboards/MachineForm';

// --- Interfaz para asegurar que los datos son correctos ---
interface Machine {
  _id: string;
  machineId: string;
  model: string;
  status: 'online' | 'offline' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
  };
}

// --- Función para obtener los datos desde tu API ---
async function fetchMachines(): Promise<Machine[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("API URL no está configurada. Revisa tus variables de entorno.");
  }
  
  const res = await fetch(`${apiUrl}/api/machines`);
  if (!res.ok) {
    throw new Error('No se pudieron obtener los datos de las máquinas');
  }
  
  return res.json();
}

export default function MachinesPage() {
  // Estado para controlar si el modal para agregar una máquina está abierto o cerrado
  const [isFormModalOpen, setFormModalOpen] = useState(false);

  // Hook de React Query para obtener los datos de las máquinas
  const { data: machines, isLoading, isError, error } = useQuery<Machine[]>({
    queryKey: ['machines'], // Clave única para esta consulta de datos
    queryFn: fetchMachines,
  });

  // Muestra un mensaje mientras se cargan los datos
  if (isLoading) {
    return <div className="text-center p-10 text-muted-foreground">Cargando máquinas...</div>;
  }

  // Muestra un mensaje si la carga de datos falla
  if (isError) {
    return <div className="text-center p-10 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado de la página con el título y el botón de acción principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Flota</h1>
          <p className="text-muted-foreground">
            Administra y monitorea todas tus máquinas expendedoras.
          </p>
        </div>
        <Button onClick={() => setFormModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Máquina
        </Button>
      </div>

      {/* Cuadrícula responsive para mostrar las tarjetas de las máquinas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {machines?.map((machine) => (
          <MachineCard key={machine._id} machine={machine} />
        ))}
      </div>
      
      {/* Si no hay máquinas, muestra un mensaje amigable */}
      {machines?.length === 0 && (
          <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No se encontraron máquinas. ¡Agrega la primera!</p>
          </div>
      )}

      {/* Renderiza el modal para agregar máquinas, controlado por el estado */}
      <MachineForm
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
      />
    </div>
  );
}