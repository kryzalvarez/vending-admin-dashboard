// components/dashboards/MachineForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// La función que llama a la API para crear la máquina
async function createMachine(newMachine: any) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${apiUrl}/api/machines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMachine),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || 'No se pudo crear la máquina');
  }
  return response.json();
}

export function MachineForm({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    machineId: '',
    model: '',
    latitude: '',
    longitude: ''
  });

  const mutation = useMutation({
    mutationFn: createMachine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      onClose();
      setFormData({ machineId: '', model: '', latitude: '', longitude: '' }); // Limpiar formulario
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMachine = {
      machineId: formData.machineId,
      model: formData.model,
      location: {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      }
    };
    mutation.mutate(newMachine);
  };
  
  // Renombramos el componente para evitar conflictos de nombre
  const FormDialog = Dialog;

  return (
    <FormDialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Máquina</DialogTitle>
          <DialogDescription>
            Completa los detalles para registrar una nueva máquina en la flota.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="machineId" className="text-right">ID Máquina</Label>
              <Input id="machineId" value={formData.machineId} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">Modelo</Label>
              <Input id="model" value={formData.model} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitude" className="text-right">Latitud</Label>
              <Input id="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longitude" className="text-right">Longitud</Label>
              <Input id="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Máquina'}
            </Button>
          </DialogFooter>
        </form>
        {mutation.isError && <p className="text-sm text-red-500 mt-2 text-center">Error: {mutation.error.message}</p>}
      </DialogContent>
    </FormDialog>
  );
}