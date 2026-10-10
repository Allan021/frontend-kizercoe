/**
 * Lo que hacemos en web, por tipo. Alimenta la galería de /servicios/paginas-web.
 *
 * Cada tipo lleva su imagen de presentación (/public/web/<slug>.jpg y -768.jpg):
 * diseños de muestra en estilo Dribbble, no capturas de un cliente. `servicio`
 * enlaza a la página propia del servicio cuando existe.
 */
export type TipoWeb = {
  slug: string;
  tEs: string;
  tEn: string;
  dEs: string;
  dEn: string;
  /** Para quién o para qué, en una línea. */
  paraEs: string;
  paraEn: string;
  servicio?: string;
};

export const tiposWeb: TipoWeb[] = [
  {
    slug: 'landing',
    tEs: 'Landing page',
    tEn: 'Landing page',
    dEs: 'Una sola página pensada para que el visitante haga una cosa: escribirte, cotizar o comprar. Ideal para anuncios y lanzamientos.',
    dEn: 'A single page built so the visitor does one thing: message you, request a quote or buy. Ideal for ads and launches.',
    paraEs: 'Campañas, lanzamientos, un servicio puntual',
    paraEn: 'Campaigns, launches, a single service',
  },
  {
    slug: 'corporativo',
    tEs: 'Sitio corporativo',
    tEn: 'Corporate website',
    dEs: 'Varias páginas para contar quién sos, qué hacés y dónde estás: servicios, nosotros, contacto, mapa y WhatsApp.',
    dEn: 'Several pages to tell who you are, what you do and where you are: services, about, contact, map and WhatsApp.',
    paraEs: 'Empresas, profesionales, instituciones',
    paraEn: 'Companies, professionals, institutions',
  },
  {
    slug: 'blog',
    tEs: 'Blog o revista',
    tEn: 'Blog or magazine',
    dEs: 'Artículos que te posicionan en Google y responden lo que tu cliente pregunta. Con panel para publicar vos mismo.',
    dEn: 'Articles that rank you on Google and answer what your customers ask. With a panel to publish yourself.',
    paraEs: 'Marcas que quieren aparecer en Google',
    paraEn: 'Brands that want to show up on Google',
    servicio: 'seo',
  },
  {
    slug: 'tienda',
    tEs: 'Tienda en línea',
    tEn: 'Online store',
    dEs: 'Catálogo, carrito y pagos con tarjeta, con chatbot que atiende y pedidos que se confirman solos.',
    dEn: 'Catalog, cart and card payments, with a chatbot that serves customers and orders that confirm themselves.',
    paraEs: 'Boutiques, ferreterías, cualquier catálogo',
    paraEn: 'Boutiques, hardware stores, any catalog',
    servicio: 'tiendas-en-linea',
  },
  {
    slug: 'dashboard',
    tEs: 'Dashboard y panel',
    tEn: 'Dashboard and admin panel',
    dEs: 'Tus ventas, inventario y números del día en una pantalla, desde el celular o la compu. Conectado a tus datos reales.',
    dEn: 'Your sales, inventory and daily numbers on one screen, from your phone or computer. Connected to your real data.',
    paraEs: 'Dueños que quieren ver su negocio sin estar ahí',
    paraEn: 'Owners who want to see their business without being there',
    servicio: 'sistemas-a-la-medida',
  },
  {
    slug: 'crm',
    tEs: 'CRM y sistema propio',
    tEn: 'CRM and custom system',
    dEs: 'Clientes, seguimientos, cotizaciones y tareas en un solo lugar, hecho a la forma en que vendés vos.',
    dEn: 'Customers, follow-ups, quotes and tasks in one place, built around the way you sell.',
    paraEs: 'Equipos de venta, servicios, inmobiliarias',
    paraEn: 'Sales teams, services, real estate',
    servicio: 'crm-a-la-medida',
  },
  {
    slug: 'reservas',
    tEs: 'Reservas y citas',
    tEn: 'Bookings and appointments',
    dEs: 'Tu cliente elige día y hora en línea y le llega la confirmación por WhatsApp. Se acabó el ida y vuelta de mensajes.',
    dEn: 'Customers pick a day and time online and get the confirmation on WhatsApp. No more back-and-forth.',
    paraEs: 'Clínicas, salones, consultorios, talleres',
    paraEn: 'Clinics, salons, practices, workshops',
  },
  {
    slug: 'webapp',
    tEs: 'Aplicación web',
    tEn: 'Web application',
    dEs: 'Un sistema completo que se usa desde el navegador, con usuarios, permisos y funciones a la medida de tu operación.',
    dEn: 'A full system used from the browser, with users, permissions and features built for your operation.',
    paraEs: 'Procesos que hoy viven en Excel o en papel',
    paraEn: 'Processes that live in Excel or on paper today',
    servicio: 'sistemas-a-la-medida',
  },
];
