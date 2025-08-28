// app/(dashboard)/layout.tsx (Versión Corregida y Robusta)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Si no hay token, redirigir al login.
      router.push('/login');
    } else {
      // Si hay token, permitimos que se muestre el contenido.
      setIsVerified(true);
    }
  }, [router]);

  // Si la verificación está completa y el usuario está autenticado, muestra la página.
  if (isVerified) {
    return <>{children}</>;
  }

  // Si no, no se muestra nada. El usuario está siendo redirigido
  // o la verificación aún no termina. Esto evita el "parpadeo" del contenido protegido.
  return null;
}