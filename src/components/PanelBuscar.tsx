import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, FolderKanban, Home, MapPin, MessageSquareQuote, Sparkles, UserCog, Users } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { panelLeads, panelStaff, panelVisitas, type Lead, type Staff, type Visita } from '@/lib/api';
import type { Pestana } from '@/components/Panel';

/**
 * Paleta de búsqueda (Ctrl K) sobre cmdk/shadcn: secciones del panel y,
 * escribiendo, leads, visitas y gente del staff por nombre, teléfono o
 * municipio. Elegir lleva a la sección; un lead además deja el buscador de
 * leads con ese nombre.
 */

const SECCIONES: { id: Pestana; titulo: string; Icono: typeof Home }[] = [
  { id: 'hoy', titulo: 'Hoy', Icono: Home },
  { id: 'leads', titulo: 'Leads y clientes', Icono: Users },
  { id: 'visitas', titulo: 'Visitas e instalaciones', Icono: CalendarDays },
  { id: 'asistente', titulo: 'Asistente IA', Icono: Sparkles },
  { id: 'staff', titulo: 'Mi staff', Icono: UserCog },
  { id: 'proyectos', titulo: 'Proyectos', Icono: FolderKanban },
  { id: 'testimonios', titulo: 'Testimonios', Icono: MessageSquareQuote },
];

export function PanelBuscar({ abierta, onCerrar, onIr }: { abierta: boolean; onCerrar: () => void; onIr: (p: Pestana, q?: string) => void }) {
  const [q, setQ] = useState('');
  const [datos, setDatos] = useState<{ leads: Lead[]; visitas: Visita[]; staff: Staff[] } | null>(null);

  useEffect(() => {
    if (!abierta) return;
    setQ('');
    if (!datos) {
      Promise.all([panelLeads(), panelVisitas(), panelStaff()])
        .then(([leads, visitas, staff]) => setDatos({ leads, visitas, staff }))
        .catch(() => setDatos({ leads: [], visitas: [], staff: [] }));
    }
  }, [abierta, datos]);

  // El filtrado es nuestro (teléfonos por dígitos, varios campos); cmdk solo pinta.
  const r = useMemo(() => {
    const t = q.trim().toLowerCase();
    const dig = t.replace(/\D/g, '');
    const coincide = (...campos: (string | null | undefined)[]) =>
      !t || campos.some((c) => c && (c.toLowerCase().includes(t) || (dig.length >= 4 && c.replace(/\D/g, '').includes(dig))));
    return {
      secciones: SECCIONES.filter((s) => coincide(s.titulo)),
      leads: t && datos ? datos.leads.filter((l) => coincide(l.name, l.email, l.phone, l.company, l.service)).slice(0, 12) : [],
      visitas: t && datos ? datos.visitas.filter((v) => coincide(v.nombre, v.telefono, v.municipio, v.direccion)).slice(0, 12) : [],
      staff: t && datos ? datos.staff.filter((s) => coincide(s.nombre, s.telefono, s.rol)) : [],
    };
  }, [q, datos]);

  const elegir = (p: Pestana, extra?: string) => {
    onIr(p, extra);
    onCerrar();
  };

  return (
    <CommandDialog open={abierta} onOpenChange={(o) => !o && onCerrar()}>
      <CommandInput value={q} onValueChange={setQ} placeholder="Buscar lead, visita, persona o sección…" />
      <CommandList>
        <CommandEmpty>{datos ? 'Nada con ese texto.' : 'Cargando…'}</CommandEmpty>
        {r.secciones.length > 0 && (
          <CommandGroup heading="Ir a">
            {r.secciones.map((s) => (
              <CommandItem key={s.id} value={`seccion ${s.titulo}`} onSelect={() => elegir(s.id)}>
                <s.Icono /> {s.titulo}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {r.leads.length > 0 && (
          <CommandGroup heading="Leads">
            {r.leads.map((l) => (
              <CommandItem key={l.id} value={`lead ${l.id}`} onSelect={() => elegir('leads', l.name)}>
                <Users />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{l.name}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{l.service} · {l.email}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {r.visitas.length > 0 && (
          <CommandGroup heading="Visitas e instalaciones">
            {r.visitas.map((v) => (
              <CommandItem key={v.id} value={`visita ${v.id}`} onSelect={() => elegir('visitas')}>
                <MapPin />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{v.nombre}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">
                    {v.estado} · {[v.municipio, v.direccion].filter(Boolean).join(', ')}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {r.staff.length > 0 && (
          <CommandGroup heading="Mi staff">
            {r.staff.map((s) => (
              <CommandItem key={s.id} value={`staff ${s.id}`} onSelect={() => elegir('staff')}>
                <UserCog />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{s.nombre}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{s.rol} · {s.telefono}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
