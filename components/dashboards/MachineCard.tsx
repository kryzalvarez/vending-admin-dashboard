// components/dashboards/MachineCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Wrench, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InventoryModal } from './InventoryModal'; // Importamos el modal de inventario

interface Machine {
  _id: string;
  machineId: string;
  model: string;
  status: 'online' | 'offline' | 'maintenance';
}

const statusConfig = {
  online: { text: 'Online', color: 'bg-green-500' },
  offline: { text: 'Offline', color: 'bg-red-500' },
  maintenance: { text: 'Mantenimiento', color: 'bg-blue-500' },
};

export function MachineCard({ machine }: { machine: Machine }) {
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const statusInfo = statusConfig[machine.status] || { text: 'Desconocido', color: 'bg-gray-500' };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${statusInfo.color}`}></span>
              <span className="text-sm font-medium">{statusInfo.text}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => alert('Función Editar Próximamente')}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => alert('Función Borrar Próximamente')}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle>{machine.machineId}</CardTitle>
          <CardDescription>{machine.model}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {/* Espacio para futuros KPIs */}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setInventoryOpen(true)}>
            Ver Inventario
          </Button>
        </CardFooter>
      </Card>

      {/* El Modal de Inventario que se abre al hacer clic */}
      <InventoryModal
        machineId={machine.machineId}
        isOpen={isInventoryOpen}
        onClose={() => setInventoryOpen(false)}
      />
    </>
  );
}