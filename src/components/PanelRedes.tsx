import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Download, ExternalLink, Facebook, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { panelEditarPostRed, panelQuitarPostRed, panelRedes, type PostRed } from '@/lib/api';

/**
 * Redes: el calendario de posts y la biblioteca de videos y fotos.
 *
 * El calendario viene de la API (/v1/panel/redes): lo arma y programa el
 * script de marketing, y acá se puede cambiar el texto o la fecha de un post
 * antes de que salga, o quitarlo. Cada cambio se hace en Facebook primero.
 * La biblioteca sale de /redes/redes.json (marketing/al-panel.mjs).
 */

type Archivo = { nombre: string; tipo: 'video' | 'foto'; fechas: string[]; archivo: string; portada: string };

const TZ = 'America/Tegucigalpa';
const fechaCorta = (iso: string) => new Date(iso).toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-HN', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
// Honduras no tiene horario de verano: siempre UTC-6. Para el campo de fecha y hora.
const aCampo = (iso: string) => new Date(new Date(iso).getTime() - 6 * 3600_000).toISOString().slice(0, 16);
const deCampo = (v: string) => new Date(`${v}:00-06:00`).toISOString();

const REDES: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok' };

function Media({ archivo, portada }: { archivo: string | null; portada: string | null }) {
  if (!archivo) return <div className="grid aspect-[9/16] place-items-center bg-muted text-sm text-muted-foreground">Solo texto</div>;
  return archivo.endsWith('.mp4')
    ? <video controls playsInline preload="none" poster={portada ?? undefined} src={archivo} className="aspect-[9/16] w-full bg-black object-contain" />
    : <img src={archivo} alt="" loading="lazy" className="aspect-[9/16] w-full bg-black object-contain" />;
}

const copiar = (t: string) => navigator.clipboard.writeText(t).then(() => toast.success('Texto copiado'), () => toast.error('No se pudo copiar'));

export function PanelRedes() {
  const [posts, setPosts] = useState<PostRed[] | null>(null);
  const [biblioteca, setBiblioteca] = useState<Archivo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [vista, setVista] = useState<'proximos' | 'pasados' | 'biblioteca'>('proximos');
  const [editando, setEditando] = useState<PostRed | null>(null);
  const [texto, setTexto] = useState('');
  const [fecha, setFecha] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [quitando, setQuitando] = useState<PostRed | null>(null);

  const cargar = useCallback(() => {
    panelRedes().then(setPosts).catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar'));
  }, []);
  useEffect(() => {
    cargar();
    fetch('/redes/redes.json').then((r) => (r.ok ? r.json() : { biblioteca: [] })).then((j) => setBiblioteca(j.biblioteca ?? [])).catch(() => {});
  }, [cargar]);

  const { proximos, pasados } = useMemo(() => {
    const ahora = Date.now();
    const cal = posts ?? [];
    return { proximos: cal.filter((p) => new Date(p.fecha).getTime() >= ahora), pasados: cal.filter((p) => new Date(p.fecha).getTime() < ahora).reverse() };
  }, [posts]);

  function abrir(p: PostRed) {
    setEditando(p);
    setTexto(p.texto);
    setFecha(aCampo(p.fecha));
  }

  async function guardar() {
    if (!editando) return;
    setGuardando(true);
    try {
      const nuevo = await panelEditarPostRed(editando.id, { texto, fecha: deCampo(fecha) });
      setPosts((l) => (l ?? []).map((p) => (p.id === nuevo.id ? nuevo : p)).sort((a, b) => a.fecha.localeCompare(b.fecha)));
      setEditando(null);
      toast.success(editando.fbId ? 'Guardado y actualizado en Facebook' : 'Guardado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  }

  async function quitar() {
    if (!quitando) return;
    try {
      await panelQuitarPostRed(quitando.id);
      setPosts((l) => (l ?? []).filter((p) => p.id !== quitando.id));
      toast.success('Post quitado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo quitar');
    } finally {
      setQuitando(null);
    }
  }

  const VISTAS = [
    { id: 'proximos' as const, etiqueta: 'Próximos', n: proximos.length },
    { id: 'pasados' as const, etiqueta: 'Ya salieron', n: pasados.length },
    { id: 'biblioteca' as const, etiqueta: 'Biblioteca', n: biblioteca.length },
  ];
  const lista = vista === 'proximos' ? proximos : pasados;

  return (
    <section>
      <div className="mb-6">
        <h2 className="kzp-titulo">Redes</h2>
        <p className="kzp-sub">Lo que va a salir, en qué red y cuándo. Podés cambiar el texto o la fecha antes de que salga, o quitar un post.</p>
      </div>
      {error && <p className="text-sm text-muted-foreground">No se pudo cargar el calendario: {error}</p>}
      {!posts && !error && <div className="kzp-esqueleto h-[300px]" />}
      {posts && (
        <>
          <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Redes">
            {VISTAS.map((v) => (
              <button key={v.id} role="tab" aria-selected={vista === v.id} onClick={() => setVista(v.id)} className={`kz-tab inline-flex items-center gap-1.5 ${vista === v.id ? 'kz-tab-activa' : ''}`}>
                {v.etiqueta} <span className="font-mono text-[11.5px] opacity-70">{v.n}</span>
              </button>
            ))}
          </div>

          {vista !== 'biblioteca' && lista.length === 0 && <p className="text-sm text-muted-foreground">Nada por acá.</p>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vista !== 'biblioteca' && lista.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-2xl border bg-card">
                <Media archivo={p.archivo} portada={p.portada} />
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[13px]">
                    <span className="font-semibold capitalize">{fechaCorta(p.fecha)} · {hora(p.fecha)}</span>
                    <span className="kzp-chip" style={{ ['--kzp-tono' as string]: 'var(--kzp-azul)' }}><Facebook size={13} /> {REDES[p.red] ?? p.red}</span>
                    <span className="kzp-chip capitalize">{p.tipo}</span>
                    {!p.fbId && <span className="kzp-chip" style={{ ['--kzp-tono' as string]: 'var(--kzp-ambar)' }}>Sin programar</span>}
                    {p.fbId && vista === 'proximos' && <span className="kzp-chip">Programado</span>}
                  </div>
                  <p className="line-clamp-5 whitespace-pre-line text-[13.5px] text-muted-foreground">{p.texto}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => abrir(p)}><Pencil /> Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => copiar(p.texto)}><Copy /> Copiar</Button>
                    {p.archivo && <Button size="sm" variant="outline" asChild><a href={p.archivo} download><Download /> Descargar</a></Button>}
                    {p.link && <Button size="sm" variant="ghost" asChild><a href={p.link} target="_blank" rel="noreferrer"><ExternalLink /> Enlace</a></Button>}
                    {vista === 'proximos' && <Button size="sm" variant="ghost" onClick={() => setQuitando(p)} aria-label="Quitar post"><Trash2 /></Button>}
                  </div>
                </div>
              </article>
            ))}
            {vista === 'biblioteca' && biblioteca.map((a) => (
              <article key={a.nombre} className="overflow-hidden rounded-2xl border bg-card">
                <Media archivo={a.archivo} portada={a.portada} />
                <div className="space-y-2 p-4">
                  <p className="truncate font-mono text-[13px] font-semibold">{a.nombre}</p>
                  <p className="text-[13px] text-muted-foreground">{a.fechas.length ? `${a.fechas.length} vez${a.fechas.length === 1 ? '' : 'es'} en el calendario` : 'Sin fecha en el calendario'}</p>
                  <Button size="sm" variant="outline" asChild><a href={a.archivo} download><Download /> Descargar</a></Button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Por ahora la única red conectada es Facebook. El video que se ve acá es una copia liviana; a Facebook sube el original.</p>
        </>
      )}

      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar post</DialogTitle></DialogHeader>
          {editando && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="redes-texto">Texto</Label>
                <Textarea id="redes-texto" rows={10} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={2200} />
                <p className="text-xs text-muted-foreground">{texto.length} / 2200</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="redes-fecha">Fecha y hora (Honduras)</Label>
                <Input id="redes-fecha" type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={new Date(editando.fecha).getTime() < Date.now()} />
                {new Date(editando.fecha).getTime() < Date.now() && <p className="text-xs text-muted-foreground">Este post ya salió: solo se puede corregir el texto.</p>}
              </div>
              <p className="text-xs text-muted-foreground">El video o la foto no se cambian desde acá.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
                <Button onClick={guardar} disabled={guardando || !texto.trim() || !fecha}>{guardando ? 'Guardando…' : 'Guardar'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!quitando} onOpenChange={(o) => !o && setQuitando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar este post?</AlertDialogTitle>
            <AlertDialogDescription>Se borra de lo programado en Facebook y ya no va a salir. No se puede deshacer desde el panel.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={quitar}>Quitar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
