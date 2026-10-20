import { useEffect, useState } from 'react';
import { MessageCircle, Pencil, Plus, Trash2, UserCog, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { panelBorrarStaff, panelCrearStaff, panelEditarStaff, panelStaff, waDe, type Staff, type StaffDatos } from '@/lib/api';

/**
 * Mi staff: el equipo que el bot de WhatsApp reconoce por su número. A ellos
 * no les vende: los saluda por su nombre, les pregunta por su trabajo (a un
 * técnico, por las instalaciones de la agenda) y lleva la bitácora de cada
 * instalación. Apagar a alguien lo devuelve al trato de cliente sin borrarlo.
 */

const ROLES = [
  ['ceo', 'CEO'],
  ['tecnico', 'Técnico'],
  ['ventas', 'Ventas'],
  ['admin', 'Administración'],
  ['otro', 'Otro'],
] as const;

const etiquetaRol = (r: string) => ROLES.find(([k]) => k === r)?.[1] ?? r;

const VACIO: StaffDatos = { nombre: '', telefono: '', rol: 'tecnico', activo: true, notas: '' };

export function PanelStaff({ onConteo }: { onConteo: (n: number) => void }) {
  const [lista, setLista] = useState<Staff[] | null>(null);
  const [editando, setEditando] = useState<Staff | 'nuevo' | null>(null);

  const cargar = () => {
    panelStaff()
      .then(setLista)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'No se pudo cargar el staff'));
  };
  useEffect(cargar, []);
  useEffect(() => {
    if (lista) onConteo(lista.filter((p) => p.activo).length);
  }, [lista, onConteo]);

  async function guardar(d: StaffDatos) {
    try {
      const p = editando === 'nuevo' ? await panelCrearStaff(d) : await panelEditarStaff((editando as Staff).id, d);
      setLista((l) => {
        const resto = (l ?? []).filter((x) => x.id !== p.id);
        return [...resto, p].sort((a, b) => a.nombre.localeCompare(b.nombre));
      });
      setEditando(null);
      toast.success(`${p.nombre} guardado. El bot ${p.activo ? 'ya lo reconoce' : 'no lo reconoce hasta activarlo'}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }

  async function alternar(p: Staff) {
    try {
      const n = await panelEditarStaff(p.id, { activo: !p.activo });
      setLista((l) => (l ?? []).map((x) => (x.id === p.id ? n : x)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar');
    }
  }

  async function borrar(p: Staff) {
    try {
      await panelBorrarStaff(p.id);
      setLista((l) => (l ?? []).filter((x) => x.id !== p.id));
      toast.success(`${p.nombre} ya no está en el staff.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo borrar');
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="kzp-titulo">Mi staff</h2>
          <p className="kzp-sub">
            Cuando alguien de esta lista le escribe al WhatsApp, el bot no le vende: lo saluda por su nombre, le pregunta por
            su trabajo y lleva la bitácora de cada instalación. A los clientes que preguntan por su instalación los manda al técnico.
          </p>
        </div>
        <Button onClick={() => setEditando('nuevo')}>
          <Plus /> Agregar persona
        </Button>
      </div>

      {editando && (
        <Formulario
          inicial={editando === 'nuevo' ? VACIO : { ...editando, notas: editando.notas ?? '' }}
          titulo={editando === 'nuevo' ? 'Nueva persona' : `Editar a ${editando.nombre}`}
          onGuardar={guardar}
          onCerrar={() => setEditando(null)}
        />
      )}

      {!lista ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => <div key={i} className="kzp-esqueleto h-[132px]" />)}
        </div>
      ) : lista.length === 0 ? (
        <div className="kz-card p-8 text-center">
          <UserCog className="mx-auto text-muted-foreground" size={26} />
          <p className="mt-3 text-sm text-muted-foreground">Todavía no hay nadie. Agregá a tus técnicos para que el bot los reconozca.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((p) => {
            const wa = waDe(p.telefono);
            return (
              <li key={p.id} className="kz-card p-4" style={{ opacity: p.activo ? 1 : 0.6 }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-black text-accent-foreground">
                      {p.nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{p.nombre}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted-foreground">
                        <Badge variant={p.rol === 'tecnico' ? 'default' : 'secondary'}>{etiquetaRol(p.rol)}</Badge>
                        {p.activo ? 'el bot lo reconoce' : 'apagado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditando(p)} aria-label={`Editar a ${p.nombre}`}><Pencil /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Quitar a ${p.nombre}`}><Trash2 /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Quitar a {p.nombre} del staff?</AlertDialogTitle>
                          <AlertDialogDescription>El bot lo vuelve a tratar como cliente. Si solo querés pausarlo, apagalo con el interruptor.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => borrar(p)}>Quitar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {p.notas && <p className="mt-3 text-[13px]">{p.notas}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {wa && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={wa} target="_blank" rel="noreferrer"><MessageCircle /> {p.telefono}</a>
                    </Button>
                  )}
                  <Label htmlFor={`act-${p.id}`} className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
                    <Switch id={`act-${p.id}`} checked={p.activo} onCheckedChange={() => alternar(p)} />
                    Activo
                  </Label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Formulario({ inicial, titulo, onGuardar, onCerrar }: { inicial: StaffDatos; titulo: string; onGuardar: (d: StaffDatos) => void; onCerrar: () => void }) {
  const [d, setD] = useState<StaffDatos>(inicial);
  const listo = d.nombre.trim().length >= 2 && d.telefono.replace(/\D/g, '').length >= 8;

  return (
    <form
      className="kz-card mb-6 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (listo) onGuardar({ ...d, notas: d.notas?.trim() || null });
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold">{titulo}</p>
        <Button type="button" variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar"><X /></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="st-nombre">Nombre</Label>
          <Input id="st-nombre" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} placeholder="Saúl Castro" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="st-tel">WhatsApp</Label>
          <Input id="st-tel" value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value })} placeholder="8921-0653" inputMode="tel" type="tel" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="st-rol">Rol</Label>
          <Select value={d.rol} onValueChange={(rol) => setD({ ...d, rol })}>
            <SelectTrigger id="st-rol"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Label htmlFor="st-activo" className="flex items-center gap-3 self-end rounded-lg border border-border bg-muted px-3 py-2.5 text-[13px]">
          <Switch id="st-activo" checked={d.activo} onCheckedChange={(activo) => setD({ ...d, activo })} />
          El bot lo reconoce
        </Label>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="st-notas">Qué tiene que saber el bot de esta persona <span className="text-muted-foreground">(opcional)</span></Label>
          <Input id="st-notas" value={d.notas ?? ''} onChange={(e) => setD({ ...d, notas: e.target.value })} placeholder="Anda haciendo las instalaciones de cámaras" />
        </div>
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">Los números de 8 dígitos se toman como de Honduras (+504).</p>
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={!listo}>Guardar</Button>
        <Button type="button" variant="outline" onClick={onCerrar}>Cancelar</Button>
      </div>
    </form>
  );
}
