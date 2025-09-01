// app/(dashboard)/analytics/machines/page.tsx
"use client";

import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglo para el ícono por defecto de Leaflet que a veces se rompe con Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Interfaz para tipar los datos de la máquina ---
interface Machine {
  _id: string;
  machineId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'online' | 'offline' | 'maintenance';
}

// --- Función para obtener los datos desde tu API ---
async function fetchMachines(): Promise<Machine[]> {
  const res = await fetch('/api/machines'); // Asegúrate que la URL sea la correcta
  if (!res.ok) {
    throw new Error('No se pudieron obtener los datos de las máquinas');
  }
  return res.json();
}


export default function MachinesMapPage() {
  const { data: machines, isLoading, isError } = useQuery<Machine[]>({ 
    queryKey: ['machines'], 
    queryFn: fetchMachines 
  });

  if (isLoading) {
    return <div className="text-center p-10">Cargando máquinas...</div>;
  }

  if (isError) {
    return <div className="text-center p-10 text-red-500">Error al cargar los datos.</div>;
  }

  // 1. Filtro de seguridad: Nos aseguramos de que solo intentamos renderizar
  // máquinas que tengan una ubicación válida. Esto previene cualquier error futuro.
  const machinesWithLocation = machines?.filter(
    machine => machine && machine.location && typeof machine.location.latitude === 'number' && typeof machine.location.longitude === 'number'
  ) || [];

  return (
    <div className="h-[600px] w-full">
      <MapContainer 
        center={[20.6597, -103.3496]} // Coordenadas de Guadalajara para centrar el mapa
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* 2. Mapeo con los datos correctos y seguros */}
        {machinesWithLocation.map((machine) => (
          <Marker 
            key={machine._id} 
            position={[machine.location.latitude, machine.location.longitude]}
          >
            <Popup>
              <b>Máquina:</b> {machine.machineId} <br />
              <b>Estatus:</b> {machine.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}