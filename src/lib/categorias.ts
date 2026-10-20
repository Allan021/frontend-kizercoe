import { Camera, Code2, Megaphone, Package, Wrench, type LucideIcon, CircleHelp } from 'lucide-react';

/**
 * Cada servicio que pide la gente cae en una categoría: así el CRM se lee por
 * línea de negocio y no por las mil formas de escribir "cámaras". El texto
 * del servicio lo pone el formulario, el bot o la demo; acá se clasifica por
 * palabras clave.
 */
export type Categoria = 'camaras' | 'reparacion' | 'software' | 'marketing' | 'productos' | 'otros';

export const CATEGORIAS: Record<Categoria, { nombre: string; color: string; Icono: LucideIcon }> = {
  camaras: { nombre: 'Cámaras', color: '#0d8050', Icono: Camera },
  reparacion: { nombre: 'Reparación', color: '#e0a100', Icono: Wrench },
  software: { nombre: 'Software y web', color: '#2f6fed', Icono: Code2 },
  marketing: { nombre: 'Marketing', color: '#8b5cf6', Icono: Megaphone },
  productos: { nombre: 'Productos Kizer', color: '#0ea5a4', Icono: Package },
  otros: { nombre: 'Otros', color: '#8a94a6', Icono: CircleHelp },
};

const REGLAS: [Categoria, RegExp][] = [
  ['camaras', /c[aá]mara|cctv|vigilancia|dvr|nvr|seguridad/i],
  ['reparacion', /reparaci|celular|computadora|laptop|pantalla|taller|mantenimiento/i],
  ['productos', /kizer|pos\b|resto|check|cobros|clinico|punto de venta/i],
  ['marketing', /anuncio|redes|seo|marketing|captaci|facebook|instagram|publicidad/i],
  ['software', /web|p[aá]gina|tienda|sistema|app|software|ia\b|inteligencia|crm|erp|automatiz|landing/i],
];

export function categoriaDe(servicio: string): Categoria {
  for (const [c, re] of REGLAS) if (re.test(servicio)) return c;
  return 'otros';
}
