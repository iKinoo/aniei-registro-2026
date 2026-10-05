import Image from 'next/image';
import { version } from '../../../package.json';

export default function SiteVersion() {
  return (
    <div className="fixed bottom-2 right-3 z-50 select-none rounded-lg bg-[#003973] px-3 py-2 text-right leading-tight shadow-lg">
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm font-medium text-white">Desarrollado por</span>
        <a
          href="https://matematicas.uady.mx/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="UADY"
          className="inline-flex items-center"
        >
          <Image
            src="/UADY_logo.svg"
            alt="UADY"
            width={1863}
            height={1020}
            unoptimized
            className="h-8 w-auto brightness-0 invert"
          />
        </a>
      </div>
      <div className="text-sm text-slate-400">v{version}</div>
    </div>
  );
}
