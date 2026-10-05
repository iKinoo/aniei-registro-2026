import Image from 'next/image';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="w-full bg-[#003973] shadow-sm">
      <Link href="/" aria-label="Inicio — Congreso ANIEI 2026">
        <Image
          src="/header_aniei.png"
          alt="Congreso ANIEI 2026"
          width={1170}
          height={120}
          priority
          className="mx-auto h-auto w-full max-w-7xl"
        />
      </Link>
    </header>
  );
}
