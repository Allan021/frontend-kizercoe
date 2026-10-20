import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CreditCard, FolderKanban, Home, Layers, MapPin, MessageSquareQuote, Sparkles, UserCog, Users, Wrench } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { panelFacturas, panelLeads, panelOrdenes, panelStaff, panelVisitas, type Factura, type Lead, type Orden, type Staff, type Visita } from '@/lib/api';
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
  { id: 'taller', titulo: 'Taller', Icono: Wrench },
  { id: 'servicios', titulo: 'Servicios', Icono: Layers },
  { id: 'cobros', titulo: 'Cobros y facturación', Icono: CreditCard },
  { id: 'asistente', titulo: 'Asistente IA', Icono: Sparkles },
  { id: 'staff', titulo: 'Mi staff', Icono: UserCog },
  { id: 'proyectos', titulo: 'Proyectos', Icono: FolderKanban },
  { id: 'testimonios', titulo: 'Testimonios', Icono: MessageSquareQuote },
];

export function PanelBuscar({ abierta, onCerrar, onIr }: { abierta: boolean; onCerrar: () => void; onIr: (p: Pestana, q?: string) => void }) {
  const [q, setQ] = useState('');
  const [datos, setDatos] = useState<{ leads: Lead[]; visitas: Visita[]; staff: Staff[]; ordenes: Orden[]; facturas: Factura[] } | null>(null);

  useEffect(() => {
    if (!abierta) return;
    setQ('');
    if (!datos) {
      Promise.all([panelLeads(), panelVisitas(), panelStaff(), panelOrdenes().catch(() => [] as Orden[]), panelFacturas().catch(() => [] as Factura[])])
        .then(([leads, visitas, staff, ordenes, facturas]) => setDatos({ leads, visitas, staff, ordenes, facturas }))
        .catch(() => setDatos({ leads: [], visitas: [], staff: [], ordenes: [], facturas: [] }));
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
      ordenes: t && datos ? datos.ordenes.filter((o) => coincide(o.num, o.cliente, o.equipo, o.modelo, o.serie, o.telefono, o.falla)).slice(0, 10) : [],
      facturas: t && datos ? datos.facturas.filter((f) => coincide(f.num, f.cliente, f.concepto, f.telefono)).slice(0, 10) : [],
    };
  }, [q, datos]);

  const elegir = (p: Pestana, extra?: string) => {
    onIr(p, extra);
    onCerrar();
  };

  return (
    <CommandDialog open={abierta} onOpenChange={(o) => !o && onCerrar()}>
      <CommandInput value={q} onValueChange={setQ} placeholder="Buscar orden, cliente, visita, factura, persona o sección…" />
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
        {r.ordenes.length > 0 && (
          <CommandGroup heading="Taller">
            {r.ordenes.map((o) => (
              <CommandItem key={o.id} value={`orden ${o.id}`} onSelect={() => elegir('taller')}>
                <Wrench />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{o.num} · {o.equipo}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{o.cliente} · {o.falla} · {o.estado}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {r.facturas.length > 0 && (
          <CommandGroup heading="Cobros">
            {r.facturas.map((f) => (
              <CommandItem key={f.id} value={`factura ${f.id}`} onSelect={() => elegir('cobros')}>
                <CreditCard />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{f.num} · {f.cliente}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{f.concepto} · {f.estado}</span>
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
