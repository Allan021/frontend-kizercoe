# Kizercode — brief de diseño

Documento para rediseñar la landing (`frontend/`). Lo que sigue es lo que
Kizercode **es de verdad**, no lo que una plantilla de agencia diría.

---

## 1. Quiénes somos

Kizercode es un estudio de software de **El Progreso, Yoro, Honduras**. Una
persona escribiendo código, no una agencia con departamentos.

No vendemos "transformación digital". Vendemos **sistemas que reemplazan el
cuaderno y el Excel** en negocios reales de Honduras: pulperías, ferreterías,
talleres de motos, sociedades con planilla.

La diferencia con la competencia no es el precio ni la tecnología: es que el
software está hecho **sabiendo cómo funciona un negocio hondureño**. Que se va
la luz. Que no hay internet la mitad del día. Que la SAR pide un CAI. Que el
dueño quiere ver sus ventas desde el celular mientras está en otro lado.

### Lo que ya está construido y en producción

| Producto | Qué es | Enlace |
|---|---|---|
| **KizerPOS** | Punto de venta offline-first para Windows (Tauri + React). Factura con CAI, maneja fiado, puntos, devoluciones con nota de crédito, arqueo de caja y bitácora de auditoría encadenada. Sincroniza con la nube cuando hay internet. | `pos.kizercode.com` |
| **Kizer Check** | Control de asistencia por huella para sociedades. Kiosko en la sucursal, planilla y reportes en la nube, alertas de inasistencia por WhatsApp y correo. | `check.kizercode.com` |
| **La Feria del Millón** | (cargar desde el panel) | — |
| **Kizercode API** | La plataforma detrás: correo, contactos, proyectos y testimonios. Monolito modular en Express + Postgres. | `api.kizercode.com` |

> Estos se cargan desde `/panel` — la landing los lee de la API, no están en
> duro. El diseño tiene que aguantar que sean 2 o que sean 12.

---

## 2. Tono

**Sí:** directo, concreto, en español de Honduras cuando hablamos de negocios de
acá. Frases que un dueño de ferretería entiende sin traducción. Números y
hechos verificables.

**No:**
- Cifras inventadas. Ya se quitaron "50+ clientes felices", "100% nos
  recomienda", "98% a tiempo", "5★". Si un número no se puede sostener cuando
  el cliente pregunta de dónde salió, no va.
- Emojis. Ninguno. Ya se quitaron los de rubros, el corazón y la bandera del
  footer.
- Stock photos de gente en oficinas con laptops.
- "Soluciones innovadoras", "sinergia", "transformación digital 360°".
- Testimonios inventados. Los reales se cargan desde el panel; si no hay
  ninguno publicado, **la sección desaparece**. Mejor vacío que falso.

---

## 3. Identidad visual actual

Todo vive en `frontend/src/styles/global.css` como variables CSS, con dos temas
(el sitio arranca en oscuro).

### Color

```
Marca
  cyan       #00c8ff   primario, enlaces, acentos
  verde      #00ff9d   secundario, éxito, el otro extremo del degradado
  naranja    #ff6b35   alerta, destacados
  violeta    #c8a0ff   cuarto acento

Degradado de marca
  linear-gradient(135deg, #00c8ff, #00ff9d)
  Se usa en botones primarios, títulos con .gradient-text y bordes de acento.

Oscuro (por defecto)
  --color-bg        #040d18   fondo
  --color-bg-2      #071020   fondo hundido
  --color-card      #0d1f35   tarjetas
  --color-card-2    #0f2540   tarjetas elevadas
  --color-text      #f0f8ff   texto
  --color-muted     #7a9bbf   texto secundario
  --color-muted-2   #6b8299   texto terciario
  --color-border    rgba(0,200,255,0.12)

Claro
  --color-bg        #f5f9ff
  --color-card      #ffffff
  --color-text      #0a1628
  --color-muted     #4a6a8a
  --color-border    rgba(0,100,200,0.15)
```

**Regla:** cualquier color nuevo se declara como variable en los dos temas. Nada
de hex sueltos en los componentes, salvo los cuatro acentos de marca.

### Tipografía

- Titulares: `font-black` (900), `tracking-tight`, tamaños grandes
  (`clamp(26px, 3vw, 38px)` y `text-4xl md:text-5xl`).
- Cuerpo: peso normal, `leading-relaxed`, color `--color-muted`.
- **Monoespaciada para los detalles técnicos**: etiquetas de sección
  (`// servicios`), cifras, códigos, la ventana de código del hero. Es lo que
  hace que se lea como un estudio de software y no como una agencia de
  marketing.

### Formas y movimiento

- Radios generosos: `rounded-xl` (12px) y `rounded-2xl` (16px).
- Bordes de 1px con el cyan al 6–12% de opacidad. Nunca bordes duros.
- Glow al hover: una línea de degradado que aparece arriba de la tarjeta.
- Elevación al hover: `-translate-y-1`, transiciones de 200–300ms.
- GSAP para las entradas (`data-gsap="fade-up"`, `stagger`). El movimiento
  acompaña, no protagoniza.
- `.glass` para barras superpuestas (nav).

---

## 4. Bilingüe

El sitio es **en/es simultáneo en el DOM**: cada texto va duplicado en
`<span class="en">` y `<span class="es">`, y un toggle en el nav muestra uno u
otro con CSS. **Todo texto nuevo tiene que venir en los dos idiomas.**

Excepción: lo que viene de la API (proyectos y testimonios) es de un solo
idioma, el que se escribió en el panel.

---

## 5. Estructura actual y qué falta

```
Nav
Hero              titular + CTA + rubros + ventana de código
TechStrip         logos de tecnologías
Services          9 servicios en tarjetas
Projects          ← desde la API. Tarjetas con imagen, tags y "Quiero algo así"
WhyUs             4 razones + 4 características
Process           cómo trabajamos
Reviews           ← desde la API. Destacado grande + resto en grilla
Pricing           3 planes
CTA
Footer
```

### Lo que el rediseño tiene que respetar

1. **Proyectos y testimonios son dinámicos.** Vienen de
   `GET /v1/projects` y `GET /v1/testimonials`. El diseño debe funcionar con
   cero, con uno y con doce. Y sin ninguno, la sección no se muestra.
2. **Cada proyecto lleva sus enlaces**: "Ver en vivo" al sitio del producto y
   "Quiero algo así" al formulario con el proyecto ya cargado
   (`/#contact?proyecto=slug`). Ese parámetro llega al correo que nos avisa.
3. **El testimonio destacado** (`featured`) se muestra distinto y de primero.
4. El formulario de contacto ya guarda en la base y manda dos correos: uno a
   nosotros y la confirmación al cliente.

### Lo que le falta a la landing hoy

- Una **página por proyecto** (`/proyectos/[slug]`) con el caso completo. La API
  ya lo sirve (`GET /v1/projects/:slug` devuelve `body`), pero no hay página.
- El **hero no muestra nada real**. Después de quitar las cifras inventadas
  quedó el titular y la ventana de código. Lo honesto y más fuerte sería
  mostrar los productos reales ahí: KizerPOS y Kizer Check corriendo.
- Los **precios son de agencia genérica**. No reflejan cómo se cobra de verdad
  (licencia mensual del POS, implementación, soporte).
- `TechStrip` y `Process` son genéricos: podrían ser de cualquier estudio.

---

## 6. Restricciones técnicas

- **Astro 5, `output: 'static'`** con islas React. Nada de SSR.
- Tailwind con las variables CSS de arriba. No introducir otro sistema.
- Los datos de la API se piden **en el navegador** (`client:visible`), para que
  publicar desde el panel se vea sin redesplegar. El costo es SEO en esas
  secciones: si el rediseño necesita que los proyectos se indexen, hay que
  pasarlos a build-time y aceptar un redeploy por publicación.
- GSAP ya está y va en su propio chunk. No agregar otra librería de animación.
- El sitio pesa poco hoy. Cualquier cosa que sume más de ~30KB al bundle tiene
  que justificarse.

---

## 7. Qué le pediría a un rediseño

Que al entrar quede claro en cinco segundos: **esto lo hizo alguien que
entiende negocios hondureños, y ya tiene cosas funcionando**. Hoy parece una
plantilla de agencia internacional traducida.

Concreto:

- El hero debería mostrar **producto real**, no una ventana de código de
  adorno.
- Los proyectos deberían ser la sección más fuerte del sitio, no una más entre
  nueve servicios.
- Menos secciones y más peso en cada una. Nueve servicios en tarjetas iguales
  no dicen nada; dos casos bien contados sí.
- Que la sección de precios diga cómo se cobra de verdad.
