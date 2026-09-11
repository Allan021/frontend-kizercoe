/**
 * Industrias con página propia (/industrias/x y /en/industries/x).
 *
 * La gracia: cada industria enlaza el producto YA HECHO que le sirve
 * (KizerPOS, KizerResto, Cobros, ClínicoSalud…) y deja abierta la puerta de lo
 * a la medida. Una fila = dos páginas (ES y EN).
 */
export type Industria = {
  slug: string;
  slugEn: string;
  nombre: string;
  name: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  h1Es: string;
  h1En: string;
  intro: { es: string[]; en: string[] };
  /** Producto listo para usar que le calza (si existe). */
  producto?: { nombre: string; url: string; dEs: string; dEn: string };
  /** Caso real para enseñar (si existe). */
  caso?: { nombre: string; url: string; dEs: string; dEn: string };
  dolores: { tEs: string; tEn: string; dEs: string; dEn: string }[];
  faq: { qEs: string; qEn: string; aEs: string; aEn: string }[];
};

export const industrias: Industria[] = [
  {
    slug: 'farmacias',
    slugEn: 'pharmacies',
    nombre: 'Farmacias',
    name: 'Pharmacies',
    titleEs: 'Sistema para farmacias en Honduras | Kizercode',
    titleEn: 'Pharmacy software in Honduras | Kizercode',
    descEs: 'Software para farmacias: inventario por lote y vencimiento, punto de venta que funciona sin internet y cierre de caja. Listo para usar con KizerPOS o a la medida.',
    descEn: 'Pharmacy software: batch and expiry inventory, a POS that works offline and daily cash close. Ready to use with KizerPOS or custom-built.',
    h1Es: 'El sistema que tu farmacia necesita, listo para usar.',
    h1En: 'The system your pharmacy needs, ready to use.',
    intro: {
      es: [
        'En una farmacia el inventario es el negocio: medicamentos que vencen, lotes que hay que rotar y cientos de productos parecidos. Con cuaderno y calculadora, los vencidos se descubren cuando ya son pérdida y nadie sabe cuánto se vendió de verdad.',
        'KizerPOS nació para esto: inventario por lote con alertas de vencimiento, punto de venta que funciona aunque se vaya el internet, y cierre de caja que cuadra solo. Te registrás y empezás — y si tu farmacia necesita algo más específico, lo construimos sobre el mismo sistema.',
      ],
      en: [
        'In a pharmacy, inventory is the business: expiring medicines, batches to rotate and hundreds of similar products. With a notebook and calculator, expired stock shows up when it is already a loss and nobody knows what really sold.',
        'KizerPOS was born for this: batch inventory with expiry alerts, a point of sale that works even when the internet drops, and a cash close that balances itself. Sign up and start — and if your pharmacy needs something specific, we build it on the same system.',
      ],
    },
    producto: { nombre: 'KizerPOS', url: 'https://pos.kizercode.com/', dEs: 'Inventario y punto de venta con IA, funciona sin internet.', dEn: 'Inventory and POS with AI, works offline.' },
    dolores: [
      { tEs: 'Vencimientos bajo control', tEn: 'Expiry under control', dEs: 'Alertas por lote antes de que el producto sea pérdida.', dEn: 'Batch alerts before the product becomes a loss.' },
      { tEs: 'Venta rápida en mostrador', tEn: 'Fast counter sales', dEs: 'Lector de código de barras y búsqueda al instante.', dEn: 'Barcode scanner and instant search.' },
      { tEs: 'Caja que cuadra', tEn: 'A register that balances', dEs: 'Cierre del día con lo vendido, lo cobrado y lo que falta.', dEn: 'Daily close with sales, payments and gaps.' },
      { tEs: 'Funciona sin internet', tEn: 'Works offline', dEs: 'Se fue la conexión y la farmacia sigue vendiendo.', dEn: 'Connection drops and the pharmacy keeps selling.' },
    ],
    faq: [
      { qEs: '¿Cuánto tarda en estar funcionando?', qEn: 'How fast can it be running?', aEs: 'Con KizerPOS, días: cargamos tu inventario y capacitamos a tu equipo. A la medida, de 3 a 6 semanas.', aEn: 'With KizerPOS, days: we load your inventory and train your team. Custom, 3 to 6 weeks.' },
      { qEs: '¿Incluye el equipo (terminal, lector, impresora)?', qEn: 'Does it include hardware?', aEs: 'Si lo necesitás, lo cotizamos en la misma propuesta y lo dejamos instalado en tu local.', aEn: 'If you need it, we quote it in the same proposal and leave it installed at your place.' },
    ],
  },
  {
    slug: 'ferreterias',
    slugEn: 'hardware-stores',
    nombre: 'Ferreterías',
    name: 'Hardware stores',
    titleEs: 'Sistema para ferreterías en Honduras | Kizercode',
    titleEn: 'Hardware store software in Honduras | Kizercode',
    descEs: 'Software para ferreterías: miles de productos, ventas por unidad o por medida, crédito a clientes y control de inventario real con KizerPOS.',
    descEn: 'Hardware store software: thousands of products, sales by unit or measure, customer credit and real inventory control with KizerPOS.',
    h1Es: 'Miles de productos, un inventario que sí cuadra.',
    h1En: 'Thousands of products, an inventory that adds up.',
    intro: {
      es: [
        'Una ferretería vende clavos por libra, tubo por vara y cemento por bolsa — miles de productos con presentaciones distintas. En papel es imposible saber qué hay, qué falta y quién debe qué; las pérdidas se esconden en el desorden.',
        'KizerPOS maneja unidades y medidas, crédito a clientes con su estado de cuenta, y existencias reales por bodega. Y si tu operación tiene mañas propias — despacho a obra, cotizaciones grandes — lo ajustamos a la medida sobre la misma base.',
      ],
      en: [
        'A hardware store sells nails by the pound, pipe by the yard and cement by the bag — thousands of products in different presentations. On paper it is impossible to know what is in stock, what is missing and who owes what; losses hide in the mess.',
        'KizerPOS handles units and measures, customer credit with statements, and real stock per warehouse. And if your operation has its quirks — job-site delivery, big quotes — we customize on the same base.',
      ],
    },
    producto: { nombre: 'KizerPOS', url: 'https://pos.kizercode.com/', dEs: 'Inventario y punto de venta con IA, funciona sin internet.', dEn: 'Inventory and POS with AI, works offline.' },
    dolores: [
      { tEs: 'Unidades y medidas', tEn: 'Units and measures', dEs: 'Por unidad, por libra, por vara: cada producto como se vende.', dEn: 'By unit, pound or yard: each product as it sells.' },
      { tEs: 'Crédito a clientes', tEn: 'Customer credit', dEs: 'Quién debe, desde cuándo y su estado de cuenta imprimible.', dEn: 'Who owes, since when, with a printable statement.' },
      { tEs: 'Inventario por bodega', tEn: 'Stock per warehouse', dEs: 'Existencias reales aunque tengás bodega y sala de venta.', dEn: 'Real stock even with warehouse and sales floor.' },
      { tEs: 'Cotizaciones formales', tEn: 'Formal quotes', dEs: 'Cotización impresa o por WhatsApp en un minuto.', dEn: 'A printed or WhatsApp quote in a minute.' },
    ],
    faq: [
      { qEs: '¿Aguanta mi catálogo gigante?', qEn: 'Can it handle my huge catalog?', aEs: 'Sí: está construido para miles de productos con búsqueda instantánea y código de barras.', aEn: 'Yes: built for thousands of products with instant search and barcodes.' },
      { qEs: '¿Puedo migrar mi Excel?', qEn: 'Can I migrate my spreadsheet?', aEs: 'Sí, importamos tu inventario actual para que no empecés de cero.', aEn: 'Yes, we import your current inventory so you don’t start from zero.' },
    ],
  },
  {
    slug: 'boutiques',
    slugEn: 'boutiques',
    nombre: 'Boutiques y tiendas',
    name: 'Boutiques and retail',
    titleEs: 'Sistema para boutiques y tiendas de ropa | Kizercode',
    titleEn: 'Boutique and retail software | Kizercode',
    descEs: 'Software para boutiques: tallas, colores e inventario al día, ventas en línea conectadas al local y punto de venta con KizerPOS.',
    descEn: 'Boutique software: sizes, colors and live inventory, online sales connected to the shop and a POS with KizerPOS.',
    h1Es: 'Tallas, colores y ventas — en el local y en línea.',
    h1En: 'Sizes, colors and sales — in store and online.',
    intro: {
      es: [
        'En ropa y calzado el detalle mata: la misma blusa en tres tallas y cuatro colores son doce inventarios distintos. Y la clienta que preguntó por Instagram espera que le digan al momento si hay su talla — no "déjame revisar y te aviso".',
        'KizerPOS lleva variantes de talla y color con existencias al día, y si querés vender en línea, la tienda comparte el mismo inventario que el local: se vendió en uno, se descontó en el otro. Todo con cierre de caja y reportes de qué se mueve y qué no.',
      ],
      en: [
        'In clothing and footwear, detail kills: the same blouse in three sizes and four colors is twelve different inventories. And the customer asking on Instagram expects an instant answer on her size — not "let me check and get back to you".',
        'KizerPOS tracks size and color variants with live stock, and if you want to sell online, the store shares the same inventory as the shop: sold in one, discounted in the other. All with cash close and reports of what moves and what does not.',
      ],
    },
    producto: { nombre: 'KizerPOS', url: 'https://pos.kizercode.com/', dEs: 'Inventario y punto de venta con IA, funciona sin internet.', dEn: 'Inventory and POS with AI, works offline.' },
    dolores: [
      { tEs: 'Variantes sin enredo', tEn: 'Variants without mess', dEs: 'Talla y color con existencias exactas de cada combinación.', dEn: 'Size and color with exact stock per combination.' },
      { tEs: 'Local + línea, un inventario', tEn: 'Store + online, one inventory', dEs: 'La tienda en línea descuenta del mismo inventario del local.', dEn: 'The online store discounts from the same shop inventory.' },
      { tEs: 'Qué se mueve y qué no', tEn: 'What moves and what does not', dEs: 'Reportes para comprar más de lo que se vende y rematar lo que no.', dEn: 'Reports to restock winners and clear what does not sell.' },
      { tEs: 'Apartados y créditos', tEn: 'Layaway and credit', dEs: 'Apartados con abonos registrados, sin cuaderno.', dEn: 'Layaway with logged payments, no notebook.' },
    ],
    faq: [
      { qEs: '¿Sirve para vender por Instagram/WhatsApp?', qEn: 'Does it work for Instagram/WhatsApp sales?', aEs: 'Sí: consultás existencias al instante y podés levantar el pedido directo en el sistema.', aEn: 'Yes: check stock instantly and log the order straight into the system.' },
      { qEs: '¿Puedo empezar solo con el POS y luego la tienda en línea?', qEn: 'Can I start with the POS and add the store later?', aEs: 'Sí, es el camino típico: primero el control del local, después la tienda conectada.', aEn: 'Yes, that is the typical path: shop control first, then the connected store.' },
    ],
  },
  {
    slug: 'restaurantes',
    slugEn: 'restaurants',
    nombre: 'Restaurantes',
    name: 'Restaurants',
    titleEs: 'Sistema para restaurantes en Honduras | Kizercode',
    titleEn: 'Restaurant software in Honduras | Kizercode',
    descEs: 'Software para restaurantes: mesas, comandas a cocina, cierre de turno impreso y control de caja con KizerResto. Instalado con su equipo.',
    descEn: 'Restaurant software: tables, kitchen tickets, printed shift close and cash control with KizerResto. Installed with its hardware.',
    h1Es: 'De la mesa a la cocina sin gritos ni papelitos.',
    h1En: 'From table to kitchen without shouting or paper slips.',
    intro: {
      es: [
        'En un restaurante el caos cuesta caro: pedidos que llegan mal a cocina, cuentas que no cuadran al cierre y meseros cerrando turno de memoria. Cada error es un cliente molesto o dinero que se esfuma.',
        'KizerResto pone orden: la comanda viaja de la mesa a la impresora de cocina, cada cuenta sabe qué se sirvió, y el turno cierra con un papel impreso que cuadra caja — no con la memoria del mesero. Nosotros instalamos las terminales y las impresoras en tu local.',
      ],
      en: [
        'In a restaurant, chaos is expensive: orders arriving wrong to the kitchen, bills that do not balance at close and waiters closing shifts from memory. Every mistake is an upset customer or money evaporating.',
        'KizerResto brings order: the ticket travels from table to kitchen printer, every bill knows what was served, and the shift closes with a printed report that balances the register — not the waiter’s memory. We install the terminals and printers at your place.',
      ],
    },
    producto: { nombre: 'KizerResto', url: 'https://pos.kizercode.com/resto', dEs: 'Mesas, comandas, cocina y cierre de turno con papel impreso.', dEn: 'Tables, tickets, kitchen and shift close with a printed report.' },
    dolores: [
      { tEs: 'Comandas directas a cocina', tEn: 'Tickets straight to the kitchen', dEs: 'Impresora en cocina: sin gritos y sin letra ilegible.', dEn: 'Kitchen printer: no shouting, no illegible handwriting.' },
      { tEs: 'Cuentas por mesa', tEn: 'Bills per table', dEs: 'Dividir cuenta, juntar mesas y cobrar sin enredos.', dEn: 'Split bills, merge tables and charge without tangles.' },
      { tEs: 'Cierre de turno impreso', tEn: 'Printed shift close', dEs: 'El mesero entrega papel, no promesas. La caja cuadra.', dEn: 'The waiter hands paper, not promises. The register balances.' },
      { tEs: 'Equipo instalado', tEn: 'Hardware installed', dEs: 'Terminales e impresoras puestas y configuradas por nosotros.', dEn: 'Terminals and printers set up and configured by us.' },
    ],
    faq: [
      { qEs: '¿Cuánto tarda la instalación?', qEn: 'How long does setup take?', aEs: 'Alrededor de dos semanas con menú cargado, equipo instalado y personal capacitado.', aEn: 'Around two weeks with menu loaded, hardware installed and staff trained.' },
      { qEs: '¿Sirve para comida rápida sin mesas?', qEn: 'Does it work for fast food without tables?', aEs: 'Sí: modo mostrador con órdenes numeradas y la misma impresión en cocina.', aEn: 'Yes: counter mode with numbered orders and the same kitchen printing.' },
    ],
  },
  {
    slug: 'prestamistas',
    slugEn: 'lenders',
    nombre: 'Prestamistas',
    name: 'Lenders',
    titleEs: 'Sistema para prestamistas y microfinancieras | Kizercode',
    titleEn: 'Software for lenders and microfinance | Kizercode',
    descEs: 'Software de cobros para prestamistas: cartera, cuotas, vencimientos y recordatorios por WhatsApp con Kizer Cobros. Adiós hojas de cálculo.',
    descEn: 'Collections software for lenders: portfolio, installments, due dates and WhatsApp reminders with Kizer Cobros. Goodbye spreadsheets.',
    h1Es: 'Tu cartera al día: quién debe qué, hoy.',
    h1En: 'Your portfolio up to date: who owes what, today.',
    intro: {
      es: [
        'El negocio del préstamo vive de la puntualidad: una cuota que nadie cobró a tiempo es plata parada, y una cartera llevada en Excel depende de que una sola persona no se equivoque ni se enferme.',
        'Kizer Cobros lleva cada préstamo con sus cuotas, intereses y vencimientos, te dice cada mañana a quién cobrar hoy, y manda recordatorios por WhatsApp solos. Cada pago queda registrado con su recibo — la cartera completa, auditable, en un solo lugar.',
      ],
      en: [
        'The lending business lives on punctuality: an uncollected installment is money standing still, and a portfolio kept in Excel depends on one person never being wrong or sick.',
        'Kizer Cobros tracks every loan with its installments, interest and due dates, tells you each morning who to collect from today, and sends WhatsApp reminders on its own. Every payment is logged with its receipt — the whole portfolio, auditable, in one place.',
      ],
    },
    producto: { nombre: 'Kizer Cobros', url: 'https://cobros.kizercode.com/', dEs: 'Cartera, cuotas, vencimientos y quién debe qué hoy.', dEn: 'Portfolio, installments, due dates and who owes what today.' },
    dolores: [
      { tEs: 'Cobros del día', tEn: "Today's collections", dEs: 'Cada mañana, la lista de a quién tocarle la puerta.', dEn: 'Every morning, the list of doors to knock on.' },
      { tEs: 'Recordatorios automáticos', tEn: 'Automatic reminders', dEs: 'WhatsApp al cliente antes del vencimiento, sin que lo mandés vos.', dEn: 'WhatsApp to the client before the due date, without you sending it.' },
      { tEs: 'Intereses sin pelea', tEn: 'Interest without argument', dEs: 'Cálculo exacto de cuota, mora e intereses. El sistema no discute.', dEn: 'Exact installment, arrears and interest. The system does not argue.' },
      { tEs: 'Todo auditable', tEn: 'Fully auditable', dEs: 'Cada pago con fecha, recibo y quién lo registró.', dEn: 'Every payment with date, receipt and who logged it.' },
    ],
    faq: [
      { qEs: '¿Puedo migrar mi cartera actual?', qEn: 'Can I migrate my current portfolio?', aEs: 'Sí: importamos tus préstamos activos con sus saldos en una semana, sin perder historial.', aEn: 'Yes: we import active loans with balances in a week, keeping history.' },
      { qEs: '¿Sirve para varios cobradores?', qEn: 'Does it support several collectors?', aEs: 'Sí, cada cobrador con su ruta y sus permisos, y vos viendo todo.', aEn: 'Yes, each collector with their route and permissions, and you seeing everything.' },
    ],
  },
  {
    slug: 'clinicas',
    slugEn: 'clinics',
    nombre: 'Clínicas y salud',
    name: 'Clinics and healthcare',
    titleEs: 'Software para clínicas y consultorios en Honduras | Kizercode',
    titleEn: 'Clinic and practice software in Honduras | Kizercode',
    descEs: 'Software para clínicas: expediente del paciente, historia clínica por voz, citas en línea y finanzas. ClínicoSalud, listo para usar en cualquier especialidad, o a la medida.',
    descEn: 'Clinic software: patient records, voice clinical history, online booking and finances. ClínicoSalud, ready to use for any specialty, or custom-built.',
    h1Es: 'El expediente completo del paciente, a un clic.',
    h1En: "The patient's complete record, one click away.",
    intro: {
      es: [
        'Una clínica que agenda en cuaderno y guarda expedientes en folders pierde tiempo en cada consulta: buscar el historial, descifrar el tratamiento anterior, cuadrar los abonos del paciente. Y una cita olvidada es un espacio vacío que nadie paga.',
        'Construimos ClínicoSalud, nuestro sistema para clínicas de toda especialidad: pacientes, expediente, historia clínica dictada por voz, laboratorio, agenda con citas en línea y finanzas en un solo panel. Y si tu consulta necesita algo propio, lo ajustamos sobre la misma base.',
      ],
      en: [
        'A clinic that schedules in a notebook and keeps records in folders loses time on every visit: finding the history, deciphering the last treatment, reconciling the patient’s payments. And a forgotten appointment is an empty slot nobody pays for.',
        'We built ClínicoSalud, our system for clinics of every specialty: patients, records, voice-dictated clinical history, lab, schedule with online booking and finances in one panel. And if your practice needs something of its own, we adjust it on the same base.',
      ],
    },
    producto: { nombre: 'ClínicoSalud', url: 'https://dentalosweb-production.up.railway.app/', dEs: 'Pacientes, expediente, historia clínica por voz, agenda y finanzas en un solo panel.', dEn: 'Patients, records, voice clinical history, schedule and finances in one panel.' },
    dolores: [
      { tEs: 'Expediente al instante', tEn: 'Instant records', dEs: 'Historial, tratamientos y notas del paciente sin buscar folders.', dEn: 'History, treatments and notes without hunting folders.' },
      { tEs: 'Citas que no se olvidan', tEn: 'Appointments that are not forgotten', dEs: 'Agenda con recordatorios al paciente por WhatsApp.', dEn: 'Schedule with WhatsApp reminders to the patient.' },
      { tEs: 'Tratamientos y abonos', tEn: 'Treatments and payments', dEs: 'Plan de tratamiento con su costo y los pagos del paciente al día.', dEn: 'Treatment plan with cost and patient payments up to date.' },
      { tEs: 'Privacidad en serio', tEn: 'Privacy taken seriously', dEs: 'Datos de pacientes con roles, respaldo y acceso controlado.', dEn: 'Patient data with roles, backup and controlled access.' },
    ],
    faq: [
      { qEs: '¿Sirve para mi especialidad?', qEn: 'Does it work for my specialty?', aEs: 'Sí: ClínicoSalud está hecho para clínicas de toda especialidad, y lo que tu consulta tenga de particular lo ajustamos.', aEn: 'Yes: ClínicoSalud is built for clinics of every specialty, and whatever is particular to your practice we adjust.' },
      { qEs: '¿Los datos de mis pacientes están seguros?', qEn: 'Is my patient data safe?', aEs: 'Sí: acceso por roles, respaldos automáticos y todo queda a nombre de tu clínica, no del proveedor.', aEn: 'Yes: role-based access, automatic backups and everything under your clinic’s name, not the vendor’s.' },
    ],
  },
  {
    slug: 'bienes-raices',
    slugEn: 'real-estate',
    nombre: 'Bienes raíces',
    name: 'Real estate',
    titleEs: 'Software y portales para bienes raíces | Kizercode',
    titleEn: 'Real estate software and portals | Kizercode',
    descEs: 'Portales inmobiliarios con mapa, búsqueda y WhatsApp, como aabienes.com. Publicá propiedades, recibí prospectos y dales seguimiento.',
    descEn: 'Real estate portals with map, search and WhatsApp, like aabienes.com. List properties, receive leads and follow them up.',
    h1Es: 'Tus propiedades en un portal que sí vende.',
    h1En: 'Your properties on a portal that actually sells.',
    intro: {
      es: [
        'Vender propiedades por Facebook es pelear contra el algoritmo: las publicaciones se entierran, las fotos pierden calidad y el interesado de hace un mes es imposible de encontrar. Un portal propio pone tu inventario completo, con mapa y filtros, a un clic del comprador.',
        'Lo hicimos para AA Bienes: portal con búsqueda por zona y precio, mapa, ficha de cada propiedad y contacto directo por WhatsApp — con panel para publicar y despublicar sin depender de nadie. Lo mismo se adapta a tu inmobiliaria, con CRM de prospectos si querés dar seguimiento en serio.',
      ],
      en: [
        'Selling properties on Facebook means fighting the algorithm: posts get buried, photos lose quality and last month’s interested buyer is impossible to find. Your own portal puts your full inventory, with map and filters, one click from the buyer.',
        'We built it for AA Bienes: a portal with search by area and price, map, a page per property and direct WhatsApp contact — with a panel to publish and unpublish without depending on anyone. The same adapts to your agency, with a lead CRM if you want serious follow-up.',
      ],
    },
    caso: { nombre: 'AA Bienes', url: 'https://www.aabienes.com', dEs: 'Portal inmobiliario para el mercado hondureño, con IA y mapa.', dEn: 'Real estate portal for the Honduran market, with AI and map.' },
    dolores: [
      { tEs: 'Inventario completo y visible', tEn: 'Full, visible inventory', dEs: 'Todas tus propiedades con filtros, mapa y ficha propia.', dEn: 'All your properties with filters, map and their own page.' },
      { tEs: 'Prospectos que no se pierden', tEn: 'Leads that do not get lost', dEs: 'Cada consulta llega por WhatsApp y queda registrada.', dEn: 'Every inquiry arrives on WhatsApp and gets logged.' },
      { tEs: 'Publicás vos mismo', tEn: 'You publish yourself', dEs: 'Panel para subir, editar y marcar como vendida cada propiedad.', dEn: 'A panel to upload, edit and mark each property as sold.' },
      { tEs: 'Google te encuentra', tEn: 'Google finds you', dEs: 'Cada propiedad es una página indexable: SEO que trae compradores.', dEn: 'Each property is an indexable page: SEO that brings buyers.' },
    ],
    faq: [
      { qEs: '¿Puedo verlo funcionando?', qEn: 'Can I see it working?', aEs: 'Sí: aabienes.com es nuestro y está en producción. Esa misma base se adapta a tu inmobiliaria.', aEn: 'Yes: aabienes.com is ours and in production. That same base adapts to your agency.' },
      { qEs: '¿Cuánto cuesta un portal así?', qEn: 'How much does such a portal cost?', aEs: 'Depende de los módulos (CRM, mapa, asesores). El rango arranca donde los sistemas a la medida; cotización por escrito tras el diagnóstico.', aEn: 'Depends on modules (CRM, map, agents). The range starts where custom systems do; written quote after the diagnosis.' },
    ],
  },
  {
    slug: 'abogados',
    slugEn: 'law-firms',
    nombre: 'Abogados',
    name: 'Law firms',
    titleEs: 'Software para bufetes y abogados | Kizercode',
    titleEn: 'Software for law firms | Kizercode',
    descEs: 'Sistemas para bufetes: expedientes por caso, plazos que no se vencen, documentos ordenados y control de horas y cobros.',
    descEn: 'Systems for law firms: case files, deadlines that never slip, organized documents and time and billing control.',
    h1Es: 'Cada caso con su expediente, cada plazo bajo control.',
    h1En: 'Every case with its file, every deadline under control.',
    intro: {
      es: [
        'En un bufete, un plazo vencido no es un descuido: es responsabilidad profesional. Y con los expedientes repartidos entre folders físicos, correos y el teléfono de cada abogado, encontrar el documento correcto a tiempo es una apuesta.',
        'Construimos sistemas donde cada caso tiene su expediente digital: documentos, actuaciones, plazos con alertas y las horas trabajadas para facturar sin discusión. Con acceso por roles, para que cada abogado vea lo suyo y el socio vea todo.',
      ],
      en: [
        'In a law firm, a missed deadline is not an oversight: it is professional liability. And with files spread across physical folders, emails and each lawyer’s phone, finding the right document in time is a gamble.',
        'We build systems where every case has its digital file: documents, filings, deadlines with alerts and billable hours to invoice without argument. Role-based access, so each lawyer sees their own and the partner sees everything.',
      ],
    },
    dolores: [
      { tEs: 'Plazos con alarma', tEn: 'Deadlines with alarms', dEs: 'Cada término procesal avisa antes, no después.', dEn: 'Every procedural term warns before, not after.' },
      { tEs: 'Expediente digital', tEn: 'Digital case file', dEs: 'Documentos y actuaciones de cada caso en un solo lugar.', dEn: 'Documents and filings of each case in one place.' },
      { tEs: 'Horas y facturación', tEn: 'Hours and billing', dEs: 'Lo trabajado por caso queda registrado y se factura sin pelear.', dEn: 'Work per case is logged and billed without a fight.' },
      { tEs: 'Confidencialidad', tEn: 'Confidentiality', dEs: 'Acceso por roles y registro de quién vio qué.', dEn: 'Role-based access and a log of who saw what.' },
    ],
    faq: [
      { qEs: '¿Qué tan seguro es?', qEn: 'How secure is it?', aEs: 'Acceso por roles, respaldos automáticos y servidores donde vos decidás. El sistema y los datos quedan a nombre del bufete.', aEn: 'Role-based access, automatic backups and servers where you decide. System and data stay under the firm’s name.' },
      { qEs: '¿Mis asistentes pueden usarlo?', qEn: 'Can my assistants use it?', aEs: 'Sí, cada quien con su rol: la asistente agenda y archiva, el abogado ve el caso completo.', aEn: 'Yes, each with their role: the assistant schedules and files, the lawyer sees the full case.' },
    ],
  },
  {
    slug: 'distribuidoras',
    slugEn: 'distributors',
    nombre: 'Distribuidoras',
    name: 'Distributors',
    titleEs: 'Software para distribuidoras y mayoristas | Kizercode',
    titleEn: 'Software for distributors and wholesalers | Kizercode',
    descEs: 'Sistemas para distribuidoras: pedidos de vendedores en ruta, precios por cliente, inventario por bodega y cuentas por cobrar.',
    descEn: 'Systems for distributors: orders from the field, per-customer pricing, stock per warehouse and receivables.',
    h1Es: 'Pedidos en ruta, bodega y cobros: una sola operación.',
    h1En: 'Field orders, warehouse and collections: one operation.',
    intro: {
      es: [
        'Una distribuidora vive en movimiento: vendedores levantando pedidos donde el cliente, bodega despachando y cobros pendientes por todos lados. Cuando eso se coordina por llamadas y papeles, los pedidos se traspapelan y las cuentas por cobrar envejecen sin que nadie las vea.',
        'Construimos sistemas donde el vendedor levanta el pedido desde el teléfono — con precios y existencias reales — bodega lo despacha con su orden, y cada entrega alimenta la cuenta por cobrar del cliente. Vos ves la operación completa en vivo.',
      ],
      en: [
        'A distributor lives in motion: salespeople taking orders at the client’s, the warehouse dispatching and pending collections everywhere. When that runs on calls and paper, orders get misplaced and receivables age unseen.',
        'We build systems where the salesperson takes the order from their phone — with real prices and stock — the warehouse dispatches with its picking order, and every delivery feeds the client’s receivable. You see the whole operation live.',
      ],
    },
    producto: { nombre: 'KizerPOS', url: 'https://pos.kizercode.com/', dEs: 'La base de inventario y ventas, extendible a ruta y bodegas.', dEn: 'The inventory and sales base, extendable to routes and warehouses.' },
    dolores: [
      { tEs: 'Pedidos desde la ruta', tEn: 'Orders from the road', dEs: 'El vendedor pide desde el teléfono con existencias reales.', dEn: 'Salespeople order from their phone with real stock.' },
      { tEs: 'Precios por cliente', tEn: 'Per-customer pricing', dEs: 'Cada cliente con su lista y su descuento, sin errores.', dEn: 'Each customer with their list and discount, error-free.' },
      { tEs: 'Bodega ordenada', tEn: 'An orderly warehouse', dEs: 'Órdenes de despacho y existencias por bodega al día.', dEn: 'Dispatch orders and per-warehouse stock up to date.' },
      { tEs: 'Cuentas por cobrar vivas', tEn: 'Living receivables', dEs: 'Quién debe, desde cuándo, y recordatorios que salen solos.', dEn: 'Who owes, since when, and reminders that go out alone.' },
    ],
    faq: [
      { qEs: '¿Funciona donde no hay señal?', qEn: 'Does it work without signal?', aEs: 'Sí: el vendedor trabaja sin conexión y el pedido sincroniza al volver la señal.', aEn: 'Yes: the salesperson works offline and the order syncs when signal returns.' },
      { qEs: '¿Se conecta con mi facturación?', qEn: 'Does it connect to my invoicing?', aEs: 'Sí, incluida la facturación con CAI de la SAR cuando aplica.', aEn: 'Yes, including SAR/CAI fiscal invoicing where it applies.' },
    ],
  },
  {
    slug: 'talleres',
    slugEn: 'workshops',
    nombre: 'Talleres',
    name: 'Auto shops',
    titleEs: 'Software para talleres mecánicos y de servicio | Kizercode',
    titleEn: 'Software for auto and service shops | Kizercode',
    descEs: 'Sistemas para talleres: órdenes de trabajo, repuestos, historial por vehículo y avisos al cliente cuando su carro está listo.',
    descEn: 'Systems for workshops: work orders, parts, per-vehicle history and customer alerts when the car is ready.',
    h1Es: 'Cada orden de trabajo clara: qué se hizo, qué se cobró.',
    h1En: 'Every work order clear: what was done, what was charged.',
    intro: {
      es: [
        'En un taller el desorden se paga doble: repuestos que se compraron y nadie facturó, trabajos que se hicieron "de palabra" y clientes llamando cada hora a preguntar si ya está el carro.',
        'Construimos sistemas de órdenes de trabajo: cada vehículo con su historial, cada orden con sus repuestos y mano de obra, y el cliente recibe un WhatsApp cuando su carro está listo — con su cuenta clara. Sabés qué entró, qué salió y cuánto dejó cada trabajo.',
      ],
      en: [
        'In a workshop, disorder costs double: parts bought and never billed, jobs done "on word" and customers calling every hour asking if the car is ready.',
        'We build work-order systems: each vehicle with its history, each order with its parts and labor, and the customer gets a WhatsApp when their car is ready — with a clear bill. You know what came in, what went out and what each job left.',
      ],
    },
    dolores: [
      { tEs: 'Órdenes de trabajo claras', tEn: 'Clear work orders', dEs: 'Repuestos, mano de obra y estado de cada trabajo.', dEn: 'Parts, labor and status of every job.' },
      { tEs: 'Historial por vehículo', tEn: 'Per-vehicle history', dEs: 'Qué se le ha hecho a cada carro y cuándo toca lo próximo.', dEn: 'What each car has had done and when the next service is due.' },
      { tEs: 'Cliente avisado', tEn: 'Customer notified', dEs: '"Su carro está listo" por WhatsApp, sin llamadas de ida y vuelta.', dEn: '"Your car is ready" on WhatsApp, no back-and-forth calls.' },
      { tEs: 'Repuestos controlados', tEn: 'Parts under control', dEs: 'Lo que entra a bodega sale facturado, no regalado.', dEn: 'What enters the warehouse leaves billed, not gifted.' },
    ],
    faq: [
      { qEs: '¿Sirve para talleres de motos o electrónica?', qEn: 'Does it work for motorcycle or electronics shops?', aEs: 'Sí: la lógica de orden de trabajo + repuestos + aviso al cliente es la misma; se adapta a tu rubro.', aEn: 'Yes: the work order + parts + customer alert logic is the same; it adapts to your trade.' },
      { qEs: '¿Puedo cotizar antes de reparar?', qEn: 'Can I quote before repairing?', aEs: 'Sí: cotización desde la orden, el cliente aprueba y esa misma se convierte en el trabajo.', aEn: 'Yes: quote from the order, the customer approves and it becomes the job.' },
    ],
  },
];
