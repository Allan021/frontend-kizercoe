import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Un error del backend explicado en una línea, con reintento. "Route not
 * found" quiere decir que el servidor en Railway todavía corre una versión
 * sin esa ruta: no es un bug del panel, es un despliegue pendiente.
 */
export const esRutaVieja = (e: unknown) => e instanceof Error && /route not found|not found/i.test(e.message);

export function AvisoError({ error, onReintentar }: { error: string; onReintentar?: () => void }) {
  const vieja = /route not found/i.test(error);
  return (
    <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'color-mix(in srgb, var(--kzp-ambar) 45%, transparent)', background: 'color-mix(in srgb, var(--kzp-ambar) 10%, transparent)' }}>
      <AlertTriangle size={16} className="shrink-0" style={{ color: 'var(--kzp-ambar)' }} />
      <span className="min-w-0 flex-1">
        {vieja ? (
          <>El servidor en Railway todavía corre la versión vieja: esta sección no carga hasta que despliegue. Entrá a Railway → Deployments → Redeploy.</>
        ) : (
          error
        )}
      </span>
      {onReintentar && <Button variant="outline" size="sm" onClick={onReintentar}><RefreshCw /> Reintentar</Button>}
    </div>
  );
}
