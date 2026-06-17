'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <p className="text-[#E30613] text-xs font-montserrat-bold tracking-[0.2em] uppercase mb-3">
        N10K
      </p>
      <h1 className="font-montserrat-black text-2xl sm:text-3xl mb-2 text-center">
        Algo salió mal
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-8">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-[#E30613] text-white text-sm font-montserrat-bold uppercase tracking-wider hover:bg-[#ff2d34] transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl border border-border text-sm font-montserrat-bold uppercase tracking-wider text-center hover:border-[#E30613] hover:text-[#E30613] transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
