/**
 * Contenido extra de cada página de servicio: lo que Google y las IA necesitan
 * para entender y citar la página — palabra clave en el H1, el proceso, cuánto
 * cuesta y más preguntas frecuentes. Separado de servicios.ts para que esa
 * lista siga siendo legible.
 */
export type ServicioExtra = {
  /** Primera línea del H1, con la búsqueda real: "Diseño de páginas web en Honduras". */
  kwEs: string;
  kwEn: string;
  /** Cómo trabajamos, 4 pasos. */
  pasos: { tEs: string; tEn: string; dEs: string; dEn: string }[];
  /** "¿Cuánto cuesta X en Honduras?": 2-3 párrafos. */
  costoTituloEs: string;
  costoTituloEn: string;
  costoEs: string[];
  costoEn: string[];
  /** Preguntas que se suman a las de servicios.ts (no repetirlas). */
  faq: { qEs: string; qEn: string; aEs: string; aEn: string }[];
};

/* ---------- Piezas que se repiten (mismos hechos, una sola redacción) ---------- */

/** Software y marketing: se atiende a distancia. */
const faqDistancia = {
  qEs: '¿Atienden fuera de El Progreso?',
  qEn: 'Do you work with clients outside El Progreso?',
  aEs: 'Sí. Trabajamos a distancia con negocios de toda Honduras y con clientes fuera del país, en español o en inglés. El diagnóstico, las revisiones y la entrega se coordinan por llamada, WhatsApp o correo.',
  aEn: 'Yes. We work remotely with businesses all over Honduras and with clients abroad, in Spanish or English. The diagnosis, the reviews and the handover are handled by phone call, WhatsApp or email.',
};

/** Taller: horario y dónde estamos. */
const faqHorario = {
  qEs: '¿Dónde están y qué horario tienen?',
  qEn: 'Where are you and what are your hours?',
  aEs: 'Estamos en Plaza Bendeck, El Progreso, Yoro. Atendemos de lunes a sábado de 7:00 a.m. a 6:00 p.m. Podés escribirnos antes al WhatsApp +504 8809-1744.',
  aEn: 'We are at Plaza Bendeck, El Progreso, Yoro, Honduras. We are open Monday to Saturday, 7:00 a.m. to 6:00 p.m. You can message us first on WhatsApp at +504 8809-1744.',
};

/** Taller: el equipo se recibe en el local. */
const faqFueraTaller = {
  qEs: '¿Atienden fuera de El Progreso?',
  qEn: 'Do you serve customers outside El Progreso?',
  aEs: 'Las reparaciones se hacen en nuestro taller de Plaza Bendeck, El Progreso. Si venís de otra ciudad, mandanos una foto por WhatsApp y coordinamos la recepción del equipo antes de que viajés.',
  aEn: 'Repairs are done at our shop in Plaza Bendeck, El Progreso. If you are coming from another city, send us a photo on WhatsApp and we coordinate the drop-off before you travel.',
};

/** Software: los 4 pasos de siempre, con el paso 3 propio de cada servicio. */
const pasosSoftware = (
  construye: { tEs: string; tEn: string; dEs: string; dEn: string },
  entrega: { dEs: string; dEn: string },
) => [
  {
    tEs: 'Diagnóstico gratis',
    tEn: 'Free diagnosis',
    dEs: 'Una llamada de 30 minutos para entender tu negocio y decirte qué te conviene, sin compromiso.',
    dEn: 'A 30-minute call to understand your business and tell you what suits you, no strings attached.',
  },
  {
    tEs: 'Precio fijo por escrito',
    tEn: 'Fixed price in writing',
    dEs: 'Recibís la cotización con el monto exacto en lempiras o dólares. No se mueve.',
    dEn: 'You get a quote with the exact amount in lempiras or dollars. It does not move.',
  },
  construye,
  { tEs: 'Entrega y 30 días de garantía', tEn: 'Handover and 30-day warranty', ...entrega },
];

/* ---------- Contenido por servicio ---------- */

export const extras: Record<string, ServicioExtra> = {
  'paginas-web': {
    kwEs: 'Diseño de páginas web en Honduras',
    kwEn: 'Website design in Honduras',
    pasos: pasosSoftware(
      {
        tEs: 'Diseño que aprobás',
        tEn: 'Design you approve',
        dEs: 'Te mostramos el diseño con tu marca antes de publicar y lo ajustamos con vos.',
        dEn: 'We show you the design with your brand before publishing and adjust it with you.',
      },
      {
        dEs: 'Publicada con dominio y hosting a tu nombre. Si algo de lo entregado falla, lo corregimos gratis.',
        dEn: 'Published with domain and hosting under your name. If anything we delivered fails, we fix it free.',
      },
    ),
    costoTituloEs: '¿Cuánto cuesta una página web en Honduras?',
    costoTituloEn: 'How much does a website cost in Honduras?',
    costoEs: [
      'Una página web con Kizercode cuesta desde L 4,000 (unos $150), en pago único. Ese precio cubre una página para tu negocio con diseño propio, botón de WhatsApp, mapa de Google, optimizada para celular, SEO básico y 30 días de garantía.',
      'Lo que mueve el precio es el alcance: cuántas secciones o páginas necesitás, si hay que escribir el contenido desde cero, si querés un panel para publicar vos mismo o si necesitás formularios, idiomas o integraciones extra. Una página sencilla queda cerca del precio de partida.',
      'Después del diagnóstico gratis te mandamos el precio fijo exacto por escrito, en lempiras o dólares. Ese monto no se mueve, y los cambios nuevos que pidás después se cotizan aparte para que vos decidás.',
    ],
    costoEn: [
      'A website with Kizercode starts at $150 (L 4,000), as a one-time payment. That covers a site for your business with its own design, a WhatsApp button, a Google map, mobile optimization, basic SEO and a 30-day warranty.',
      'What moves the price is scope: how many sections or pages you need, whether the content has to be written from scratch, whether you want a panel to publish yourself, or whether you need forms, languages or extra integrations. A simple site stays close to the starting price.',
      'After the free diagnosis we send you the exact fixed price in writing, in lempiras or dollars. That amount does not move, and any new changes you ask for later are quoted separately so you decide.',
    ],
    faq: [
      {
        qEs: '¿Necesito dominio y hosting?',
        qEn: 'Do I need a domain and hosting?',
        aEs: 'Sí: el dominio es la dirección (tunegocio.com) y el hosting es donde vive la página. Nosotros los configuramos y quedan registrados a tu nombre, no al nuestro.',
        aEn: 'Yes: the domain is the address (yourbusiness.com) and hosting is where the site lives. We set them up and they are registered under your name, not ours.',
      },
      {
        qEs: '¿La página queda a mi nombre?',
        qEn: 'Is the website under my name?',
        aEs: 'Sí. Código, dominio, hosting y archivos de diseño quedan registrados a nombre de tu negocio. Si un día cambiás de proveedor, te llevás todo.',
        aEn: 'Yes. Code, domain, hosting and design files are registered to your business. If you ever change providers, you take everything with you.',
      },
      {
        qEs: '¿Mi página va a salir en Google?',
        qEn: 'Will my website show up on Google?',
        aEs: 'La entregamos con SEO básico y tu ficha de Google Business conectada, que es la base para aparecer cuando te buscan. Si querés pelear búsquedas competidas, eso es el servicio de SEO aparte.',
        aEn: 'We deliver it with basic SEO and your Google Business profile connected, which is the foundation for showing up when people search for you. Competing for harder searches is our separate SEO service.',
      },
      {
        qEs: '¿Qué garantía tiene?',
        qEn: 'What warranty does it have?',
        aEs: '30 días de garantía: si algo de lo que entregamos falla, lo corregimos gratis. Después, los cambios nuevos se cotizan aparte o van en un plan mensual de soporte.',
        aEn: 'A 30-day warranty: if anything we delivered fails, we fix it free. After that, new changes are quoted separately or covered by a monthly support plan.',
      },
      faqDistancia,
    ],
  },

  'tiendas-en-linea': {
    kwEs: 'Tiendas en línea en Honduras',
    kwEn: 'Online stores in Honduras',
    pasos: pasosSoftware(
      {
        tEs: 'Tienda armada con tu catálogo',
        tEn: 'Store built with your catalog',
        dEs: 'Montamos catálogo, carrito, pasarela de pago, el chatbot con las respuestas de tu negocio y los avisos automáticos de cada pedido. La revisás y la probás antes de abrirla al público.',
        dEn: 'We set up the catalog, cart, payment gateway, the chatbot with your business’s answers and the automatic notifications for each order. You review and test it before it opens to the public.',
      },
      {
        dEs: 'Te dejamos el panel para subir productos vos mismo y los pagos con tarjeta funcionando. Si algo de lo entregado falla, lo corregimos gratis.',
        dEn: 'We hand you the panel to upload products yourself, with card payments working. If anything we delivered fails, we fix it free.',
      },
    ),
    costoTituloEs: '¿Cuánto cuesta una tienda en línea en Honduras?',
    costoTituloEn: 'How much does an online store cost in Honduras?',
    costoEs: [
      'Una tienda en línea con Kizercode cuesta desde L 14,500 (unos $550), en pago único. Incluye catálogo con fotos, variantes y precios, carrito, pasarela de pago con tarjeta de crédito y débito, chatbot con IA, avisos automáticos de pedido, panel para subir tus productos y 30 días de garantía. No le pagás comisión a ninguna plataforma por cada venta.',
      'El precio sube o baja según el tamaño del catálogo, cuántos métodos de pago hay que configurar (tarjeta, transferencia, contra entrega), si el chatbot también atiende tu WhatsApp, qué tareas querés automatizar y si la tienda se conecta a tu inventario de KizerPOS. Te damos el precio fijo exacto por escrito después del diagnóstico gratis.',
    ],
    costoEn: [
      'An online store with Kizercode starts at $550 (L 14,500), as a one-time payment. It includes a catalog with photos, variants and prices, a cart, a credit and debit card payment gateway, an AI chatbot, automatic order notifications, a panel to upload your products and a 30-day warranty. You pay no platform commission on any sale.',
      'The price goes up or down with catalog size, how many payment methods need setting up (card, transfer, cash on delivery), whether the chatbot also answers your WhatsApp, which tasks you want automated and whether the store connects to your KizerPOS inventory. You get the exact fixed price in writing after the free diagnosis.',
    ],
    faq: [
      {
        qEs: '¿Qué hace el chatbot de la tienda?',
        qEn: 'What does the store chatbot do?',
        aEs: 'Es un asistente con IA que contesta a tus clientes a cualquier hora: precios, existencias, tallas, envíos y formas de pago. Les ayuda a encontrar el producto y los lleva hasta el pedido. Funciona en la tienda y, si querés, también en tu WhatsApp. Cuando la pregunta se sale de lo que sabe, te pasa la conversación a vos.',
        aEn: 'It is an AI assistant that answers your customers at any hour: prices, stock, sizes, shipping and payment methods. It helps them find the product and walks them to the order. It works on the store and, if you want, on your WhatsApp too. When a question goes beyond what it knows, it hands the conversation to you.',
      },
      {
        qEs: '¿Con qué pasarelas de pago trabajan?',
        qEn: 'Which payment gateways do you work with?',
        aEs: 'Con las pasarelas que operan en Honduras, como las de tu banco, para cobrar con tarjeta de crédito y débito. Te ayudamos a elegir la que te conviene según sus comisiones y la dejamos conectada a la tienda. La comisión de la pasarela la cobra el banco o la pasarela, no nosotros.',
        aEn: 'With the gateways that operate in Honduras, such as your bank’s, to take credit and debit cards. We help you pick the one that suits you based on its fees and leave it connected to the store. The gateway fee is charged by the bank or gateway, not by us.',
      },
      {
        qEs: '¿Qué tareas se automatizan?',
        qEn: 'Which tasks get automated?',
        aEs: 'Las que hoy hacés a mano todos los días: el mensaje de confirmación cuando entra un pedido, los avisos de estado (preparando, enviado, entregado) y la alerta cuando un producto se está quedando sin existencias. Si tenés otra tarea repetitiva, la vemos en el diagnóstico.',
        aEn: 'The ones you do by hand every day: the confirmation message when an order comes in, status updates (preparing, shipped, delivered) and the alert when a product is running low. If you have another repetitive task, we look at it in the diagnosis.',
      },
      {
        qEs: '¿Tengo que pagar comisión por cada venta?',
        qEn: 'Do I pay a commission on each sale?',
        aEs: 'No. La tienda es tuya y no le pagás porcentaje a ninguna plataforma por venta. Pagás la tienda una vez, desde L 14,500.',
        aEn: 'No. The store is yours and you pay no percentage to any platform per sale. You pay for the store once, from $550.',
      },
      {
        qEs: '¿Puedo recibir pedidos por WhatsApp en vez de pago en línea?',
        qEn: 'Can I take orders on WhatsApp instead of online payment?',
        aEs: 'Sí. Si preferís cerrar la venta por WhatsApp, la tienda manda el pedido armado a tu número y vos coordinás pago y entrega.',
        aEn: 'Yes. If you prefer to close the sale on WhatsApp, the store sends the full order to your number and you arrange payment and delivery.',
      },
      {
        qEs: '¿Se conecta con el inventario de mi local?',
        qEn: 'Does it connect to my shop inventory?',
        aEs: 'Si usás KizerPOS, sí: la tienda y el local comparten existencias, y lo que se vende en uno se descuenta en el otro.',
        aEn: 'If you run KizerPOS, yes: the store and the shop share stock, and a sale in one is deducted in the other.',
      },
      {
        qEs: '¿La tienda queda a mi nombre?',
        qEn: 'Is the store under my name?',
        aEs: 'Sí. Código, dominio, hosting y base de datos quedan registrados a nombre de tu negocio, con 30 días de garantía sobre lo entregado.',
        aEn: 'Yes. Code, domain, hosting and database are registered to your business, with a 30-day warranty on what we deliver.',
      },
      faqDistancia,
    ],
  },

  'sistemas-a-la-medida': {
    kwEs: 'Software a la medida en Honduras',
    kwEn: 'Custom software development in Honduras',
    pasos: pasosSoftware(
      {
        tEs: 'Prototipo y demos semanales',
        tEn: 'Prototype and weekly demos',
        dEs: 'Mapeamos tu proceso, aprobás un prototipo antes de programar y ves avances cada semana.',
        dEn: 'We map your process, you approve a prototype before coding and you see progress every week.',
      },
      {
        dEs: 'Migramos tus datos, capacitamos a tu equipo y el código queda a tu nombre. Si algo falla, lo corregimos gratis.',
        dEn: 'We migrate your data, train your team and the code stays under your name. If anything fails, we fix it free.',
      },
    ),
    costoTituloEs: '¿Cuánto cuesta un sistema a la medida en Honduras?',
    costoTituloEn: 'How much does custom software cost in Honduras?',
    costoEs: [
      'Un sistema a la medida con Kizercode cuesta desde L 25,000 (unos $950), en pago único. Incluye levantamiento de tu proceso, prototipo aprobado por vos, roles y permisos, reportes en vivo, migración de tus datos, capacitación y código a tu nombre.',
      'Lo que define el precio es cuánto cubre el sistema: cuántos módulos (inventario, facturación, pedidos, aprobaciones), cuántos roles y sucursales, si hay que conectarlo con otros programas, si debe funcionar sin internet y si incluye equipo como terminales, impresoras o lectores.',
      'Después del diagnóstico gratis recibís el precio fijo exacto por escrito. Los cambios nuevos que pidás después se cotizan aparte y vos decidís; el soporte continuo puede ir en un plan mensual.',
    ],
    costoEn: [
      'A custom system with Kizercode starts at $950 (L 25,000), as a one-time payment. It includes mapping your process, a prototype you approve, roles and permissions, live reports, data migration, team training and code under your name.',
      'What sets the price is how much the system covers: how many modules (inventory, billing, orders, approvals), how many roles and branches, whether it must connect to other software, whether it must work offline, and whether it includes hardware such as terminals, printers or scanners.',
      'After the free diagnosis you get the exact fixed price in writing. New changes you ask for later are quoted separately and you decide; ongoing support can run on a monthly plan.',
    ],
    faq: [
      {
        qEs: '¿Por qué un sistema a la medida y no uno de suscripción?',
        qEn: 'Why custom software instead of a subscription tool?',
        aEs: 'Porque calza con tu proceso real en lugar de obligarte a trabajar como dice el software, y lo pagás una vez. El código, la base de datos y el dominio quedan a tu nombre.',
        aEn: 'Because it fits your real process instead of forcing you to work the software’s way, and you pay once. The code, database and domain stay under your name.',
      },
      {
        qEs: '¿Pueden pasar mis datos de Excel al sistema?',
        qEn: 'Can you move my Excel data into the system?',
        aEs: 'Sí. La migración de tus datos desde Excel o desde un sistema viejo va incluida en el proyecto.',
        aEn: 'Yes. Migrating your data from Excel or a legacy system is included in the project.',
      },
      {
        qEs: '¿También instalan las computadoras e impresoras?',
        qEn: 'Do you also install the computers and printers?',
        aEs: 'Sí. Suministramos e instalamos terminales, impresoras y lectores en tu local, configurados con el sistema y cotizados en la misma propuesta.',
        aEn: 'Yes. We supply and install terminals, printers and scanners at your place, configured with the system and quoted in the same proposal.',
      },
      {
        qEs: '¿Qué garantía tiene el sistema?',
        qEn: 'What warranty does the system have?',
        aEs: '30 días de garantía: si algo de lo entregado falla, lo corregimos gratis. Después, el soporte continuo va en un plan mensual o se cotiza por cambio.',
        aEn: 'A 30-day warranty: if anything we delivered fails, we fix it free. After that, ongoing support runs on a monthly plan or is quoted per change.',
      },
      faqDistancia,
    ],
  },

  'apps-moviles': {
    kwEs: 'Desarrollo de apps móviles en Honduras',
    kwEn: 'Mobile app development in Honduras',
    pasos: pasosSoftware(
      {
        tEs: 'Pantallas aprobadas y demos',
        tEn: 'Approved screens and demos',
        dEs: 'Diseñamos cada pantalla, la aprobás en prototipo y ves la app avanzar con demos semanales.',
        dEn: 'We design every screen, you approve it as a prototype and you see the app progress in weekly demos.',
      },
      {
        dEs: 'La publicamos en App Store y Google Play a nombre de tu empresa. Si algo falla, lo corregimos gratis.',
        dEn: 'We publish it on App Store and Google Play under your company. If anything fails, we fix it free.',
      },
    ),
    costoTituloEs: '¿Cuánto cuesta hacer una app en Honduras?',
    costoTituloEn: 'How much does an app cost in Honduras?',
    costoEs: [
      'Una app móvil con Kizercode cuesta desde L 37,000 (unos $1,400), en pago único. Incluye el diseño de cada pantalla, iOS y Android con una sola base de código, conexión con tu sistema o tienda, notificaciones push, publicación en las tiendas y código a tu nombre.',
      'El precio depende de cuántas pantallas y funciones lleva la app, si se conecta a un sistema que ya existe o hay que construir el sistema también, y si necesita pagos, mapas o cuentas de usuario. Hacer las dos plataformas con una sola base de código mantiene el costo más bajo que dos apps separadas.',
    ],
    costoEn: [
      'A mobile app with Kizercode starts at $1,400 (L 37,000), as a one-time payment. It includes every screen designed, iOS and Android from one codebase, connection to your system or store, push notifications, app store publishing and code under your name.',
      'The price depends on how many screens and features the app has, whether it connects to an existing system or the system must be built too, and whether it needs payments, maps or user accounts. Building both platforms from one codebase keeps the cost lower than two separate apps.',
    ],
    faq: [
      {
        qEs: '¿La app funciona en iPhone y Android?',
        qEn: 'Does the app work on iPhone and Android?',
        aEs: 'Sí. La desarrollamos con una sola base de código que sale para iOS y Android, y la publicamos en App Store y Google Play.',
        aEn: 'Yes. We build it from one codebase that ships to iOS and Android, and we publish it on App Store and Google Play.',
      },
      {
        qEs: '¿El código de la app es mío?',
        qEn: 'Is the app’s code mine?',
        aEs: 'Sí. El código y las cuentas de App Store y Google Play quedan a nombre de tu empresa. Si cambiás de proveedor, te llevás todo.',
        aEn: 'Yes. The code and the App Store and Google Play accounts are under your company’s name. If you change providers, you take everything.',
      },
      {
        qEs: '¿La app se puede conectar con mi sistema o tienda en línea?',
        qEn: 'Can the app connect to my system or online store?',
        aEs: 'Sí, ese es el punto: la app habla con tu sistema, tu tienda o tu inventario, y no queda como una pieza aislada.',
        aEn: 'Yes, that is the point: the app talks to your system, store or inventory instead of being an isolated piece.',
      },
      {
        qEs: '¿Qué garantía tiene la app?',
        qEn: 'What warranty does the app have?',
        aEs: '30 días de garantía: si algo de lo entregado falla, lo corregimos gratis. Las mejoras y versiones nuevas se cotizan aparte o van en plan mensual.',
        aEn: 'A 30-day warranty: if anything we delivered fails, we fix it free. Improvements and new versions are quoted separately or run on a monthly plan.',
      },
      faqDistancia,
    ],
  },

  'automatizacion-ia': {
    kwEs: 'Automatización con IA y chatbots en Honduras',
    kwEn: 'AI automation and chatbots in Honduras',
    pasos: pasosSoftware(
      {
        tEs: 'Agente con tus datos y reglas',
        tEn: 'Agent with your data and rules',
        dEs: 'Cargamos tu catálogo y tus precios, definimos con vos qué responde sola y cuándo te pasa el cliente, y lo probás antes de activarlo.',
        dEn: 'We load your catalog and prices, define with you what it answers alone and when it hands over, and you test it before going live.',
      },
      {
        dEs: 'Queda atendiendo en WhatsApp con todo registrado en tu sistema. Si algo falla, lo corregimos gratis.',
        dEn: 'It goes live on WhatsApp with everything logged in your system. If anything fails, we fix it free.',
      },
    ),
    costoTituloEs: '¿Cuánto cuesta un chatbot con IA para WhatsApp en Honduras?',
    costoTituloEn: 'How much does an AI WhatsApp chatbot cost in Honduras?',
    costoEs: [
      'Un agente de IA para WhatsApp con Kizercode cuesta desde L 8,000 (unos $300). Incluye el agente con tu tono y tus precios, cotizaciones automáticas registradas, traspaso a un humano cuando hace falta, reglas definidas por vos y un reporte de lo que más pregunta la gente.',
      'El precio crece con lo que la IA tiene que hacer: el tamaño de tu catálogo, cuántos flujos repetitivos automatizamos, y si se conecta a tu sistema o inventario. Después del diagnóstico gratis te damos el precio fijo exacto por escrito.',
    ],
    costoEn: [
      'An AI agent for WhatsApp with Kizercode starts at $300 (L 8,000). It includes the agent with your tone and prices, logged automatic quotes, handover to a human when needed, rules defined by you and a report of what people ask the most.',
      'The price grows with what the AI has to do: the size of your catalog, how many repetitive workflows we automate, and whether it connects to your system or inventory. After the free diagnosis we give you the exact fixed price in writing.',
    ],
    faq: [
      {
        qEs: '¿Qué puede hacer una IA en el WhatsApp de mi negocio?',
        qEn: 'What can an AI do on my business WhatsApp?',
        aEs: 'Responder las preguntas repetidas (precios, horarios, disponibilidad), cotizar con tu lista de precios real y registrar cada consulta en tu sistema, a cualquier hora.',
        aEn: 'Answer repeated questions (prices, hours, availability), quote from your real price list and log every inquiry in your system, at any hour.',
      },
      {
        qEs: '¿Puedo hablar yo con el cliente cuando quiera?',
        qEn: 'Can I take over the conversation whenever I want?',
        aEs: 'Sí. Vos definís cuándo la IA te pasa el cliente, y lo delicado o lo que no sabe te llega a vos con la conversación completa.',
        aEn: 'Yes. You define when the AI hands the customer to you, and anything sensitive or unknown reaches you with the full conversation.',
      },
      {
        qEs: '¿Queda registro de lo que responde la IA?',
        qEn: 'Is there a record of what the AI answers?',
        aEs: 'Sí. Cada conversación y cada cotización queda guardada en tu sistema, auditable, y te damos un reporte de lo que más pregunta la gente.',
        aEn: 'Yes. Every conversation and quote is stored in your system, auditable, and you get a report of what people ask the most.',
      },
      {
        qEs: '¿Se puede automatizar algo más que el WhatsApp?',
        qEn: 'Can you automate more than WhatsApp?',
        aEs: 'Sí. También automatizamos flujos repetitivos de tu operación; en el diagnóstico gratis vemos cuáles valen la pena.',
        aEn: 'Yes. We also automate repetitive workflows in your operation; in the free diagnosis we see which ones are worth it.',
      },
      faqDistancia,
    ],
  },

  'crm-a-la-medida': {
    kwEs: 'CRM a la medida en Honduras',
    kwEn: 'Custom CRM in Honduras',
    pasos: pasosSoftware(
      {
        tEs: 'Tu embudo, construido',
        tEn: 'Your funnel, built',
        dEs: 'Armamos tus etapas de venta, importamos tus contactos y conectamos WhatsApp, con avances que revisás cada semana.',
        dEn: 'We build your sales stages, import your contacts and connect WhatsApp, with progress you review every week.',
      },
      {
        dEs: 'Capacitamos a tus vendedores y el CRM queda a tu nombre. Si algo falla, lo corregimos gratis.',
        dEn: 'We train your sales team and the CRM stays under your name. If anything fails, we fix it free.',
      },
    ),
    costoTituloEs: '¿Cuánto cuesta un CRM a la medida en Honduras?',
    costoTituloEn: 'How much does a custom CRM cost in Honduras?',
    costoEs: [
      'La mayoría de los CRM que hacemos caen en el rango de un sistema a la medida, que arranca desde L 25,000 (unos $950), en pago único. A diferencia de un CRM de suscripción, no pagás licencia mensual por cada usuario: agregar un vendedor no sube la cuenta.',
      'El precio depende de tu embudo: cuántas etapas de venta y vendedores, si querés cotizaciones desde el CRM, la conexión con WhatsApp, qué reportes necesitás y cuántos contactos hay que migrar. Te damos el precio fijo exacto por escrito tras el diagnóstico gratis.',
    ],
    costoEn: [
      'Most CRMs we build fall in the custom-system range, which starts at $950 (L 25,000), as a one-time payment. Unlike a subscription CRM, there is no monthly license per user: adding a salesperson does not raise the bill.',
      'The price depends on your funnel: how many sales stages and salespeople, whether you want quotes from the CRM, the WhatsApp connection, which reports you need and how many contacts must be migrated. You get the exact fixed price in writing after the free diagnosis.',
    ],
    faq: [
      {
        qEs: '¿Qué es un CRM y para qué sirve?',
        qEn: 'What is a CRM and what is it for?',
        aEs: 'Es el lugar donde queda cada cliente con su historial: quién preguntó, a quién se le cotizó y a quién hay que llamar hoy. Sirve para que ninguna venta se pierda por falta de seguimiento.',
        aEn: 'It is where every customer lives with their history: who asked, who got a quote and who to call today. It keeps sales from being lost for lack of follow-up.',
      },
      {
        qEs: '¿Se conecta con WhatsApp?',
        qEn: 'Does it connect to WhatsApp?',
        aEs: 'Sí. Las conversaciones quedan pegadas a la ficha de cada cliente, junto con sus cotizaciones y recordatorios de seguimiento.',
        aEn: 'Yes. Conversations stay attached to each customer record, along with their quotes and follow-up reminders.',
      },
      {
        qEs: '¿Hay que pagar por cada usuario?',
        qEn: 'Do I pay per user?',
        aEs: 'No. El CRM es tuyo y lo pagás una vez; agregar vendedores no cuesta mensualidad.',
        aEn: 'No. The CRM is yours and you pay once; adding salespeople has no monthly fee.',
      },
      {
        qEs: '¿Qué reportes trae?',
        qEn: 'What reports does it include?',
        aEs: 'Reportes de ventas y de conversión por etapa, para que veás dónde se caen los clientes y qué vendedor necesita apoyo.',
        aEn: 'Sales and conversion reports by stage, so you see where customers drop off and which salesperson needs support.',
      },
      faqDistancia,
    ],
  },

  seo: {
    kwEs: 'Posicionamiento SEO en Honduras',
    kwEn: 'SEO services in Honduras',
    pasos: [
      {
        tEs: 'Diagnóstico gratis',
        tEn: 'Free diagnosis',
        dEs: 'Revisamos tu sitio y tu ficha de Google Business, y te decimos qué está frenando tu posición.',
        dEn: 'We review your site and your Google Business profile and tell you what is holding back your ranking.',
      },
      {
        tEs: 'Plan y precio por escrito',
        tEn: 'Plan and price in writing',
        dEs: 'Elegimos las palabras clave de tu rubro y tu zona, y te damos el precio por escrito.',
        dEn: 'We pick the keywords for your industry and area, and give you the price in writing.',
      },
      {
        tEs: 'Trabajo técnico y contenido',
        tEn: 'Technical work and content',
        dEs: 'Velocidad, datos estructurados, contenido que responde lo que buscan y Google Business optimizado.',
        dEn: 'Speed, structured data, content that answers what people search and an optimized Google Business profile.',
      },
      {
        tEs: 'Reporte mensual',
        tEn: 'Monthly report',
        dEs: 'Cada mes ves en qué posición estás y cuánta gente llega, sin humo.',
        dEn: 'Every month you see your position and how many people arrive, no smoke.',
      },
    ],
    costoTituloEs: '¿Cuánto cuesta el SEO en Honduras?',
    costoTituloEn: 'How much does SEO cost in Honduras?',
    costoEs: [
      'El SEO no tiene un precio único porque depende de dónde arrancás: no es lo mismo un sitio que ya existe y solo necesita ajustes que uno lento, sin contenido y sin ficha de Google Business. Por eso empezamos con un diagnóstico gratis y te damos el precio por escrito.',
      'Lo que mueve el costo es cuántas palabras clave vamos a trabajar, qué tan competidas están en tu rubro y tu zona, cuánto contenido hay que escribir y cuánto trabajo técnico necesita el sitio. Si todavía no tenés página, una web con SEO básico arranca desde L 4,000 (unos $150).',
    ],
    costoEn: [
      'SEO has no single price because it depends on where you start: a site that exists and only needs tuning is not the same as a slow one with no content and no Google Business profile. That is why we start with a free diagnosis and give you the price in writing.',
      'What moves the cost is how many keywords we work on, how competitive they are in your industry and area, how much content must be written and how much technical work the site needs. If you do not have a website yet, a site with basic SEO starts at $150 (L 4,000).',
    ],
    faq: [
      {
        qEs: '¿Qué es el SEO local?',
        qEn: 'What is local SEO?',
        aEs: 'Es aparecer en Google y en Maps cuando alguien busca lo que vendés cerca de donde está. Se trabaja con tu ficha de Google Business completa, reseñas, fotos y una página con los datos correctos.',
        aEn: 'It is showing up on Google and Maps when someone searches for what you sell near them. It is built on a complete Google Business profile, reviews, photos and a website with correct data.',
      },
      {
        qEs: '¿Qué incluye el servicio de SEO?',
        qEn: 'What does the SEO service include?',
        aEs: 'Auditoría técnica de tu sitio, palabras clave de tu rubro y tu zona, contenido que responde lo que buscan, Google Business optimizado, velocidad y datos estructurados, y un reporte mensual de posiciones.',
        aEn: 'A technical audit of your site, keywords for your industry and area, content answering what people search, an optimized Google Business profile, speed and structured data, and a monthly ranking report.',
      },
      {
        qEs: '¿Cómo sé si el SEO está funcionando?',
        qEn: 'How do I know SEO is working?',
        aEs: 'Cada mes recibís un reporte con tu posición en las búsquedas que trabajamos y cuánta gente llega a tu sitio. Medido, no prometido.',
        aEn: 'Every month you get a report with your position on the searches we work on and how many people reach your site. Measured, not promised.',
      },
      {
        qEs: '¿Pueden hacer SEO a una página que no hicieron ustedes?',
        qEn: 'Can you do SEO on a site you did not build?',
        aEs: 'Sí. El diagnóstico nos dice si basta con ajustarla o si conviene modernizarla; si es un rediseño, eso sale desde L 6,500.',
        aEn: 'Yes. The diagnosis tells us whether tuning it is enough or whether it should be modernized; a redesign starts at $250.',
      },
      faqDistancia,
    ],
  },

  anuncios: {
    kwEs: 'Publicidad en Google y Facebook en Honduras',
    kwEn: 'Google and Facebook ads in Honduras',
    pasos: [
      {
        tEs: 'Diagnóstico gratis',
        tEn: 'Free diagnosis',
        dEs: 'Vemos qué vendés, a quién y con qué presupuesto, y te decimos dónde conviene anunciar.',
        dEn: 'We look at what you sell, to whom and with what budget, and tell you where it pays to advertise.',
      },
      {
        tEs: 'Medición antes de gastar',
        tEn: 'Tracking before spending',
        dEs: 'Configuramos píxel y conversiones en tus cuentas para rastrear cada mensaje, llamada y formulario.',
        dEn: 'We set up the pixel and conversions in your accounts to track every message, call and form.',
      },
      {
        tEs: 'Campañas y página de aterrizaje',
        tEn: 'Campaigns and landing page',
        dEs: 'Diseñamos los anuncios y la página a la que llegan, hecha para convertir.',
        dEn: 'We design the ads and the page they land on, built to convert.',
      },
      {
        tEs: 'Optimización y reporte semanal',
        tEn: 'Weekly optimization and report',
        dEs: 'Lo que no rinde se apaga, lo que rinde recibe más, y te lo contamos cada semana en cristiano.',
        dEn: 'What underperforms gets turned off, what performs gets more, and we report it weekly in plain words.',
      },
    ],
    costoTituloEs: '¿Cuánto cuesta anunciarse en Google y Facebook en Honduras?',
    costoTituloEn: 'How much does advertising on Google and Facebook cost in Honduras?',
    costoEs: [
      'Hay dos costos separados. La pauta es lo que le pagás directo a Google o Meta desde tu propia cuenta; se puede empezar con poco, unos L 3,000 a 5,000 al mes, y escalar cuando los números lo justifiquen. Aparte va nuestro fee por la gestión.',
      'El fee de gestión depende de cuántas plataformas manejamos (Google, Meta o las dos), cuántas campañas y anuncios hay que diseñar y si hace falta construir una página de aterrizaje. Te lo damos por escrito después del diagnóstico gratis, antes de gastar un lempira en pauta.',
    ],
    costoEn: [
      'There are two separate costs. Ad spend is what you pay Google or Meta directly from your own account; you can start small, around $120 to $200 a month, and scale when the numbers justify it. Our management fee is separate.',
      'The management fee depends on how many platforms we run (Google, Meta or both), how many campaigns and ads need designing, and whether a landing page has to be built. We give it to you in writing after the free diagnosis, before a cent goes into ads.',
    ],
    faq: [
      {
        qEs: '¿Conviene anunciar en Google o en Facebook e Instagram?',
        qEn: 'Should I advertise on Google or on Facebook and Instagram?',
        aEs: 'Depende de cómo te buscan: Google capta al que ya está buscando lo que vendés, y Meta te pone frente a gente que todavía no te conoce. En el diagnóstico gratis te decimos cuál conviene para tu negocio.',
        aEn: 'It depends on how people find you: Google catches whoever is already searching for what you sell, and Meta puts you in front of people who do not know you yet. In the free diagnosis we tell you which suits your business.',
      },
      {
        qEs: '¿Las cuentas de publicidad quedan a mi nombre?',
        qEn: 'Are the ad accounts under my name?',
        aEs: 'Sí. Las cuentas publicitarias y el píxel quedan a tu nombre, con todo su historial, aunque un día dejés de trabajar con nosotros.',
        aEn: 'Yes. The ad accounts and the pixel stay under your name, with their full history, even if you stop working with us someday.',
      },
      {
        qEs: '¿Cómo sé cuánto me costó cada cliente?',
        qEn: 'How do I know what each customer cost me?',
        aEs: 'Configuramos píxel y conversiones para rastrear cada mensaje, llamada y formulario hasta el anuncio que lo generó, y te lo mostramos en el reporte semanal.',
        aEn: 'We set up the pixel and conversions to track every message, call and form back to the ad that generated it, and show it to you in the weekly report.',
      },
      {
        qEs: '¿Ustedes diseñan los anuncios?',
        qEn: 'Do you design the ads?',
        aEs: 'Sí. El diseño de los anuncios y la página de aterrizaje van incluidos en la gestión.',
        aEn: 'Yes. Ad design and the landing page are included in the management.',
      },
      faqDistancia,
    ],
  },

  'redes-sociales': {
    kwEs: 'Manejo de redes sociales en Honduras',
    kwEn: 'Social media management in Honduras',
    pasos: [
      {
        tEs: 'Diagnóstico gratis',
        tEn: 'Free diagnosis',
        dEs: 'Revisamos tus perfiles, tu marca y lo que vendés, y definimos qué redes vale la pena trabajar.',
        dEn: 'We review your profiles, brand and what you sell, and decide which networks are worth working on.',
      },
      {
        tEs: 'Plan mensual por escrito',
        tEn: 'Monthly plan in writing',
        dEs: 'Te damos el precio por escrito según cuántas redes y cuántas piezas al mes.',
        dEn: 'We give you the price in writing based on how many networks and pieces per month.',
      },
      {
        tEs: 'Calendario y piezas',
        tEn: 'Calendar and pieces',
        dEs: 'Armamos el calendario del mes con tus promociones y diseñamos cada pieza con tu marca.',
        dEn: 'We build the month’s calendar around your promos and design every piece on-brand.',
      },
      {
        tEs: 'Publicación, respuestas y reporte',
        tEn: 'Posting, replies and report',
        dEs: 'Publicamos, contestamos lo común, te pasamos lo delicado y cada mes te mostramos el alcance.',
        dEn: 'We post, answer the common questions, hand you the sensitive ones and show you the reach every month.',
      },
    ],
    costoTituloEs: '¿Cuánto cuesta el manejo de redes sociales en Honduras?',
    costoTituloEn: 'How much does social media management cost in Honduras?',
    costoEs: [
      'El manejo de redes es un plan mensual, no un pago único. El precio se arma según cuántas redes manejamos (Facebook, Instagram o las dos), cuántas piezas se publican al mes y cuánto volumen de comentarios y mensajes hay que responder.',
      'Si además querés anuncios pagados, la pauta va aparte y se la pagás directo a Meta desde tu cuenta. Después del diagnóstico gratis te damos el precio del plan por escrito, en lempiras o dólares.',
    ],
    costoEn: [
      'Social media management is a monthly plan, not a one-time payment. The price is set by how many networks we manage (Facebook, Instagram or both), how many pieces go out per month and how many comments and messages need answering.',
      'If you also want paid ads, the ad spend is separate and you pay it directly to Meta from your account. After the free diagnosis we give you the plan price in writing, in lempiras or dollars.',
    ],
    faq: [
      {
        qEs: '¿Qué redes sociales manejan?',
        qEn: 'Which social networks do you manage?',
        aEs: 'Facebook e Instagram. Publicamos, respondemos y te reportamos el alcance cada mes.',
        aEn: 'Facebook and Instagram. We post, reply and report the reach to you every month.',
      },
      {
        qEs: '¿Qué incluye el plan mensual?',
        qEn: 'What does the monthly plan include?',
        aEs: 'Calendario de contenido, diseño de piezas con tu marca, publicación, respuesta a comentarios y mensajes comunes, coordinación con tus promociones y un reporte mensual de alcance.',
        aEn: 'A content calendar, on-brand piece design, posting, replies to common comments and messages, coordination with your promos and a monthly reach report.',
      },
      {
        qEs: '¿Las publicaciones son con fotos de mi negocio?',
        qEn: 'Are the posts made with photos of my business?',
        aEs: 'Sí. Trabajamos con tus productos, tu gente y tus promociones reales, no con plantillas de banco de imágenes.',
        aEn: 'Yes. We work with your real products, people and promos, not stock-image templates.',
      },
      {
        qEs: '¿Mis cuentas siguen siendo mías?',
        qEn: 'Do my accounts stay mine?',
        aEs: 'Sí. Las páginas y perfiles son tuyos; nosotros los manejamos con el acceso que nos des.',
        aEn: 'Yes. The pages and profiles are yours; we manage them with the access you give us.',
      },
      faqDistancia,
    ],
  },

  'modernizacion-web': {
    kwEs: 'Rediseño de páginas web en Honduras',
    kwEn: 'Website redesign in Honduras',
    pasos: pasosSoftware(
      {
        tEs: 'Rediseño con tu contenido',
        tEn: 'Redesign with your content',
        dEs: 'Rescatamos tu contenido y tus fotos, te mostramos el diseño nuevo y lo ajustamos con vos.',
        dEn: 'We rescue your content and photos, show you the new design and adjust it with you.',
      },
      {
        dEs: 'Migramos con redirecciones correctas y tu dominio se queda igual. Si algo falla, lo corregimos gratis.',
        dEn: 'We migrate with proper redirects and your domain stays the same. If anything fails, we fix it free.',
      },
    ),
    costoTituloEs: '¿Cuánto cuesta rediseñar una página web en Honduras?',
    costoTituloEn: 'How much does a website redesign cost in Honduras?',
    costoEs: [
      'Modernizar tu página con Kizercode cuesta desde L 6,500 (unos $250), en pago único. Incluye la revisión gratis del sitio actual, el rediseño completo con tu contenido, WhatsApp, mapa y medición, velocidad y SEO al día, tu mismo dominio y 30 días de garantía.',
      'El precio depende de cuántas páginas tiene tu sitio, en qué plataforma está (Wix, WordPress u otra), cuánto contenido hay que rescatar o reescribir y qué le querés agregar, como IA o un panel para publicar. En la revisión gratis te decimos si conviene modernizar o empezar de cero, y te damos el precio fijo por escrito.',
    ],
    costoEn: [
      'Modernizing your website with Kizercode starts at $250 (L 6,500), as a one-time payment. It includes a free review of your current site, a full redesign keeping your content, WhatsApp, map and measurement, up-to-date speed and SEO, the same domain and a 30-day warranty.',
      'The price depends on how many pages your site has, which platform it is on (Wix, WordPress or another), how much content must be rescued or rewritten, and what you want to add, such as AI or a publishing panel. In the free review we tell you whether to modernize or start over, and give you the fixed price in writing.',
    ],
    faq: [
      {
        qEs: '¿Conviene modernizar mi página o hacer una nueva?',
        qEn: 'Should I modernize my site or build a new one?',
        aEs: 'Casi nunca hay que empezar de cero. En la revisión gratis te decimos con franqueza qué conviene; si con corregir alcanza, te lo decimos aunque sea un proyecto más pequeño.',
        aEn: 'You almost never need to start from zero. In the free review we tell you frankly what makes sense; if a fix is enough, we say so even if it means a smaller project.',
      },
      {
        qEs: '¿Pierdo mi dominio?',
        qEn: 'Do I lose my domain?',
        aEs: 'No perdés tu dominio: se queda igual y a tu nombre. Lo que cambia es el diseño, la velocidad y lo que la página hace por vos.',
        aEn: 'You do not lose your domain: it stays the same and under your name. What changes is the design, the speed and what the site does for you.',
      },
      {
        qEs: '¿Qué le agregan a mi página vieja?',
        qEn: 'What do you add to my old site?',
        aEs: 'Botón de WhatsApp, mapa, medición de visitas, velocidad y SEO al día, y IA donde tenga sentido. Todo con tu mismo contenido.',
        aEn: 'A WhatsApp button, a map, visit measurement, up-to-date speed and SEO, and AI where it makes sense. All with your existing content.',
      },
      {
        qEs: '¿Qué garantía tiene el rediseño?',
        qEn: 'What warranty does the redesign have?',
        aEs: '30 días de garantía: si algo de lo entregado falla, lo corregimos gratis.',
        aEn: 'A 30-day warranty: if anything we delivered fails, we fix it free.',
      },
      faqDistancia,
    ],
  },

  'reparacion-computadoras': {
    kwEs: 'Reparación de computadoras en El Progreso, Yoro',
    kwEn: 'Computer repair in El Progreso, Yoro',
    pasos: [
      {
        tEs: 'Recepción y diagnóstico gratis',
        tEn: 'Drop-off and free diagnosis',
        dEs: 'Traés tu computadora o laptop al taller y te decimos qué tiene, sin cobrarte por revisarla.',
        dEn: 'You bring your computer or laptop to the shop and we tell you what it has, without charging to check it.',
      },
      {
        tEs: 'Precio por escrito',
        tEn: 'Price in writing',
        dEs: 'Te damos el precio por escrito y no tocamos nada hasta que digás que sí.',
        dEn: 'We give you the price in writing and touch nothing until you say yes.',
      },
      {
        tEs: 'Reparación',
        tEn: 'Repair',
        dEs: 'Hacemos el arreglo aprobado. Si hay que pedir un repuesto, te avisamos con el tiempo estimado.',
        dEn: 'We do the approved repair. If a part must be ordered, we tell you the estimated time.',
      },
      {
        tEs: 'Prueba y entrega',
        tEn: 'Testing and pickup',
        dEs: 'La probamos antes de entregártela, con garantía sobre el arreglo.',
        dEn: 'We test it before handing it back, with a warranty on the repair.',
      },
    ],
    costoTituloEs: '¿Cuánto cuesta reparar una computadora en El Progreso?',
    costoTituloEn: 'How much does computer repair cost in El Progreso?',
    costoEs: [
      'El diagnóstico es gratis: saber qué tiene tu computadora no cuesta nada. El precio del arreglo depende de lo que encontremos, y te lo damos por escrito antes de tocar nada; ese monto no cambia cuando llegás a recogerla.',
      'Lo que mueve el precio es el tipo de trabajo y la pieza: no cuesta lo mismo un formateo o una limpieza que cambiar un disco SSD, ampliar la memoria RAM o reemplazar la pantalla o el teclado de una laptop, y cada repuesto varía según la marca y el modelo. Si el arreglo sale casi como una computadora nueva, te lo decimos con franqueza.',
    ],
    costoEn: [
      'The diagnosis is free: finding out what your computer has costs nothing. The repair price depends on what we find, and we give it to you in writing before touching anything; that amount does not change when you come to pick it up.',
      'What moves the price is the type of work and the part: formatting or cleaning does not cost the same as an SSD upgrade, more RAM or replacing a laptop screen or keyboard, and every part varies by brand and model. If the repair costs almost as much as a new computer, we tell you frankly.',
    ],
    faq: [
      {
        qEs: '¿Mi computadora está lenta, tiene arreglo?',
        qEn: 'My computer is slow, can it be fixed?',
        aEs: 'Casi siempre. Un cambio a disco SSD, más memoria RAM y una limpieza a fondo suelen devolverle la velocidad. Con el diagnóstico gratis te decimos qué necesita y cuánto cuesta.',
        aEn: 'Almost always. An SSD upgrade, more RAM and a deep clean usually bring the speed back. With the free diagnosis we tell you what it needs and what it costs.',
      },
      {
        qEs: '¿Reparan laptops?',
        qEn: 'Do you repair laptops?',
        aEs: 'Sí. Cambiamos pantallas, teclados, cargadores y puertos de laptop, además de formateo, SSD, memoria y limpieza interna.',
        aEn: 'Yes. We replace laptop screens, keyboards, chargers and ports, plus formatting, SSD, memory and internal cleaning.',
      },
      {
        qEs: '¿Pueden respaldar mis archivos antes de formatear?',
        qEn: 'Can you back up my files before formatting?',
        aEs: 'Sí. El respaldo de información es parte del servicio, y si algún arreglo pone tus archivos en riesgo te avisamos antes.',
        aEn: 'Yes. Data backup is part of the service, and if any repair puts your files at risk we tell you first.',
      },
      {
        qEs: '¿Dan mantenimiento a las computadoras de negocios?',
        qEn: 'Do you maintain business computers?',
        aEs: 'Sí. Damos mantenimiento a las computadoras de tu negocio, con el precio por escrito antes de empezar.',
        aEn: 'Yes. We maintain your business computers, with the price in writing before we start.',
      },
      faqHorario,
      faqFueraTaller,
    ],
  },

  'reparacion-telefonos': {
    kwEs: 'Reparación de celulares en El Progreso, Yoro',
    kwEn: 'Phone repair in El Progreso, Yoro',
    pasos: [
      {
        tEs: 'Recepción y diagnóstico gratis',
        tEn: 'Drop-off and free diagnosis',
        dEs: 'Traés tu celular al taller y te decimos qué tiene, sin cobrarte por revisarlo.',
        dEn: 'You bring your phone to the shop and we tell you what it has, without charging to check it.',
      },
      {
        tEs: 'Precio por escrito',
        tEn: 'Price in writing',
        dEs: 'Te damos el precio por escrito antes de reparar, y no se mueve cuando llegás a recogerlo.',
        dEn: 'We give you the price in writing before repairing, and it does not change at pickup.',
      },
      {
        tEs: 'Reparación',
        tEn: 'Repair',
        dEs: 'Cambiamos la pieza o arreglamos el software. Si hay que pedir el repuesto, te avisamos de una.',
        dEn: 'We replace the part or fix the software. If the part must be ordered, we tell you right away.',
      },
      {
        tEs: 'Prueba y entrega',
        tEn: 'Testing and pickup',
        dEs: 'Revisamos llamadas, carga, cámara y pantalla antes de devolvértelo.',
        dEn: 'We check calls, charging, camera and screen before handing it back.',
      },
    ],
    costoTituloEs: '¿Cuánto cuesta reparar un celular en El Progreso?',
    costoTituloEn: 'How much does phone repair cost in El Progreso?',
    costoEs: [
      'El diagnóstico es gratis: te decimos qué tiene tu celular y cuánto cuesta arreglarlo sin cobrarte por revisarlo. El precio del arreglo va por escrito antes de reparar, y no se mueve cuando llegás a recogerlo.',
      'Lo que define el precio es la pieza y el teléfono: una pantalla, una batería, un puerto de carga o una bocina cuestan distinto, y cada repuesto varía según la marca y el modelo. Los arreglos de software dependen del problema. Si no vale la pena reparar, te lo decimos, y también vendemos equipo probado.',
    ],
    costoEn: [
      'The diagnosis is free: we tell you what your phone has and what fixing it costs without charging to check it. The repair price goes in writing before we repair, and it does not change when you come to pick it up.',
      'What sets the price is the part and the phone: a screen, a battery, a charging port or a speaker each cost differently, and every part varies by brand and model. Software fixes depend on the problem. If the repair is not worth it, we tell you, and we also sell tested devices.',
    ],
    faq: [
      {
        qEs: '¿Cambian baterías de celular?',
        qEn: 'Do you replace phone batteries?',
        aEs: 'Sí. Si tu batería ya no aguanta el día, la cambiamos. Con el diagnóstico gratis te damos el precio exacto por escrito según tu modelo.',
        aEn: 'Yes. If your battery no longer lasts the day, we replace it. With the free diagnosis we give you the exact price in writing for your model.',
      },
      {
        qEs: '¿Mi celular no carga, tiene arreglo?',
        qEn: 'My phone will not charge, can it be fixed?',
        aEs: 'Muchas veces es el puerto de carga, y se cambia. En el diagnóstico gratis vemos si es el puerto, la batería o el cargador antes de cobrarte nada.',
        aEn: 'Often it is the charging port, and it can be replaced. In the free diagnosis we check whether it is the port, the battery or the charger before charging you anything.',
      },
      {
        qEs: '¿Arreglan problemas de software o lentitud?',
        qEn: 'Do you fix software problems or slowness?',
        aEs: 'Sí. Hacemos actualizaciones, resolvemos lentitud y respaldamos tu información, además de cambios de pantalla, batería, botones y cámaras.',
        aEn: 'Yes. We handle updates, fix slowness and back up your data, as well as screen, battery, button and camera replacements.',
      },
      {
        qEs: '¿Compran o venden celulares usados?',
        qEn: 'Do you buy or sell used phones?',
        aEs: 'Sí. Compramos y vendemos equipo probado y funcionando. Escribinos por WhatsApp con el modelo que buscás o que querés vender.',
        aEn: 'Yes. We buy and sell tested, working devices. Message us on WhatsApp with the model you want to buy or sell.',
      },
      faqHorario,
      faqFueraTaller,
    ],
  },
};
