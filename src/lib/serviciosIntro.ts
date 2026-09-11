/**
 * Introducciones largas de cada página de servicio (estilo codebrand):
 * dos párrafos que le cuentan al cliente el contexto y cómo trabajamos,
 * antes de los beneficios. Clave = slug del servicio.
 */
export const intros: Record<string, { es: string[]; en: string[] }> = {
  'paginas-web': {
    es: [
      'Tu cliente te busca primero en el teléfono. Si no te encuentra, o encuentra una página lenta y vieja, le compra al que sí se ve serio. Una buena página web es el empleado que atiende 24/7: dice qué hacés, dónde estás, cuánto cuesta y abre el WhatsApp con un toque.',
      'En Kizercode llevamos más de 5 años construyendo software y sitios para negocios hondureños y del mundo. No usamos plantillas: diseñamos sobre tu marca, escribimos el contenido pensando en lo que tu cliente busca en Google, y la entregamos rápida en un celular con datos móviles, que es donde navega la gente de verdad.',
    ],
    en: [
      'Your customer looks you up on their phone first. If they can’t find you, or they find a slow, dated site, they buy from whoever looks serious. A good website is the employee that works 24/7: it says what you do, where you are, what it costs, and opens WhatsApp in one tap.',
      'At Kizercode we have spent over 5 years building software and websites for businesses in Honduras and abroad. No templates: we design on your brand, write content around what your customer actually searches, and deliver it fast on a phone with mobile data — where people really browse.',
    ],
  },
  'modernizacion-web': {
    es: [
      'Una página de hace años le dice al cliente que quizás ya cerraste. Diseño viejo, letra chiquita en el celular, sin WhatsApp y sin medición: espanta justo al que ya te estaba buscando. La buena noticia: casi nunca hay que empezar de cero.',
      'Rescatamos tu contenido, tus fotos y tu dominio, y montamos todo en un diseño de este año: rápido, medible y con los botones que convierten. Con más de 5 años haciendo esto, sabemos qué conservar y qué jubilar — y te lo decimos con franqueza en la revisión gratis.',
    ],
    en: [
      'A years-old website tells customers you may have closed. Dated design, tiny text on phones, no WhatsApp and no measurement: it scares away exactly the person who was already looking for you. Good news: you almost never need to start from zero.',
      'We rescue your content, photos and domain, and rebuild everything on this year’s design: fast, measurable, with the buttons that convert. After 5+ years doing this, we know what to keep and what to retire — and we tell you frankly in the free review.',
    ],
  },
  'tiendas-en-linea': {
    es: [
      'Vender en línea ya no es opcional: tu cliente compara precios desde el sofá y le compra al que se lo pone fácil. Una tienda bien hecha atiende, cobra y registra el pedido mientras vos hacés otra cosa — sin pagarle comisión a una plataforma por cada venta.',
      'Construimos tiendas completas: catálogo con variantes, carrito, pagos como se paga en Honduras (tarjeta, transferencia o contra entrega) y un panel para que subás tus productos vos mismo. Y si ya usás KizerPOS, la tienda y el local comparten inventario: lo que se vende en uno se descuenta en el otro.',
    ],
    en: [
      'Selling online is no longer optional: your customer compares prices from the couch and buys from whoever makes it easy. A well-built store serves, charges and logs the order while you do something else — without paying a platform commission per sale.',
      'We build complete stores: catalog with variants, cart, payments the local way (card, transfer or cash on delivery) and a panel so you upload products yourself. And if you already run KizerPOS, the store and the shop share inventory: a sale in one is discounted in the other.',
    ],
  },
  'sistemas-a-la-medida': {
    es: [
      'El cuaderno, el Excel y el WhatsApp aguantan hasta que el negocio crece: entonces se pierden pedidos, el inventario no cuadra y nadie sabe cuánto se vendió de verdad. Un sistema a la medida junta todo eso en un solo lugar, con roles para tu equipo y cada movimiento registrado.',
      'Llevamos más de 5 años construyendo sistemas que hoy corren en negocios reales — los mismos que sostienen nuestros productos KizerPOS, KizerResto, Kizer Cobros y Kizer Check. Mapeamos tu proceso, te mostramos un prototipo antes de programar, y entregamos con demos semanales, migración de datos y capacitación. El código queda a tu nombre.',
    ],
    en: [
      'The notebook, the spreadsheet and WhatsApp hold up until the business grows: then orders get lost, inventory doesn’t add up and nobody knows what was really sold. A custom system brings all of it into one place, with roles for your team and every action logged.',
      'We have spent over 5 years building systems running in real businesses — the same foundations behind our products KizerPOS, KizerResto, Kizer Cobros and Kizer Check. We map your process, show you a prototype before coding, and deliver with weekly demos, data migration and training. The code stays under your name.',
    ],
  },
  'apps-moviles': {
    es: [
      'Una app en el teléfono de tu cliente es presencia permanente: tu ícono en su pantalla, notificaciones directas y compras a dos toques. Y para tu equipo, una app bien hecha significa trabajar desde donde estén con la información al día.',
      'Desarrollamos para iOS y Android con una sola base de código — la mitad del costo de mantener dos apps — conectada a tu sistema, tienda o inventario. Diseñamos cada pantalla, la aprobás en prototipo, y nos encargamos de publicarla en App Store y Google Play a nombre de tu empresa.',
    ],
    en: [
      'An app on your customer’s phone is permanent presence: your icon on their screen, direct notifications and purchases two taps away. For your team, a well-built app means working from anywhere with up-to-date information.',
      'We build for iOS and Android from one codebase — half the cost of maintaining two apps — connected to your system, store or inventory. We design every screen, you approve it as a prototype, and we handle publishing on App Store and Google Play under your company’s name.',
    ],
  },
  'automatizacion-ia': {
    es: [
      'La mitad de las consultas de un negocio son las mismas preguntas: precio, horario, disponibilidad. Cada una que queda sin responder a tiempo es una venta que se va donde el competidor que sí contestó. Una IA bien configurada responde en segundos, a cualquier hora, con tus precios reales.',
      'No vendemos humo de IA: configuramos agentes con reglas claras, conectados a tu catálogo y tu sistema, donde todo lo que la IA hace queda registrado y auditable. Vos definís qué responde sola y cuándo te pasa el cliente. Nuestros propios productos usan esta misma tecnología en producción.',
    ],
    en: [
      'Half of a business’s inquiries are the same questions: price, hours, availability. Each one left unanswered in time is a sale that goes to the competitor who did reply. A well-configured AI answers in seconds, at any hour, with your real prices.',
      'We don’t sell AI smoke: we configure agents with clear rules, connected to your catalog and your system, where everything the AI does is logged and auditable. You define what it answers alone and when it hands the customer to you. Our own products run this same technology in production.',
    ],
  },
  'crm-a-la-medida': {
    es: [
      '¿Cuántos clientes te escribieron este mes y a cuántos les diste seguimiento? Si la respuesta vive en la memoria de cada vendedor, se están perdiendo ventas todos los días. Un CRM junta cada consulta, cada cotización y cada "llamame la otra semana" en un solo lugar.',
      'Los CRM de suscripción cobran por usuario cada mes y te obligan a trabajar a su manera. El nuestro se construye sobre tu embudo real, se conecta a WhatsApp — que es donde vende Honduras — y lo pagás una vez. Con más de 5 años construyendo software a la medida, lo hacemos calzar exacto.',
    ],
    en: [
      'How many customers wrote to you this month, and how many got a follow-up? If the answer lives in each salesperson’s memory, you are losing sales every day. A CRM gathers every inquiry, every quote and every "call me next week" in one place.',
      'Subscription CRMs charge per user monthly and force their way of working on you. Ours is built on your real funnel, connects to WhatsApp — where Honduras sells — and you pay once. With 5+ years building custom software, we make it fit exactly.',
    ],
  },
  'diseno-ux-ui': {
    es: [
      'Un sistema puede tener toda la funcionalidad del mundo y fracasar porque nadie entiende cómo usarlo. Las pantallas confusas cuestan caro: capacitaciones eternas, errores de captura y empleados que vuelven al cuaderno a escondidas.',
      'Diseñamos interfaces para la persona que las va a usar ocho horas al día: prototipos navegables que probás antes de que exista una línea de código, probados con usuarios reales y coherentes con tu marca. Es el mismo proceso que usamos en nuestros propios productos, pulido durante más de 5 años.',
    ],
    en: [
      'A system can have every feature in the world and fail because nobody understands how to use it. Confusing screens are expensive: endless training, input errors, and employees quietly going back to the notebook.',
      'We design interfaces for the person using them eight hours a day: navigable prototypes you try before a single line of code exists, tested with real users and consistent with your brand. It is the same process we use in our own products, refined over 5+ years.',
    ],
  },
  'identidad-visual': {
    es: [
      'La gente decide en segundos si un negocio se ve serio. Un logo pixeleado en el rótulo, colores distintos en cada publicación y una factura hecha en Word le restan a la misma empresa que por dentro trabaja bien. La marca es la primera impresión, y se controla.',
      'Construimos identidades completas: logo con sus variantes, paleta, tipografía y las piezas que usás de verdad — rótulo, redes, factura, uniforme. Todo con un manual sencillo y archivos editables a tu nombre, para que cualquier imprenta o diseñador futuro trabaje sin adivinar.',
    ],
    en: [
      'People decide in seconds whether a business looks serious. A pixelated logo on the sign, different colors in every post and an invoice made in Word undercut the same company that works well inside. Your brand is the first impression, and it can be controlled.',
      'We build complete identities: logo with variants, palette, typography and the pieces you actually use — sign, social media, invoice, uniform. All with a simple guide and editable files under your name, so any future printer or designer works without guessing.',
    ],
  },
  'reparacion-computadoras': {
    es: [
      'Una computadora que no enciende, que tarda cinco minutos en abrir o que se reinicia sola frena todo el negocio: la factura no sale, el correo no llega y el día se pierde. La mayoría de las veces tiene arreglo, y más barato de lo que pensás.',
      'Revisamos tu computadora o laptop gratis, te decimos qué tiene y cuánto cuesta, y no tocamos nada hasta que digás que sí. Formateo, disco SSD, memoria, pantallas, teclados, limpieza y respaldo de tus archivos, en El Progreso, Yoro.',
    ],
    en: [
      'A computer that won’t turn on, takes five minutes to start or restarts on its own stalls the whole business: invoices don’t go out, email doesn’t arrive and the day is lost. Most of the time it can be fixed, and for less than you think.',
      'We check your computer or laptop for free, tell you what it has and what it costs, and touch nothing until you say yes. Formatting, SSD, memory, screens, keyboards, cleaning and file backup, in El Progreso, Yoro.',
    ],
  },
  'reparacion-telefonos': {
    es: [
      'Para muchísimos negocios el celular es la caja, el catálogo y la línea con los clientes. Una pantalla estrellada o una batería que no aguanta el día no pueden esperar dos semanas en un taller que ni contesta.',
      'Te hacemos el diagnóstico gratis, te damos el precio por escrito y lo reparamos: pantallas, baterías, puertos de carga, bocinas y software. Antes de devolvértelo, lo probamos completo.',
    ],
    en: [
      'For so many businesses the phone is the register, the catalog and the line to customers. A shattered screen or a battery that can’t last the day can’t wait two weeks in a shop that won’t even answer.',
      'We run a free diagnosis, give you the price in writing and repair it: screens, batteries, charging ports, speakers and software. Before handing it back, we test it fully.',
    ],
  },
  'instalacion-camaras': {
    es: [
      'Un negocio sin cámaras depende de la buena fe de todos: del cliente, del empleado y del que pasa por la calle. Con cámaras bien puestas ves tu local en vivo desde el celular y, si algo pasa, tenés el video.',
      'Revisamos el lugar, te recomendamos cuántas cámaras necesitás y dónde ponerlas — sin venderte de más — y las instalamos con cableado ordenado, grabador y la app configurada en tu teléfono. Para negocios y casas en El Progreso, Yoro.',
    ],
    en: [
      'A business without cameras depends on everyone’s good faith: customers, employees and whoever walks by. With well-placed cameras you watch your place live from your phone and, if something happens, you have the video.',
      'We check the place, recommend how many cameras you need and where — without overselling — and install them with tidy wiring, a recorder and the app set up on your phone. For businesses and homes in El Progreso, Yoro.',
    ],
  },
};

/** Tarjetas de números que acompañan la intro (mismas en todas las páginas). */
export const statsServicio = [
  { n: '5+', es: 'Años de experiencia', en: 'Years of experience' },
  { n: '5', es: 'Productos propios en producción', en: 'Own products in production' },
  { n: '100 %', es: 'Código y archivos a tu nombre', en: 'Code and files under your name' },
  { n: '< 24 h', es: 'Tiempo de respuesta', en: 'Response time' },
];
