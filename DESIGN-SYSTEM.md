# Kizercode — Design System

Referencia para mantener la landing y futuras piezas coherentes. Archivo fuente: `Kizercode Landing.dc.html`.

## Identidad
- Marca: **Kizercode**. Software a la medida, IA, marketing y taller de reparación. Honduras.
- Voz: voseo, directa, honesta. Precio por escrito, garantía, código a tu nombre.
- Logo: `assets/kizercode-logo.png` (navy + verde). Altura en nav: 42px. Fondo siempre claro detrás del logo.

## Color
Definidos como variables CSS en `:root` (tema claro) y `[data-theme="dark"]`.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0b1a33` | fondo base |
| `--bg2` | `#f4f7f9` | `#11233f` | secciones alternas, tarjetas suaves |
| `--bg3` | `#e6ede9` | `#182c4c` | placeholders de imagen |
| `--line` | `#e1e7ec` | `rgba(255,255,255,.12)` | bordes |
| `--ink` | `#0b1a33` | `#ffffff` | texto principal |
| `--ink2` | `#3d4a63` | `#b9c3d8` | texto secundario |
| `--mute` | `#74809a` | `#8592ac` | etiquetas, ayudas |
| `--green` | `#16a36c` | `#1fbf80` | acento, CTA primario |
| `--green2` | `#0f8a5a` | `#16a36c` | hover del acento, texto verde |
| `--green-soft` | `#e6f6ef` | `rgba(31,191,128,.14)` | fondos de chips e iconos |
| `--navy` | `#0b1a33` | `#ffffff` | bloques oscuros, botón secundario |

Fijos: WhatsApp `#25d366` (texto `#062b16`), verde claro sobre navy `#3ed39a`.

Regla de hover: nunca blanco/azul. Primario verde → `--green2`. Bordes → `--green`. Texto → `--green2`. Botón navy → verde.

## Tipografía
- Familia: **Poppins** (Google Fonts), pesos 400/500/600/700.
- H1: `clamp(38px,5.2vw,64px)`, 700, line-height 1.08, letter-spacing -.02em.
- H2: `clamp(28px,3.2vw,40px)`, 700, line-height 1.15.
- H3 tarjeta: 18–21px, 700.
- Cuerpo: 15–17px, line-height 1.6, color `--ink2`.
- Eyebrow: 13px, 600, uppercase, letter-spacing .08em, color `--green2`.
- Mono (números de paso, tags): `ui-monospace, Menlo, monospace`, 11–13px.

## Espaciado y forma
- Contenedor: `max-width:1200px; padding: 0 24px`.
- Sección: `padding: 80px 24px` (72px en secciones secundarias).
- Radios: botones 10–12px, tarjetas 16–18px, chips/pills 999px.
- Bordes: 1px `--line`. Hover de tarjeta: `border-color: var(--green)`.
- Sombras: solo en flotantes: `0 12px 30px rgba(11,26,51,.10)`.

## Componentes
- **Botón primario**: fondo `--green`, texto blanco, 600, padding 16px 28px, radio 12px. Hover `--green2`.
- **Botón secundario**: transparente, borde 1.5px `--line`, texto `--ink`. Hover borde/texto verde.
- **Botón navy**: fondo `--navy`, texto `--bg`. Hover fondo verde.
- **Chip**: borde `--line`, fondo `--bg`, 13px 500, pill.
- **Badge**: fondo `--green-soft`, texto `--green2`, pill, 13px 600.
- **Tarjeta**: fondo `--bg`, borde `--line`, radio 18px, padding 26px, flex column gap 12–16.
- **Stat**: número 30px 700 `--green`, etiqueta 13px `--ink2`.
- **Paso numerado**: círculo 32px verde con número blanco.
- **Header**: barra superior navy (estado, horario, teléfono, ES/EN) + nav sticky con franja degradada navy→verde de 3px, menú desplegable "Servicios" en 4 grupos.
- **Hero decorativo**: cuadrícula 56px con máscara radial, resplandor verde, anillos y tarjetitas flotantes (se ocultan < 1100px).
- **WhatsApp FAB**: fijo abajo-derecha, fondo `--green` (cambia con el tema), texto blanco, borde 2px `--bg`, pill, icono `assets/whatsapp.svg`.
- **Logo por tema**: `assets/kizercode-logo.png` en claro, `assets/kizercode-logo-dark.png` en oscuro; ambos en caja fija 126×42 (nav) y 102×34 (footer).

## Secciones (orden)
1. Barra superior + header
2. Hero (badge, H1, stats, CTAs, chips, tecnologías)
3. Reseñas + logos de clientes
4. Casos de éxito
5. Honduras → el mundo + comparativo de precio
6. Servicios + industrias
7. Productos propios
8. Equipo
9. Proceso
10. Taller
11. Precios (L / $)
12. Preguntas frecuentes
13. Contacto
14. Integraciones
15. Comparativa freelancer / agencia / Kizercode
16. Garantías (bloque navy)
17. Recursos / guías
18. CTA final + footer

## Contenido pendiente (marcado "TEXTO DE EJEMPLO")
Reseñas, casos, equipo y logos de clientes. Reemplazar con datos reales antes de publicar.

## Tweaks
`tema` (light/dark), `moneda` (L/$), `showProducts` (bool).
