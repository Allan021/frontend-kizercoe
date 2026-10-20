import { useEffect, useState } from 'react';
import { ExternalLink, FileText, KeyRound, MapPin, NotebookPen, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SubirImagen } from '@/components/SubirImagen';
import { miniatura } from '@/lib/upload';
import { panelAnotarBitacora, panelBitacora, type Bitacora, type Visita, type VisitaCambios } from '@/lib/api';

/**
 * La ficha de una instalación: dónde queda (texto y Maps), el contrato, los
 * datos técnicos (contraseñas del DVR y de la app) y la bitácora con fotos.
 *
 * Lo mismo que el técnico le cuenta al bot por WhatsApp aparece acá, y lo que
 * se anota acá lo puede consultar el bot. Cerrada por defecto: en la agenda
 * estorba, se abre cuando hace falta.
 */
export function Ficha({ v, onGuardar }: { v: Visita; onGuardar: (c: VisitaCambios) => Promise<void> | void }) {
  const [abierta, setAbierta] = useState(false);
  const tiene = [v.mapsUrl && 'maps', v.contratoUrl && 'contrato', v.datos && 'datos'].filter(Boolean) as string[];

  return (
    <details className="mt-3" open={abierta} onToggle={(e) => setAbierta((e.target as HTMLDetailsElement).open)}>
      <summary className="inline-flex cursor-pointer list-none select-none items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <span><NotebookPen /> Ficha y bitácora</span>
        </Button>
        {tiene.map((t) => (
          <Badge key={t} variant="secondary" className="font-mono text-[10.5px] font-medium uppercase tracking-wider">{t}</Badge>
        ))}
      </summary>
      {abierta && <Contenido v={v} onGuardar={onGuardar} />}
    </details>
  );
}

function Contenido({ v, onGuardar }: { v: Visita; onGuardar: (c: VisitaCambios) => Promise<void> | void }) {
  const [f, setF] = useState({
    direccion: v.direccion,
    mapsUrl: v.mapsUrl ?? '',
    contratoUrl: v.contratoUrl ?? '',
    datos: v.datos ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const cambio =
    f.direccion !== v.direccion || f.mapsUrl !== (v.mapsUrl ?? '') || f.contratoUrl !== (v.contratoUrl ?? '') || f.datos !== (v.datos ?? '');

  async function guardar() {
    setGuardando(true);
    try {
      await onGuardar({ direccion: f.direccion, mapsUrl: f.mapsUrl || null, contratoUrl: f.contratoUrl || null, datos: f.datos || null });
      toast.success('Ficha guardada');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mt-3 space-y-4 border-t border-border pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`dir-${v.id}`} className="flex items-center gap-1 text-muted-foreground"><MapPin size={12} /> Dirección</Label>
          <Input id={`dir-${v.id}`} value={f.direccion} onChange={(e) => setF({ ...f, direccion: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`maps-${v.id}`} className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={12} /> Google Maps {v.mapsUrl && <Abrir href={v.mapsUrl} />}
          </Label>
          <Input id={`maps-${v.id}`} value={f.mapsUrl} onChange={(e) => setF({ ...f, mapsUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" inputMode="url" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`con-${v.id}`} className="flex items-center gap-1 text-muted-foreground">
            <FileText size={12} /> Contrato firmado {v.contratoUrl && <Abrir href={v.contratoUrl} />}
          </Label>
          <Input id={`con-${v.id}`} value={f.contratoUrl} onChange={(e) => setF({ ...f, contratoUrl: e.target.value })} placeholder="Enlace de PandaDoc o PDF" inputMode="url" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`dat-${v.id}`} className="flex items-center gap-1 text-muted-foreground">
            <KeyRound size={12} /> Datos técnicos (DVR, app, wifi, IP, modelo). Cifrados en la base.
          </Label>
          <Textarea id={`dat-${v.id}`} rows={4} value={f.datos} onChange={(e) => setF({ ...f, datos: e.target.value })} placeholder={'DVR: admin / 1234\nApp: usuario@correo / clave\nWifi: …'} className="font-mono text-[13px]" />
        </div>
      </div>
      <Button disabled={!cambio || guardando} onClick={guardar}>
        <Save /> {guardando ? 'Guardando…' : 'Guardar ficha'}
      </Button>

      <Notas visitaId={v.id} />
    </div>
  );
}

function Abrir({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-accent-foreground">
      abrir <ExternalLink size={11} />
    </a>
  );
}

function Notas({ visitaId }: { visitaId: string }) {
  const [lista, setLista] = useState<Bitacora[] | null>(null);
  const [texto, setTexto] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  useEffect(() => {
    panelBitacora(visitaId)
      .then(setLista)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'No se pudo cargar la bitácora'));
  }, [visitaId]);

  async function anotar() {
    try {
      const n = await panelAnotarBitacora(visitaId, { texto: texto.trim() || 'Foto', fotoUrl: foto });
      setLista((l) => [n, ...(l ?? [])]);
      setTexto('');
      setFoto(null);
      toast.success('Anotado en la bitácora');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo anotar');
    }
  }

  const fecha = (iso: string) => new Date(iso).toLocaleString('es-HN', { timeZone: 'America/Tegucigalpa', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <p className="kz-eyebrow">// bitácora {lista ? `· ${lista.length}` : ''}</p>
      <ul className="mt-2 space-y-2">
        {(lista ?? []).map((n) => (
          <li key={n.id} className="flex gap-3 rounded-xl border border-border bg-muted/60 p-3 text-[13px]">
            {n.fotoUrl && (
              <a href={n.fotoUrl} target="_blank" rel="noreferrer" className="shrink-0">
                <img src={miniatura(n.fotoUrl, 128) ?? n.fotoUrl} alt="" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" loading="lazy" />
              </a>
            )}
            <div className="min-w-0">
              <p className="whitespace-pre-line">{n.texto}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{n.autor} · {fecha(n.createdAt)}</p>
            </div>
          </li>
        ))}
        {lista && lista.length === 0 && (
          <li className="text-[13px] text-muted-foreground">Nada anotado todavía. El técnico también puede anotar por WhatsApp.</li>
        )}
      </ul>
      <div className="mt-3 space-y-2">
        <Textarea rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Qué pasó, qué quedó pendiente…" aria-label="Nueva nota" />
        <SubirImagen url={foto} onSubida={setFoto} onQuitar={() => setFoto(null)} etiqueta="Foto" ayuda="Opcional. Del relajo eléctrico, del grabador, de lo que haga falta recordar." />
        <Button variant="outline" size="sm" disabled={!texto.trim() && !foto} onClick={anotar}>
          <NotebookPen /> Anotar
        </Button>
      </div>
    </div>
  );
}
