'use client';
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { miniatura, subirImagen } from '@/lib/upload';

/**
 * Subir una imagen sin pelear.
 *
 * Se arrastra, se pega desde el portapapeles o se toca para elegir. Muestra la
 * imagen que ya está antes de subir la nueva, y una barra que se mueve de
 * verdad mientras sube. Devuelve la URL de Cloudinary; el que llama decide qué
 * hacer con ella.
 */
export function SubirImagen({
  url,
  onSubida,
  onQuitar,
  etiqueta = 'Subí una imagen',
  ayuda,
}: {
  url: string | null;
  onSubida: (url: string) => void;
  onQuitar?: () => void;
  etiqueta?: string;
  ayuda?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [encima, setEncima] = useState(false);

  async function subir(file: File | null | undefined) {
    if (!file) return;
    setError(null);
    setPct(0);
    try {
      onSubida(await subirImagen(file, setPct));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPct(null);
    }
  }

  const subiendo = pct !== null;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setEncima(false);
          void subir(e.dataTransfer.files?.[0]);
        }}
        // Pegar funciona sin tocar nada más: en Windows la gente recorta la
        // captura, le da Ctrl+C y espera poder pegarla.
        onPaste={(e) => {
          const f = Array.from(e.clipboardData.files)[0];
          if (f) void subir(f);
        }}
        className="flex items-center gap-4 rounded-xl border border-dashed p-4 transition-colors"
        style={{
          borderColor: encima ? 'var(--color-accent)' : 'var(--color-border)',
          background: encima
            ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)'
            : 'var(--color-bg-2)',
        }}
      >
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={subiendo}
          aria-label={etiqueta}
          className="relative grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border transition-colors"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)', color: 'var(--color-muted-2)' }}
        >
          {url ? (
            <img src={miniatura(url, 256) ?? url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={26} strokeWidth={1.5} />
          )}
          {subiendo && (
            <span className="absolute inset-0 grid place-items-center" style={{ background: 'rgba(6,8,13,0.75)' }}>
              <Loader2 size={22} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          {subiendo ? (
            <>
              <p className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
                Subiendo… {pct}%
              </p>
              <span
                className="mt-2 block h-1.5 overflow-hidden rounded-full"
                style={{ background: 'var(--color-card-2)' }}
              >
                <span
                  className="block h-full rounded-full transition-[width]"
                  style={{ width: `${pct}%`, background: 'var(--color-accent)' }}
                />
              </span>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:border-[var(--color-accent)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <UploadCloud size={15} />
                  {url ? 'Cambiar' : etiqueta}
                </button>
                {url && onQuitar && (
                  <button
                    type="button"
                    onClick={onQuitar}
                    className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[#ff6b6b]"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    <Trash2 size={14} />
                    Quitar
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--color-muted-2)' }}>
                {ayuda ?? 'Arrastrala acá, pegala con Ctrl+V o tocá para elegirla.'}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs" style={{ color: '#ff8f8f' }}>
          {error}
        </p>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void subir(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
