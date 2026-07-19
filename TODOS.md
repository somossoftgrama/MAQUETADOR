# TODOs - Flujo de imprenta profesional

## Críticos para offset tradicional

- [ ] **Margen de pinza (gripper margin)** — Agregar configuración de borde de pinza diferenciado (~8-12mm) donde no se imprime contenido. Debe ser configurable por lado (normalmente el borde de entrada de la hoja).

- [ ] **Soporte PDF/X** — Exportar como PDF/X-1a o PDF/X-4. Incrustar perfil de color de salida, definir TrimBox, BleedBox, MediaBox, y agregar metadata de compliance.

- [ ] **Barra de color con tintas reales** — Los patches de la barra de control deben usar separaciones CMYK reales (100% cyan, 100% magenta, etc.) en vez de colores RGB convertidos. pdf-lib soporta tintas CMYK.

- [ ] **Cálculo de creep por calibre real** — Reemplazar la fórmula `(páginas - 8) * 0.3` por un cálculo basado en gramaje/calibre del papel (input del usuario en gsm o mm). Tabla: 90gsm → 0.10mm, 130gsm → 0.13mm, 170gsm → 0.17mm, etc.

- [ ] **Work & Turn + Work & Tumble** — Agregar modos de imposición para una sola plancha que imprime ambas caras (giro horizontal o vertical de la hoja entre pasadas).

## Importantes para producción

- [ ] **Marcas de pliegue (fold marks)** — Líneas punteadas indicando dónde se dobla el pliego, especialmente útil para encuadernación y folletos.

- [ ] **Preview frente + dorso simultáneo** — Ver hoja actual con su frente y dorso lado a lado para verificar correspondencia de páginas.

- [ ] **Gestión de color ICC** — Conversión RGB → CMYK con perfil de color destino (ej. FOGRA39, GRACoL, etc.).

- [ ] **Manejo de PDF sin sangrado** — Opción para escalar/recortar páginas cuando el PDF fuente no tiene bleed (extender imagen, agregar marco de color, o recortar).

## Deseables

- [ ] **Perforación/plegado predefinido** — Marcas para perforado de carpeta, wire-o, espiral, etc.

- [ ] **Numeración de pliegos** — Imprimir número de cuadernillo/pliego en cada plancha como referencia de encuadernación.

- [ ] **Overprint / knockout preview** — Simular visualmente zonas de sobreimpresión vs. reserva (más complejo, requiere parseo del PDF original).
