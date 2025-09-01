// components/dashboards/FleetMap.tsx (Versión Final y Completa)
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

// --- Arreglo para el ícono por defecto de Leaflet ---
// Previene un error común con Next.js donde los íconos no aparecen.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Interfaz para los datos (sincronizada con tu backend) ---
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
const fetchMachines = async (): Promise<Machine[]> => {
  // 👇 CORRECCIÓN CRÍTICA: Usamos la variable de entorno para la URL del backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("La URL de la API no está configurada.");
  }
  
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
    maintenance: 'blue',
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

  const { data: machines, isLoading, isError, error } = useQuery<Machine[]>({
    queryKey: ['machinesLocationData'],
    queryFn: fetchMachines,
  });

  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-lg" />;
  }

  if (isError) {
    return <div className="flex items-center justify-center h-full text-destructive">Error: {(error as Error).message}</div>;
  }

  // 👇 Filtro de seguridad para asegurar que solo renderizamos máquinas con datos de ubicación válidos.
  const machinesWithLocation = machines?.filter(
    m => m && m.location && typeof m.location.latitude === 'number' && typeof m.location.longitude === 'number'
  ) || [];

  return (
    // 👇 Este div contenedor es la solución definitiva al problema de los mapas flotantes.
    <div className="h-full w-full">
      <MapContainer 
        center={initialPosition} 
        zoom={12} 
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {machinesWithLocation.map((machine) => (
          <Marker 
            key={machine._id} 
            position={[machine.location.latitude, machine.location.longitude]}
            icon={getMarkerIcon(machine.status)}
          >
            <Popup>
              <div className="text-center font-sans">
                <b className="block text-base">{machine.machineId}</b>
                <p className="my-1 text-sm">
                  Estado: <b style={{ color: getStatusColor(machine.status) }}>{machine.status}</b>
                </p>
                <Link href={`/analytics/machines`} className="text-sm text-blue-600 hover:underline font-semibold">
                  Ver Detalles →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}