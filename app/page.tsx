// app/page.tsx (Versión Final con Refresco Automático)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Machine {
  _id: string;
  machineId: string;
  location: string;
  status: string;
}

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Esta función ahora se puede reutilizar
  const fetchMachines = async () => {
    try {
      // --- LÍNEA CORREGIDA ---
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/machines`);
      // --- FIN DE LA CORRECCIÓN ---

      if (!response.ok) {
        throw new Error('La respuesta de la red no fue exitosa');
      }
      const data = await response.json();
      setMachines(data);
    } catch (error: any) {
      setError(error.message);
      console.error("Error al obtener las máquinas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Carga los datos la primera vez
    fetchMachines();

    // 2. Configura un intervalo para que se ejecute cada 10 segundos
    const interval = setInterval(() => {
      console.log("🔄 Refrescando lista de máquinas...");
      fetchMachines();
    }, 10000); // 10000 milisegundos = 10 segundos

    // 3. Limpia el intervalo cuando el usuario sale de la página para evitar fugas de memoria
    return () => clearInterval(interval);
  }, []); // El array vacío asegura que esto se configure solo una vez

  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Portal de Administración Vending</h1>
        <p className="text-lg text-gray-600 mb-8">Gestiona tus máquinas, inventario y ventas desde un solo lugar.</p>
        <Link href="/sales" className="mb-8 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            Ver Historial de Ventas
        </Link>
      </div>
      
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lista de Máquinas</h2>
        
        {loading && <p className="text-gray-500">Cargando máquinas...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {!loading && !error && (
          <ul className="space-y-2">
            {machines.map((machine) => (
              <li key={machine._id}>
                <Link href={`/machines/${machine.machineId}`} className="block p-4 border rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{machine.machineId}</p>
                      <p className="text-sm text-gray-600">{machine.location}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${ 
                      machine.status === 'online' ? 'bg-green-100 text-green-800' : 
                      machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800' 
                    }`}>
                      {machine.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
         {machines.length === 0 && !loading && !error && (
           <p className="text-center text-gray-500 py-4">No se encontraron máquinas.</p>
         )}
      </div>
    </main>
  );
}
