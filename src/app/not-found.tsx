import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <p className="text-[#E30613] text-xs font-montserrat-bold tracking-[0.2em] uppercase mb-3">
        N10K
      </p>
      <h1 className="font-montserrat-black text-6xl sm:text-8xl text-[#E30613] mb-2">404</h1>
      <h2 className="font-montserrat-black text-xl sm:text-2xl mb-2 text-center">
        Página no encontrada
      </h2>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-8">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[#E30613] text-white text-sm font-montserrat-bold uppercase tracking-wider hover:bg-[#ff2d34] transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
