/**
 * Foto principal de cada servicio (/public/servicios/<slug>.jpg, -768.jpg y -og.jpg).
 *
 * Generadas con IA a partir de escenas de negocios hondureños: el personal de
 * Kizercode lleva el polo con el logo y el cliente tiene algo de la marca
 * cerca (taza, sticker). El texto alternativo describe la escena con la
 * búsqueda del servicio: lo lee Google Imágenes y quien usa lector de pantalla.
 * Cámaras no está acá: usa fotos reales de instalaciones.
 */
export const fotos: Record<string, { altEs: string; altEn: string }> = {
  'paginas-web': {
    altEs: 'Dueña de una panadería en Honduras muestra a un cliente su nueva página web en el celular, con botón de WhatsApp y mapa',
    altEn: 'Bakery owner in Honduras shows a customer her new website on her phone, with a WhatsApp button and map',
  },
  'tiendas-en-linea': {
    altEs: 'Dueña de una boutique empaca un pedido mientras su tienda en línea muestra las órdenes nuevas en la laptop',
    altEn: 'Boutique owner packs an order while her online store shows new orders on the laptop',
  },
  'sistemas-a-la-medida': {
    altEs: 'Encargado de una ferretería revisa el inventario en una tablet con el sistema a la medida de Kizercode',
    altEn: 'Hardware store manager checks inventory on a tablet running a Kizercode custom system',
  },
  'apps-moviles': {
    altEs: 'Repartidor en moto revisa la ruta de entrega en una app móvil, en una calle de Honduras',
    altEn: 'Motorcycle courier checks his delivery route on a mobile app on a street in Honduras',
  },
  'automatizacion-ia': {
    altEs: 'Dueña de una mueblería toma café mientras un agente de IA responde a sus clientes por WhatsApp en la laptop',
    altEn: 'Furniture store owner drinks coffee while an AI agent answers her customers on WhatsApp on the laptop',
  },
  'crm-a-la-medida': {
    altEs: 'Equipo de ventas revisa el embudo de clientes en un CRM a la medida en el monitor de la oficina',
    altEn: 'Sales team reviews the customer pipeline in a custom CRM on the office monitor',
  },
  seo: {
    altEs: 'Dueño de un taller mecánico sonríe al ver su negocio de primero en Google desde el celular',
    altEn: 'Auto shop owner smiles seeing his business ranked first on Google on his phone',
  },
  anuncios: {
    altEs: 'Especialista de Kizercode revisa los resultados de una campaña de anuncios en Google y Facebook',
    altEn: 'Kizercode specialist reviews the results of a Google and Facebook ad campaign',
  },
  'redes-sociales': {
    altEs: 'Sesión de fotos con el celular para las redes sociales de una cafetería en Honduras',
    altEn: 'Phone photo shoot for the social media of a cafe in Honduras',
  },
  'modernizacion-web': {
    altEs: 'Diseñador de Kizercode le muestra a un dueño de negocio su página web vieja junto al rediseño nuevo',
    altEn: 'Kizercode designer shows a business owner his old website next to the new redesign',
  },
  'reparacion-computadoras': {
    altEs: 'Técnico de Kizercode instala un disco SSD en una laptop en el taller de El Progreso, Yoro',
    altEn: 'Kizercode technician installs an SSD in a laptop at the El Progreso, Yoro repair shop',
  },
  'reparacion-telefonos': {
    altEs: 'Técnico de Kizercode cambia la pantalla de un celular bajo la lupa en el taller de El Progreso',
    altEn: 'Kizercode technician replaces a phone screen under a magnifier at the El Progreso shop',
  },
};
