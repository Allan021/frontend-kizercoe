import { tiposWeb, type TipoWeb } from './tiposWeb';

/**
 * Galerías por servicio: "esto es lo que hacemos", con una imagen por tipo.
 *
 * La de páginas web son tipos de sitio; la de IA, automatizaciones. Las de IA
 * dicen en qué producto nuestro ya corre cada una: es lo que separa "te
 * podemos hacer un agente" de "este agente ya atiende negocios hoy".
 */
export type ItemGaleria = TipoWeb & {
  /** Slug de /productos donde ya funciona esto. */
  producto?: string;
};

export type Galeria = {
  carpeta: string;
  kwEs: string;
  kwEn: string;
  h2Es: string;
  h2En: string;
  pEs: string;
  pEn: string;
  items: ItemGaleria[];
};

const automatizaciones: ItemGaleria[] = [
  {
    slug: 'agente-whatsapp',
    tEs: 'Agente de WhatsApp',
    tEn: 'WhatsApp agent',
    dEs: 'Atiende, responde precios y horarios y cotiza con tu lista real, a cualquier hora. Lo delicado te lo pasa con la conversación completa.',
    dEn: 'Answers prices and hours and quotes from your real price list, any time. Anything delicate is handed to you with the full conversation.',
    paraEs: 'Negocios que viven en WhatsApp',
    paraEn: 'Businesses that live on WhatsApp',
  },
  {
    slug: 'chatbot-web',
    tEs: 'Chatbot en tu web o tienda',
    tEn: 'Chatbot on your site or store',
    dEs: 'Responde dudas en tu página y ayuda a elegir y comprar, sin que el cliente tenga que esperar a que alguien le conteste.',
    dEn: 'Answers questions on your site and helps customers choose and buy, without waiting for someone to reply.',
    paraEs: 'Tiendas en línea y sitios con muchas consultas',
    paraEn: 'Online stores and sites with many inquiries',
    servicio: 'tiendas-en-linea',
  },
  {
    slug: 'seguimiento-leads',
    tEs: 'Seguimiento de leads',
    tEn: 'Lead follow-up',
    dEs: 'Cada consulta entra sola a tu CRM con de dónde vino, y el sistema te recuerda a quién escribirle antes de que se enfríe.',
    dEn: 'Every inquiry lands in your CRM with where it came from, and the system reminds you who to follow up before they go cold.',
    paraEs: 'Equipos de venta, inmobiliarias, servicios',
    paraEn: 'Sales teams, real estate, services',
    servicio: 'crm-a-la-medida',
    producto: 'portal-inmobiliario',
  },
  {
    slug: 'cobranza',
    tEs: 'Cobranza por WhatsApp',
    tEn: 'Collections on WhatsApp',
    dEs: 'Recordatorios de pago a tiempo y el cliente manda la foto de la transferencia. Vos solo confirmás.',
    dEn: 'Timely payment reminders, and customers send a photo of their transfer. You just confirm it.',
    paraEs: 'Prestamistas, ventas al crédito, mensualidades',
    paraEn: 'Lenders, credit sales, monthly plans',
    producto: 'kizer-cobros',
  },
  {
    slug: 'inventario-foto',
    tEs: 'Inventario con una foto',
    tEn: 'Inventory from a photo',
    dEs: 'Le tomás foto a la factura del proveedor o a la mercadería y la IA la convierte en productos con cantidad y precio.',
    dEn: 'Snap the supplier invoice or the goods and AI turns it into products with quantity and price.',
    paraEs: 'Tiendas, farmacias, ferreterías',
    paraEn: 'Shops, pharmacies, hardware stores',
    producto: 'kizerpos',
  },
  {
    slug: 'voz',
    tEs: 'Notas y formularios por voz',
    tEn: 'Voice notes and forms',
    dEs: 'Hablás y queda escrito en el sistema, ordenado en sus campos. Sin teclear mientras atendés.',
    dEn: 'You speak and it is written into the system, sorted into its fields. No typing while you attend.',
    paraEs: 'Clínicas, consultorios, trabajo de campo',
    paraEn: 'Clinics, practices, field work',
    producto: 'clinicosalud',
  },
  {
    slug: 'citas',
    tEs: 'Citas y recordatorios',
    tEn: 'Appointments and reminders',
    dEs: 'El cliente agenda solo, recibe la confirmación y un recordatorio antes de la cita. Menos ausencias, cero llamadas.',
    dEn: 'Customers book themselves and get a confirmation and a reminder before the appointment. Fewer no-shows, no calls.',
    paraEs: 'Clínicas, salones, talleres, inmobiliarias',
    paraEn: 'Clinics, salons, workshops, real estate',
  },
  {
    slug: 'asistente-datos',
    tEs: 'Asistente que responde con tus datos',
    tEn: 'Assistant that answers from your data',
    dEs: 'Le preguntás "¿cuánto vendí hoy?" o "¿quién me debe?" como a un empleado, y contesta con los números reales de tu sistema.',
    dEn: 'Ask "how much did I sell today?" or "who owes me?" like you would ask an employee, and it answers with your system\'s real numbers.',
    paraEs: 'Dueños que quieren saber sin abrir reportes',
    paraEn: 'Owners who want answers without opening reports',
    producto: 'kizerpos',
  },
];

export const galerias: Record<string, Galeria> = {
  'paginas-web': {
    carpeta: 'web',
    kwEs: 'Lo que hacemos en web',
    kwEn: 'What we build for the web',
    h2Es: 'Desde una landing hasta tu propio sistema.',
    h2En: 'From a landing page to your own system.',
    pEs: 'Cada proyecto se diseña sobre tu marca. Estos son los tipos de sitio y sistema que más armamos, con diseños de muestra de cómo se ven.',
    pEn: 'Every project is designed around your brand. These are the kinds of sites and systems we build most, with sample designs of how they look.',
    items: tiposWeb,
  },
  'automatizacion-ia': {
    carpeta: 'ia',
    kwEs: 'Automatizaciones con IA',
    kwEn: 'AI automations',
    h2Es: 'La IA que ya trabaja en negocios de Honduras.',
    h2En: 'The AI already working in Honduran businesses.',
    pEs: 'No es una demo de feria: varias de estas ya corren en nuestros propios productos. Elegís las que te sirven y las conectamos a tu operación.',
    pEn: 'Not a trade-show demo: several of these already run in our own products. Pick the ones you need and we connect them to your operation.',
    items: automatizaciones,
  },
};
