"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PublicCreatePostPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página unificada de creación
    router.replace('/publicaciones/crear');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
