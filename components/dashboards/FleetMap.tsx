// components/dashboards/FleetMap.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link'; // ✨ 1. IMPORTAMOS EL COMPONENTE LINK

// Definimos la interfaz para los datos de la máquina
interface MachineLocationData {
  _id: string;
  machineId: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  status: 'online' | 'offline' | 'low_stock' | 'maintenance' | 'error';
}

// Creamos una función específica para obtener los datos
const fetchMachinesData = async (): Promise<MachineLocationData[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/api/machines`);
  if (!response.ok) {
    throw new Error('No se pudo obtener la información de las máquinas');
  }
  return response.json();
};

// --- Funciones de utilidad para los íconos ---
const getStatusColor = (status: string): string => {
  return {
    online: 'green',
    offline: 'red',
    low_stock: 'orange',
    maintenance: 'blue',
    error: 'black'
  }[status] || 'gray';
};

const getMarkerIcon = (status: string) => {
  const color = getStatusColor(status);
  const iconHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" style="transform: translateZ(0);">
      <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
    </svg>`;
    
  return L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export function FleetMap() {
  const initialPosition: LatLngExpression = [20.6597, -103.3496];

  const { data: machines, isLoading, isError, error } = useQuery<MachineLocationData[]>({
    queryKey: ['machinesLocationData'],
    queryFn: fetchMachinesData,
  });

  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-lg" />;
  }

  if (isError) {
    return <div className="flex items-center justify-center h-full text-destructive">Error: {error.message}</div>;
  }
  
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <MapContainer center={initialPosition} zoom={13} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {machines?.map((machine: MachineLocationData) => (
        <Marker 
          key={machine._id} 
          position={[machine.location.latitude, machine.location.longitude]}
          icon={getMarkerIcon(machine.status)}
        >
          {/* ✨ 2. ACTUALIZAMOS EL POPUP PARA INCLUIR EL ENLACE */}
          <Popup>
            <div className="text-center font-sans">
              <b className="block text-base">{machine.location.name}</b>
              <span className="text-xs text-gray-500">ID: {machine.machineId}</span>
              <p className="my-1 text-sm">
                Estado: <b style={{ color: getStatusColor(machine.status) }}>{machine.status}</b>
              </p>
              <Link href={`/machines/${machine.machineId}`} className="text-sm text-blue-600 hover:underline font-semibold">
                Ver Detalles →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}