import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada — Weso",
};

export default function NotFound() {
  return (
    <main className="not-found">
      <Link className="not-found-brand" href="/" aria-label="Weso, ir al inicio">
        <Image src="/assets/p1-2.png" alt="Weso" width={400} height={400} priority unoptimized />
      </Link>
      <p className="not-found-code">Error 404</p>
      <h1>No encontramos esta página.</h1>
      <p className="not-found-lead">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <Link className="not-found-link" href="/">Volver al inicio</Link>
    </main>
  );
}
