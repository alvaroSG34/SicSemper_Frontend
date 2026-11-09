# Publicación de las mejoras SEO

## Cambios preparados

- Inicio: presentación del club de modelismo estático en Santa Cruz, Bolivia.
- `/club-modelismo-santa-cruz`: página pública del club, enlazada desde inicio y pie de página.
- `/eventos`: listado público de concursos y encuentros, con enlaces a sus memorias. No presenta eventos pasados como convocatorias vigentes.
- Eventos: título, descripción, canónica e imagen social por ficha; navegación estructurada con BreadcrumbList.
- Sitemap: club y eventos visibles obtenidos del endpoint público, con fecha real de modificación.
- Acceso, registro, recuperación y paneles: `noindex`. Se permite rastrear el HTML para que los buscadores lean la instrucción. La API sigue bloqueada en robots.txt.
- Las secciones de la portada permanecen visibles antes de ejecutar las animaciones.

## Después del despliegue

1. Verificar que `API_URL` o `NEXT_PUBLIC_API_URL` apunta al backend de producción y permite consultar `/landing/events` desde el servidor frontend.
2. Comprobar `/sitemap.xml`, la página del club y una ficha de evento. La canónica de cada página debe coincidir con su propia URL.
3. En Search Console, inspeccionar la portada, `/club-modelismo-santa-cruz` y un evento visible. Usar «Probar URL publicada» y solicitar indexación.
4. Volver a enviar `https://sicsempermodelismo.com.bo/sitemap.xml` y comprobar su lectura. Debe incluir inicio, club, listado de eventos, privacidad, términos y las fichas de eventos visibles. «Descubiertas» no equivale a «indexadas».
5. Comparar impresiones, clics y posición por página y consulta en periodos posteriores. Revisar también las consultas sobre club de modelismo Santa Cruz, modelismo estático Bolivia y concursos de maquetas.

No hay un plazo ni una posición garantizados. El rastreo y los cambios en resultados dependen de Google. Las fichas actuales son memorias de eventos: futuras convocatorias necesitan fechas, sede, categorías, bases e inscripción vigentes. No presentar un evento pasado como próxima convocatoria.

## Contenido por completar con el club

Añadir historia, fotografías propias autorizadas, actividades, canales oficiales y procedimiento real para integrarse. No afirmar que es el mejor club ni inventar antigüedad, horarios o dirección de sede. Obtener enlaces desde perfiles oficiales, clubes y entidades vinculadas.

En la revisión del endpoint público, una ficha tenía el título «Evento 01». Sustituir los títulos de prueba por el nombre real del encuentro y un resumen descriptivo desde el administrador; esos datos alimentan ahora el título y la descripción que reciben los buscadores.
