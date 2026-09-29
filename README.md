# Precio de la Nuez — Villa Coronado, Chihuahua

Sitio informativo con los precios de compra de nuez pecanera en Villa Coronado:
un tablero con el precio más alto del día, una calculadora de cuánto te darían
por tus kilos, un mapa de quién compra y dónde, y una tabla comparativa.

No cobra nada, no vende nuez y no recibe pago de ningún comprador.

## Cómo actualizar los precios

Todo vive en **`src/data/precios.json`**. Es el único archivo que tocas después
de cada vuelta por el pueblo.

1. Abre `src/data/precios.json`.
2. Cambia el precio de cada recolector y **pon la fecha del día en que preguntaste**
   (`"fecha": "2026-10-05"`). Esa fecha es la que sale en la tabla y en el tablero.
3. Sube la fila de esa semana a `historial` para que siga funcionando el
   "subió $X desde...".
4. Actualiza `"actualizado"` con la fecha de hoy.
5. Guarda, `npm run build` y publica.

### Estructura de un recolector

```json
{
  "id": "la-nogalera",              // sin espacios ni acentos, no se muestra
  "nombre": "Bodega La Nogalera",
  "direccion": "Carretera a Jiménez km 2",
  "telefono": "",                   // opcional
  "horario": "Lunes a sábado, 8:00 a 18:00",
  "lat": 26.7512,                   // coordenadas para el mapa
  "lon": -105.1655,
  "fecha": "2026-09-22",            // el día que preguntaste ahí
  "notas": "Pagan en efectivo el mismo día.",
  "precios": { "primera": 64, "segunda": 52, "quebrada": 28 }
}
```

- Un precio en `null` significa **"ese tipo no lo compran"**. El sitio lo dice
  tal cual y lo saca de la calculadora, que es distinto a poner `0`.
- Los tipos (`primera`, `segunda`, `quebrada`) se definen arriba, en `tipos`.
  Si quieres otra clasificación, agrégala ahí y úsala en cada recolector.

### Sacar lat/lon de un lugar

Abre Google Maps, deja apretado el punto exacto y copia los dos números que
aparecen. El primero es `lat`, el segundo `lon`.

### Quitar el aviso amarillo

Los datos que trae el repo son de ejemplo. Cuando pongas los reales, cambia
`"datosDeEjemplo": true` por `false` y la banda amarilla desaparece.

## Comandos

```bash
npm install      # una sola vez
npm run dev      # servidor local en http://localhost:4321
npm run build    # genera dist/ listo para publicar
npm run preview  # revisa dist/ antes de subirlo
```

## Antes de publicar

En `src/config.ts`:

- `site` en `astro.config.mjs`: pon tu dominio real (lo usan el canonical,
  el Open Graph y el sitemap).
- `contacto.whatsapp` o `contacto.correo`: sin esto, el bloque
  "¿Sabes un precio que no está aquí?" muestra un recordatorio en vez de un botón.
- `mapa.lat` / `mapa.lon` / `mapa.zoom`: dónde abre el mapa.

## Publicar

Es un sitio estático: `npm run build` deja todo en `dist/`. Sirve cualquier
hosting gratuito (Netlify, Vercel, Cloudflare Pages, GitHub Pages). No hay
backend, ni base de datos, ni costo por uso.

## Cómo está armado

- **Astro 5** — sitio estático, sin framework de UI.
- **Leaflet + OpenStreetMap** — mapa sin API key ni tarjeta. Las teselas vienen
  claras y se oscurecen con un filtro CSS para que no peleen con el tema.
- Sin dependencias de CSS: el diseño está en `src/styles/global.css` más los
  bloques `<style>` de cada componente.

El sitio es una **terminal de precios**: arriba la cinta con los tres grados, el
precio del día en grande, la temporada en una gráfica, y a un lado la cuenta de
lo que te darían. Abajo el libro de compra, el mapa y la tabla completa.

```
src/
  config.ts              localidad, coordenadas, contacto, formatos
  data/precios.json      LOS DATOS (esto es lo que actualizas)
  lib/datos.ts           cálculos del servidor: mejor precio, rango, serie, tendencia
  lib/vivo.ts            estado del navegador: qué grado y cuántos kilos
  layouts/Base.astro     head, SEO, tipografías
  components/
    Encabezado.astro     barra fija con la cinta de los tres grados
    Terminal.astro       precio del día, delta, y la calculadora
    Grafica.astro        la serie semanal, en SVG
    Libro.astro          lo que te da cada quien, del que más paga al que menos
    Mapa.astro           mapa con los precios como marcas
    Tabla.astro          la matriz completa
    Cierre.astro         de dónde salen los datos + pie
  pages/index.astro      arma la página, el JSON-LD y el paquete de datos
```

### Cómo se mueve todo junto

Tocar un grado en la cinta cambia el precio grande, la gráfica, la calculadora,
el libro, las marcas del mapa y la columna resaltada de la tabla. Eso funciona
así:

1. `index.astro` deja **un solo** `<script type="application/json" id="datos-sitio">`
   con todos los precios.
2. `lib/vivo.ts` lo lee una vez y guarda el estado (grado y kilos). Cada
   componente se suscribe con `alCambiar(...)`.
3. El servidor ya pinta la página completa para el primer grado y 100 kg, así
   que **sin JavaScript el sitio se lee igual**: nada más deja de ser
   interactivo.

Dos detalles al tocar el código:

- Lo que reescribe el JavaScript (las filas del libro, las marcas y globos del
  mapa) lleva sus estilos en un bloque `<style is:global>`. Los estilos con
  scope de Astro no alcanzan el HTML que se inyecta en tiempo de ejecución.
- La gráfica trae las tres series pintadas desde el servidor y solo prende la
  del grado activo. Su SVG escala uniforme a propósito: si se estirara solo a lo
  ancho, los puntos se volverían elipses.
