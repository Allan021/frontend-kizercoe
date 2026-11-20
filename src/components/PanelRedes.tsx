import { useEffect, useMemo, useState } from 'react';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/**
 * Redes: el calendario de posts y la biblioteca de videos y fotos, en un solo
 * lugar. Solo lectura: los datos salen de /redes/redes.json, que arma
 * marketing/al-panel.mjs a partir de posts.json y media/. Para cambiar un post
 * se edita posts.json; para programarlo en Facebook, publicar.mjs.
 */

type Post = { fecha: string; tipo: 'reel' | 'foto' | 'texto'; texto: string; link: string | null; programado: boolean; archivo: string | null; portada: string | null };
type Archivo = { nombre: string; tipo: 'video' | 'foto'; fechas: string[]; archivo: string; portada: string };
type Datos = { generado: string; calendario: Post[]; biblioteca: Archivo[] };

// Las fechas del calendario están en hora de Honduras (sin horario de verano).
const cuando = (f: string) => new Date(f + ':00-06:00');
const fechaCorta = (f: string) => cuando(f).toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Tegucigalpa' });

function Media({ archivo, portada }: { archivo: string | null; portada: string | null }) {
  if (!archivo) return <div className="grid aspect-[9/16] place-items-center bg-muted text-sm text-muted-foreground">Solo texto</div>;
  return archivo.endsWith('.mp4')
    ? <video controls playsInline preload="none" poster={portada ?? undefined} src={archivo} className="aspect-[9/16] w-full bg-black object-contain" />
    : <img src={archivo} alt="" loading="lazy" className="aspect-[9/16] w-full bg-black object-contain" />;
}

const copiar = (t: string) => navigator.clipboard.writeText(t).then(() => toast.success('Texto copiado'), () => toast.error('No se pudo copiar'));

export function PanelRedes() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState(false);
  const [vista, setVista] = useState<'proximos' | 'pasados' | 'biblioteca'>('proximos');

  useEffect(() => {
    fetch('/redes/redes.json').then((r) => (r.ok ? r.json() : Promise.reject())).then(setDatos).catch(() => setError(true));
  }, []);

  const { proximos, pasados } = useMemo(() => {
    const ahora = Date.now();
    const cal = datos?.calendario ?? [];
    return { proximos: cal.filter((p) => cuando(p.fecha).getTime() >= ahora), pasados: cal.filter((p) => cuando(p.fecha).getTime() < ahora).reverse() };
  }, [datos]);

  const VISTAS = [
    { id: 'proximos' as const, etiqueta: 'Próximos', n: proximos.length },
    { id: 'pasados' as const, etiqueta: 'Ya pasaron', n: pasados.length },
    { id: 'biblioteca' as const, etiqueta: 'Biblioteca', n: datos?.biblioteca.length ?? 0 },
  ];
  const posts = vista === 'proximos' ? proximos : pasados;

  return (
    <section>
      <div className="mb-6">
        <h2 className="kzp-titulo">Redes</h2>
        <p className="kzp-sub">El calendario de Facebook, Instagram y TikTok, y todos los videos y fotos. Copiá el texto y descargá el archivo para publicarlo donde haga falta.</p>
      </div>
      {error && <p className="text-sm text-muted-foreground">No hay datos de redes todavía. Corré <code>node al-panel.mjs</code> en la carpeta marketing y subí el frontend.</p>}
      {!datos && !error && <div className="kzp-esqueleto h-[300px]" />}
      {datos && (
        <>
          <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Redes">
            {VISTAS.map((v) => (
              <button key={v.id} role="tab" aria-selected={vista === v.id} onClick={() => setVista(v.id)} className={`kz-tab inline-flex items-center gap-1.5 ${vista === v.id ? 'kz-tab-activa' : ''}`}>
                {v.etiqueta} <span className="font-mono text-[11.5px] opacity-70">{v.n}</span>
              </button>
            ))}
          </div>

          {vista !== 'biblioteca' && posts.length === 0 && <p className="text-sm text-muted-foreground">Nada por acá.</p>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vista !== 'biblioteca' && posts.map((p) => (
              <article key={p.fecha} className="overflow-hidden rounded-2xl border bg-card">
                <Media archivo={p.archivo} portada={p.portada} />
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[13px]">
                    <span className="font-semibold capitalize">{fechaCorta(p.fecha)} · {p.fecha.slice(11)}</span>
                    <span className="kzp-chip capitalize">{p.tipo}</span>
                    {/* "Programado" solo lo sabe publicar.mjs (publicados.json); lo demás es por fecha. */}
                    {p.programado
                      ? <span className="kzp-chip" style={{ ['--kzp-tono' as string]: 'var(--kzp-azul)' }}>Programado en Facebook</span>
                      : vista === 'proximos' && <span className="kzp-chip" style={{ ['--kzp-tono' as string]: 'var(--kzp-ambar)' }}>Sin programar</span>}
                  </div>
                  <p className="line-clamp-5 whitespace-pre-line text-[13.5px] text-muted-foreground">{p.texto}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => copiar(p.texto)}><Copy /> Copiar texto</Button>
                    {p.archivo && <Button size="sm" variant="outline" asChild><a href={p.archivo} download><Download /> Descargar</a></Button>}
                    {p.link && <Button size="sm" variant="ghost" asChild><a href={p.link} target="_blank" rel="noreferrer"><ExternalLink /> Enlace</a></Button>}
                  </div>
                </div>
              </article>
            ))}
            {vista === 'biblioteca' && datos.biblioteca.map((a) => (
              <article key={a.nombre} className="overflow-hidden rounded-2xl border bg-card">
                <Media archivo={a.archivo} portada={a.portada} />
                <div className="space-y-2 p-4">
                  <p className="truncate font-mono text-[13px] font-semibold">{a.nombre}</p>
                  <p className="text-[13px] text-muted-foreground">{a.fechas.length ? `En el calendario: ${a.fechas.map(fechaCorta).join(', ')}` : 'Sin fecha en el calendario'}</p>
                  <Button size="sm" variant="outline" asChild><a href={a.archivo} download><Download /> Descargar</a></Button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Copia liviana para revisar; el archivo original a toda calidad está en marketing/media. Actualizado {new Date(datos.generado).toLocaleString('es-HN')}.</p>
        </>
      )}
    </section>
  );
}
