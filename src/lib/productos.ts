/**
 * Productos propios de Kizercode (/productos/x y /en/products/x).
 *
 * Los textos salen de lo que cada producto dice de sí mismo en su propio
 * sitio: nada de funciones prometidas que el producto no tenga.
 */
export type Producto = {
  slug: string;
  slugEn: string;
  nombre: string;
  icon: string;
  url: string;
  tagEs: string;
  tagEn: string;
  taglineEs: string;
  taglineEn: string;
  descEs: string;
  descEn: string;
  introEs: string[];
  introEn: string[];
  features: { es: string; en: string }[];
  /** Slugs de /industrias a los que le sirve. */
  industrias: string[];
  sinInternet: boolean;
};

export const productos: Producto[] = [
  {
    slug: 'kizerpos',
    slugEn: 'kizerpos',
    nombre: 'KizerPOS',
    icon: 'lucide:store',
    url: 'https://pos.kizercode.com/',
    tagEs: 'Tiendas',
    tagEn: 'Retail',
    taglineEs: 'El punto de venta que no se cae cuando se va el internet.',
    taglineEn: "The point of sale that doesn't go down when the internet does.",
    descEs: 'Punto de venta e inventario que funciona sin internet: vendé offline, sincronizá en la nube, cargá stock con una foto (IA) y controlá tu negocio desde el celular.',
    descEn: 'Point of sale and inventory that works offline: sell without internet, sync to the cloud, load stock with a photo (AI) and run your business from your phone.',
    introEs: [
      'KizerPOS es punto de venta e inventario para tiendas de todo tipo: farmacias, ferreterías, boutiques, perfumerías. Vendés aunque se vaya el internet — todo queda guardado en el equipo y se sincroniza en la nube cuando vuelve la conexión.',
      'Cargás inventario con una foto gracias a la IA, llevás el fiado de tus clientes, un programa de puntos para que vuelvan, y controlás el negocio desde el celular. Todo por una mensualidad.',
    ],
    introEn: [
      'KizerPOS is point of sale and inventory for every kind of store: pharmacies, hardware stores, boutiques, perfumeries. You keep selling when the internet drops — everything is saved on the device and syncs to the cloud when the connection returns.',
      'You load inventory with a photo thanks to AI, track customer credit, run a points program so they come back, and control the business from your phone. All for a monthly fee.',
    ],
    features: [
      { es: 'Vende sin internet', en: 'Sells offline' },
      { es: 'Inventario cargado con una foto (IA)', en: 'Inventory loaded from a photo (AI)' },
      { es: 'Fiado y cuentas de clientes', en: 'Customer credit and accounts' },
      { es: 'Programa de puntos', en: 'Points program' },
      { es: 'Control desde el celular', en: 'Control from your phone' },
      { es: 'Sincronización en la nube', en: 'Cloud sync' },
    ],
    industrias: ['farmacias', 'ferreterias', 'boutiques', 'distribuidoras'],
    sinInternet: true,
  },
  {
    slug: 'kizerresto',
    slugEn: 'kizerresto',
    nombre: 'KizerResto',
    icon: 'lucide:utensils',
    url: 'https://pos.kizercode.com/resto',
    tagEs: 'Restaurantes',
    tagEn: 'Restaurants',
    taglineEs: 'El programa que entiende cómo trabaja tu comedor.',
    taglineEn: 'The software that understands how your dining room works.',
    descEs: 'Punto de venta para restaurantes: comanda a la cocina, cuenta dividida por persona, corte de caja con propinas y factura con ISV y CAI del SAR. Funciona sin internet.',
    descEn: 'Restaurant POS: tickets to the kitchen, bills split per person, cash close with tips and fiscal invoicing for Honduras and the US. Works offline.',
    introEs: [
      'KizerResto es el punto de venta para restaurantes: la comanda viaja directo a la cocina, la cuenta se divide por persona y el corte de caja cuadra con la gaveta, propinas incluidas.',
      'Factura como la pide tu país — ISV y CAI del SAR en Honduras, Sales Tax y propinas en Estados Unidos — y sigue vendiendo aunque se caiga el internet. Nosotros instalamos las terminales y las impresoras de cocina.',
    ],
    introEn: [
      'KizerResto is the point of sale for restaurants: the ticket goes straight to the kitchen, the bill splits per person and the cash close matches the drawer, tips included.',
      'It invoices the way your country requires — ISV and CAI in Honduras, Sales Tax and tips in the United States — and keeps selling even when the internet drops. We install the terminals and kitchen printers.',
    ],
    features: [
      { es: 'Comanda directa a cocina', en: 'Tickets straight to the kitchen' },
      { es: 'Cuenta dividida por persona', en: 'Bill split per person' },
      { es: 'Corte de caja con propinas', en: 'Cash close with tips' },
      { es: 'Factura con ISV y CAI (Honduras)', en: 'ISV and CAI invoicing (Honduras)' },
      { es: 'Sales Tax y propinas (EE. UU.)', en: 'Sales Tax and tips (US)' },
      { es: 'Funciona sin internet', en: 'Works offline' },
    ],
    industrias: ['restaurantes'],
    sinInternet: true,
  },
  {
    slug: 'kizer-cobros',
    slugEn: 'kizer-cobros',
    nombre: 'Kizer Cobros',
    icon: 'lucide:hand-coins',
    url: 'https://cobros.kizercode.com/',
    tagEs: 'Prestamistas',
    tagEn: 'Lenders',
    taglineEs: 'Control digital de préstamos y cobros.',
    taglineEn: 'Digital control of loans and collections.',
    descEs: 'Control digital de préstamos y cobros para prestamistas: cartera, cuotas, vencimientos y pagos registrados en un solo lugar.',
    descEn: 'Digital loan and collections control for lenders: portfolio, installments, due dates and logged payments in one place.',
    introEs: [
      'Kizer Cobros lleva cada préstamo con sus cuotas y vencimientos, y te dice a quién te toca cobrar. La cartera completa en un solo lugar, en vez de repartida entre cuadernos y hojas de cálculo.',
      'Cada pago queda registrado con su fecha, para que la cartera se pueda revisar en cualquier momento y no dependa de la memoria de nadie.',
    ],
    introEn: [
      'Kizer Cobros tracks every loan with its installments and due dates, and tells you who is due for collection. The whole portfolio in one place, instead of scattered across notebooks and spreadsheets.',
      'Every payment is logged with its date, so the portfolio can be reviewed at any time and never depends on anyone’s memory.',
    ],
    features: [
      { es: 'Cartera en un solo lugar', en: 'Portfolio in one place' },
      { es: 'Cuotas y vencimientos', en: 'Installments and due dates' },
      { es: 'A quién cobrar hoy', en: 'Who to collect from today' },
      { es: 'Pagos registrados con fecha', en: 'Payments logged with dates' },
      { es: 'Historial por cliente', en: 'History per customer' },
      { es: 'Adiós hojas de cálculo', en: 'Goodbye spreadsheets' },
    ],
    industrias: ['prestamistas'],
    sinInternet: false,
  },
  {
    slug: 'kizer-check',
    slugEn: 'kizer-check',
    nombre: 'Kizer Check',
    icon: 'lucide:fingerprint',
    url: 'https://check.kizercode.com/',
    tagEs: 'Empleados',
    tagEn: 'Staff',
    taglineEs: 'El reporte de asistencia de cualquier sucursal, en segundos.',
    taglineEn: 'The attendance report of any branch, in seconds.',
    descEs: 'Marcaje por huella y reporte de asistencia en segundos: horas, tardanzas, ausencias y planilla con IHSS, RAP e ISR. Funciona sin internet en la sucursal.',
    descEn: 'Fingerprint clock-in and attendance reports in seconds: hours, late arrivals, absences and payroll with IHSS, RAP and ISR. Works offline at the branch.',
    introEs: [
      'Los empleados marcan con el dedo y vos recibís el reporte de asistencia en segundos: horas trabajadas, tardanzas y ausencias, con cálculo de horas con tolerancia.',
      'La planilla sale lista para el contador, con IHSS, RAP e ISR, y el marcaje sigue funcionando aunque la sucursal se quede sin internet.',
    ],
    introEn: [
      'Employees clock in with their fingerprint and you get the attendance report in seconds: hours worked, late arrivals and absences, with tolerance-aware hour calculation.',
      'Payroll comes out ready for the accountant, with IHSS, RAP and ISR, and clock-in keeps working even if the branch loses internet.',
    ],
    features: [
      { es: 'Marcaje por huella', en: 'Fingerprint clock-in' },
      { es: 'Horas con tolerancia', en: 'Hours with tolerance' },
      { es: 'Tardanzas y ausencias', en: 'Late arrivals and absences' },
      { es: 'Planilla con IHSS, RAP e ISR', en: 'Payroll with IHSS, RAP and ISR' },
      { es: 'Reporte de cualquier sucursal', en: 'Report from any branch' },
      { es: 'Funciona sin internet', en: 'Works offline' },
    ],
    industrias: ['restaurantes', 'farmacias', 'distribuidoras', 'talleres'],
    sinInternet: true,
  },
  {
    slug: 'clinicosalud',
    slugEn: 'clinicosalud',
    nombre: 'ClínicoSalud',
    icon: 'lucide:stethoscope',
    url: 'https://dentalosweb-production.up.railway.app/',
    tagEs: 'Salud',
    tagEn: 'Healthcare',
    taglineEs: 'Software para clínicas de toda especialidad.',
    taglineEn: 'Software for clinics of every specialty.',
    descEs: 'Pacientes, expedientes, historia clínica por voz, laboratorio, agenda, citas en línea y finanzas en un solo panel. Para clínicas de toda especialidad en Honduras.',
    descEn: 'Patients, records, voice clinical history, lab, schedule, online booking and finances in one panel. For clinics of every specialty in Honduras.',
    introEs: [
      'ClínicoSalud junta la clínica en un solo panel: pacientes, expediente, historia clínica dictada por voz, laboratorio, agenda con citas en línea y finanzas.',
      'Está hecho para clínicas de toda especialidad en Honduras: el médico dicta en lugar de teclear, el paciente agenda en línea y la administración ve los números al día.',
    ],
    introEn: [
      'ClínicoSalud brings the clinic into one panel: patients, records, voice-dictated clinical history, lab, schedule with online booking and finances.',
      'It is built for clinics of every specialty in Honduras: doctors dictate instead of typing, patients book online and administration sees the numbers up to date.',
    ],
    features: [
      { es: 'Pacientes y expediente', en: 'Patients and records' },
      { es: 'Historia clínica por voz', en: 'Voice clinical history' },
      { es: 'Laboratorio', en: 'Lab' },
      { es: 'Agenda y citas en línea', en: 'Schedule and online booking' },
      { es: 'Finanzas de la clínica', en: 'Clinic finances' },
      { es: 'Para toda especialidad', en: 'For every specialty' },
    ],
    industrias: ['clinicas'],
    sinInternet: false,
  },
];
