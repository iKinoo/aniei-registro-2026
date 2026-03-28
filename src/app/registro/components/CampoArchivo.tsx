'use client';

import { useRef, useState } from 'react';

interface CampoArchivoProps {
  name: string;
  error?: string;
}

export function CampoArchivo({ name, error }: CampoArchivoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      setPreview(null);
      return;
    }
    setFileName(file.name);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Comprobante de pago <span className="text-red-500">*</span>
      </label>
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-400"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/png,image/jpeg,application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="mx-auto max-h-40 rounded" />
        ) : (
          <div className="text-gray-500">
            <p className="text-sm">Click para seleccionar archivo</p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG o PDF (máx. 5 MB)</p>
          </div>
        )}
        {fileName && (
          <p className="mt-2 text-xs text-gray-600">{fileName}</p>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
