# Cuentas Claras en Familia
## Documento de requerimientos para desarrollo

**Versión:** 1.0
**Fecha:** 19 de octubre de 2026
**Destinatario:** equipo o persona de desarrollo
**Forma de trabajo:** construcción por fases. Cada fase debe quedar usable antes de pasar a la siguiente.

> Este documento describe **qué** debe hacer la aplicación y **cómo debe comportarse**. No define lenguajes, servidores ni herramientas técnicas; esas decisiones quedan a criterio de quien desarrolle, siempre que se cumplan los requerimientos y restricciones aquí descritos.

---

## Índice

1. Objetivo
2. Contexto
3. Usuarios
4. Principios de diseño
5. Glosario y lenguaje de la app
6. Concepto central: "alguien pagó por otros"
7. Alcance por fases
8. Requerimientos funcionales por módulo
9. Reglas de cálculo
10. Información que maneja el sistema
11. Casos de uso
12. Requerimientos no funcionales
13. Limitantes, restricciones y fuera de alcance
14. Criterios de aceptación por fase
15. Textos y tono de la app
16. Supuestos y decisiones pendientes

---

## 1. Objetivo

Crear una aplicación web para celular, instalable en la pantalla de inicio sin pasar por tiendas de apps, que funcione como una **libreta compartida de la familia** para anotar:

- préstamos de dinero entre familiares,
- gastos que una persona paga por otra (total o parcialmente),
- gastos compartidos entre varias personas,
- gastos que se repiten cada mes (por ejemplo, plataformas de streaming),
- abonos y pagos.

La app debe calcular automáticamente cuánto queda pendiente entre cada par de personas, permitir que ambas partes estén enteradas y de acuerdo con cada movimiento, y facilitar un **cuadre de cuentas** periódico sin discusiones.

**Objetivo de fondo:** evitar olvidos, discusiones y desconfianza. La app es una libreta, no un cobrador ni un banco.

### Indicadores de éxito

- Anotar un movimiento cotidiano toma **menos de 15 segundos** y **máximo 3 toques** más escribir el monto.
- La mamá puede confirmar un movimiento y ver sus saldos **sin ayuda** después de una explicación de 5 minutos.
- Al hacer un cuadre, ambas personas ven **exactamente la misma cifra**.
- Ningún movimiento desaparece sin dejar rastro.

---

## 2. Contexto

- Grupo inicial: **5 personas** de una misma familia (4 hermanos —1 hermano y 3 hermanas— y su mamá). Viven en la misma casa, en Guatemala. Todos tienen smartphone.
- Los gastos fijos de la casa (luz, agua, internet, gas, comida de la casa, mantenimiento) **no** se registran en la app: se cubren con una cuota mensual que cada hijo entrega a la mamá y que ella administra.
- Lo que sí se registra son movimientos entre personas:
  - **Préstamos** por falta de efectivo, gastos personales, cuidado personal o emergencias. Montos muy variables: desde Q10 hasta Q5,000 o más. Hay meses sin préstamos.
  - **Préstamos en dólares**, por ejemplo para viajes, cuando alguien tiene dólares en efectivo.
  - **Gustos compartidos**: "hoy compramos pizza y entre 3 ponemos".
  - **Compras compartidas**: "se acabó el shampoo y entre dos lo compran", "la pasta dental estaba 2x1 y la otra persona también quería".
  - **Pagos por otro en el momento**: gasolina de la moto que paga el acompañante porque el dueño no traía efectivo; paquete contra entrega pagado por quien tenía efectivo.
  - **Suscripciones compartidas**: Netflix, Spotify u otras pagadas entre dos o más.
- No se cobra interés.
- Hoy no se lleva registro y los cuadres cada 2 a 6 meses se hacen de memoria, con diferencias y roces.

---

## 3. Usuarios

| Perfil | Descripción | Necesidades clave |
|---|---|---|
| **Hijos/hermanos** (4) | Adultos, usan el celular con soltura. Anotan la mayoría de movimientos, muchas veces de pie, en plena compra y con prisa. | Rapidez extrema, botones rápidos, división automática. |
| **Mamá** (1) | Poco familiarizada con la tecnología. Participa en préstamos y pagos por otros. | Pantallas mínimas, letra grande, botones con texto, confirmar con un toque, cero términos técnicos, imposible "romper" algo. |

**No existe un rol de administrador.** Todos los miembros tienen los mismos permisos. Quien crea la familia solo tiene la tarea de invitar a los demás; no ve más información ni tiene poderes especiales.

---

## 4. Principios de diseño

1. **Hecha para mamá primero.** Si mamá puede usarla, todos pueden.
2. **Rapidez antes que detalle.** Lo obligatorio es mínimo (quién pagó, cuánto, para quién). Lo demás es opcional.
3. **Tono neutral y cálido.** Nunca acusador. No usar "deuda", "deudor", "moroso", "cobrar".
4. **Transparencia.** Ambas partes ven lo mismo. Todo cambio deja rastro.
5. **Privacidad.** Cada persona ve solo lo que le involucra.
6. **Perdonar errores.** Todo se puede deshacer o corregir sin miedo.
7. **Celular primero.** Diseñada para usarse con una mano en pantallas pequeñas.

---

## 5. Glosario y lenguaje de la app

| Concepto | Palabra que usa la app | Palabras prohibidas |
|---|---|---|
| Dinero que alguien tiene por devolver | **Pendiente**, **por cuadrar** | Deuda, debe, deudor |
| Dinero a favor de alguien | **A tu favor** | Te deben, cobrar |
| Registrar algo | **Anotar** | Registrar transacción, crear operación |
| Pago parcial o total de lo pendiente | **Abono** | Amortización, liquidación |
| Saldo en cero | **Están a mano** | Deuda saldada |
| Revisión de cuentas en un periodo | **Cuadre** | Estado de cuenta, conciliación |
| Aceptar un movimiento | **Está bien ✓** | Aprobar, validar |
| Movimiento que se repite | **Se repite cada mes** | Recurrente, suscripción |
| Anular algo anotado | **Quitar** (queda en el historial) | Eliminar, borrar |

**Ejemplos de cómo mostrar saldos:**

- "Luis tiene **Q85** pendientes contigo"
- "Tienes **Q40** pendientes con Sofía"
- "Con Ana están **a mano** 🤝"

---

## 6. Concepto central: "alguien pagó por otros"

Todos los movimientos del día a día son la misma situación: **una persona puso el dinero y una o varias personas usaron parte o todo**. La app debe tratarlos con un solo flujo de tres preguntas:

1. **¿Quién pagó?**
2. **¿Cuánto?**
3. **¿Para quién?** (y cuánto le toca a cada uno)

| Situación real | Quién pagó | Para quién | Resultado |
|---|---|---|---|
| Pizza Q120 entre 3, la paga Ana | Ana | Ana, Luis, Sofía (iguales) | Luis Q40 y Sofía Q40 pendientes con Ana |
| Shampoo Q50 entre 2 | Luis | Luis y Sofía | Sofía Q25 pendientes con Luis |
| Gasolina Q60 de la moto de Ana, paga Sofía | Sofía | Ana (todo) | Ana Q60 pendientes con Sofía |
| Paquete contra entrega Q200 de Luis, paga Mamá | Mamá | Luis (todo) | Luis Q200 pendientes con Mamá |
| Pasta dental 2x1 Q30, paga Ana | Ana | Ana y Luis | Luis Q15 pendientes con Ana |
| Préstamo US$300 para viaje | Luis | Sofía (todo) | Sofía US$300 pendientes con Luis |
| Netflix Q120 al mes, paga Ana | Ana | Ana y Luis | Luis Q60 pendientes con Ana cada mes |

Si en un gasto compartido cada persona pagó su parte en el momento, **no hay nada que anotar**. Solo se anota cuando alguien cubre lo de otro.

Los **abonos** son el único movimiento con flujo propio, aunque matemáticamente se comportan igual (ver sección 9).

---

## 7. Alcance por fases

Cada fase debe entregarse funcionando y probada en celular antes de iniciar la siguiente.

| Fase | Nombre | Módulos incluidos | Resultado para la familia |
|---|---|---|---|
| **1** | Libreta básica | M1, M2, M3, M4, M5, M14 (básico), M16 | Anotar todo desde el celular y ver saldos claros con cada persona |
| **2** | Confianza | M6, M7, M8, M10, M12 (avisos dentro de la app y por WhatsApp) | Ambas partes enteradas y de acuerdo; nada se pierde; gastos mensuales automáticos |
| **3** | Cuadre | M9 (completo), M11, M13 (PDF) | Cuadrar y cerrar periodos sin discutir |
| **4** | Comodidad | M12 (notificaciones y recordatorios), M13 (respaldo), M15, M17 | Usar sin internet, recordatorios amables, respaldos |
| **5** | Extras (opcional) | Gráficas por categoría, resumen anual | Ver en qué se va más el dinero |

---

## 8. Requerimientos funcionales por módulo

Cada requerimiento tiene un código (RF-módulo-número) y una prioridad:
- **[F1]…[F5]** = fase en la que se entrega.

### M1. Acceso a la app

| Código | Requerimiento | Fase |
|---|---|---|
| RF-1.1 | La persona entra escribiendo su correo electrónico y recibe un **código de 6 dígitos** para ingresar. No se usan contraseñas. | F1 |
| RF-1.2 | Una vez que entra, la sesión se mantiene abierta en ese celular por tiempo indefinido, hasta que la persona cierre sesión. Mamá no debe tener que volver a ingresar cada vez. | F1 |
| RF-1.3 | La pantalla de ingreso tiene un solo campo, letra grande y un texto claro: "Escribe tu correo y te mandamos un código". | F1 |
| RF-1.4 | Si el código es incorrecto o vence, el mensaje es amable y ofrece "Enviar otro código". | F1 |
| RF-1.5 | Opción de proteger la app con un **PIN de 4 dígitos** o desbloqueo del celular (huella/rostro), activable por cada persona. Desactivado por defecto. | F4 |
| RF-1.6 | La app debe poder instalarse en la pantalla de inicio del celular desde el navegador, con instrucciones visuales paso a paso para Android y iPhone. | F1 |

### M2. Familia y miembros

| Código | Requerimiento | Fase |
|---|---|---|
| RF-2.1 | Cualquier persona puede crear una familia con un nombre (ej. "Familia López"). | F1 |
| RF-2.2 | Para invitar se genera un **enlace o código** que se puede compartir por WhatsApp. Al abrirlo, la persona ingresa su correo y queda dentro de la familia. | F1 |
| RF-2.3 | Cada miembro tiene nombre corto, foto o emoji y color, para reconocerlo rápido en las pantallas. | F1 |
| RF-2.4 | No hay administrador: todos los miembros tienen los mismos permisos. | F1 |
| RF-2.5 | Se puede invitar a más familiares en el futuro (tíos, primos) sin cambiar nada de lo existente. | F1 |
| RF-2.6 | Un miembro puede **salir** de la familia solo si tiene todos sus saldos a mano; si no, la app le muestra con quién tiene pendientes. Su historial se conserva. | F4 |
| RF-2.7 | Una persona puede pertenecer a más de una familia o grupo, y elegir cuál ver. | F5 |

### M3. Anotar movimientos

| Código | Requerimiento | Fase |
|---|---|---|
| RF-3.1 | En la pantalla de inicio hay un botón grande y siempre visible: **"＋ Anotar"**. | F1 |
| RF-3.2 | Al tocarlo se muestran **botones rápidos** con ícono y texto: Comida/gusto, Gasolina, Cuidado personal, Compra compartida, Paquete, Plataformas, Préstamo, Emergencia, Otro. | F1 |
| RF-3.3 | Flujo rápido (máximo 3 toques + monto): (1) botón rápido → (2) monto con teclado numérico grande → (3) tocar las caras de las personas "para quién" → listo. | F1 |
| RF-3.4 | Por defecto, **quien anota es quien pagó**. Se puede cambiar con un toque ("Pagó otra persona"). | F1 |
| RF-3.5 | Al elegir "para quién", la persona que pagó puede incluirse o no. Si se incluye, su parte no genera pendiente. | F1 |
| RF-3.6 | La división por defecto es en **partes iguales**. Opción "Montos distintos" para escribir cuánto le toca a cada quien. La app avisa si la suma de las partes no coincide con el total y no permite guardar hasta corregirlo. | F1 |
| RF-3.7 | Para préstamos y pagos por otro de una sola persona, la división es automática: el 100 % le toca a esa persona. | F1 |
| RF-3.8 | **Moneda**: quetzales por defecto; se puede elegir dólares con un toque. | F1 |
| RF-3.9 | **Fecha**: hoy por defecto; se puede cambiar (ej. "fue ayer"). | F1 |
| RF-3.10 | **Nota** opcional en texto libre (ej. "pizza del viernes"). | F1 |
| RF-3.11 | **Foto del comprobante** opcional (factura, voucher, captura de transferencia), tomada con la cámara o elegida de la galería. Se guarda reducida de tamaño. | F2 |
| RF-3.12 | Antes de guardar, se muestra un **resumen en lenguaje natural**: "Pagaste Q120 de pizza. Luis y Sofía quedan con Q40 pendientes cada uno contigo." con botones **Guardar** y **Cambiar algo**. | F1 |
| RF-3.13 | Después de guardar aparece durante 10 segundos la opción **"Deshacer"**. | F1 |
| RF-3.14 | Solo se pueden anotar movimientos donde quien anota participa (como quien pagó o como beneficiario). | F1 |
| RF-3.15 | El movimiento de tipo **Préstamo** permite indicar opcionalmente una **fecha acordada de devolución**. | F3 |
| RF-3.16 | Los botones rápidos más usados por cada persona aparecen primero (orden adaptado al uso). | F4 |

### M4. Saldos (pantalla de inicio)

| Código | Requerimiento | Fase |
|---|---|---|
| RF-4.1 | La pantalla de inicio muestra **una tarjeta por cada familiar** con quien la persona tiene o ha tenido movimientos, con foto, nombre y saldo neto en lenguaje natural. | F1 |
| RF-4.2 | Si hay saldos en quetzales y en dólares con la misma persona, se muestran ambos por separado en la tarjeta. | F1 |
| RF-4.3 | Colores suaves y no alarmantes: verde suave para "a tu favor", ámbar suave para "tienes pendiente", gris para "a mano". Nunca rojo. | F1 |
| RF-4.4 | Arriba de las tarjetas se muestra un resumen: "En total tienes Q__ a tu favor y Q__ pendientes". | F1 |
| RF-4.5 | Si hay movimientos esperando confirmación, aparece un aviso visible: "Tienes 2 cosas por revisar". | F2 |
| RF-4.6 | Las tarjetas se ordenan por la persona con movimiento más reciente. | F1 |

### M5. Historial con una persona

| Código | Requerimiento | Fase |
|---|---|---|
| RF-5.1 | Al tocar la tarjeta de un familiar se ve la lista de movimientos **solo entre esas dos personas**, del más reciente al más antiguo. | F1 |
| RF-5.2 | Cada movimiento muestra: ícono de categoría, nota, fecha, monto total, la parte que corresponde entre ambos y estado (sin confirmar / confirmado / en revisión / quitado). | F1 |
| RF-5.3 | En gastos compartidos entre 3 o más personas, cada persona solo ve la parte que le corresponde con la otra y el monto total, **sin ver los saldos de terceros**. | F1 |
| RF-5.4 | Filtros simples: por mes, por categoría, por moneda, por estado. | F3 |
| RF-5.5 | Botones disponibles en esta pantalla: **Registrar abono**, **Quedar a mano**, **Hacer cuadre**, **Avisar por WhatsApp**. | F1–F3 |
| RF-5.6 | Al tocar un movimiento se abre su detalle con foto, nota, quién lo anotó, cuándo, y su historial de cambios. | F2 |

### M6. Confirmación y correcciones

| Código | Requerimiento | Fase |
|---|---|---|
| RF-6.1 | Cuando alguien anota un movimiento, cada persona involucrada recibe un aviso de **"por revisar"**. | F2 |
| RF-6.2 | El aviso muestra el movimiento en lenguaje natural con dos botones grandes: **"Está bien ✓"** y **"Corregir"**. | F2 |
| RF-6.3 | La confirmación **no es obligatoria**: el movimiento cuenta en el saldo desde que se anota, con la etiqueta "sin confirmar". | F2 |
| RF-6.4 | Al tocar **Corregir**, la persona puede proponer otro monto, otra división, otra fecha o escribir un comentario. El movimiento pasa a estado **"en revisión"** y **deja de contar** en el saldo hasta resolverse. | F2 |
| RF-6.5 | Quien anotó recibe la propuesta y puede **aceptarla** (el movimiento se actualiza y queda confirmado), **responder** con otra propuesta, o **quitar** el movimiento. | F2 |
| RF-6.6 | Opción "Confirmar todos" para aceptar varios movimientos pendientes de una vez (útil para montos pequeños). | F2 |
| RF-6.7 | Si un movimiento lleva más de 7 días sin confirmar, se marca como **"visto sin respuesta"** pero sigue contando; aparece en el cuadre como "sin confirmar". | F2 |

### M7. Historial de cambios y movimientos quitados

| Código | Requerimiento | Fase |
|---|---|---|
| RF-7.1 | **Ningún movimiento se borra definitivamente.** "Quitar" lo marca como anulado: deja de contar en saldos, pero sigue visible en el historial (tachado o atenuado) con quién lo quitó, cuándo y el motivo. | F2 |
| RF-7.2 | Para quitar un movimiento se pide un motivo breve (opciones rápidas: "Lo anoté dos veces", "Me equivoqué", "Ya no aplica", "Otro"). | F2 |
| RF-7.3 | Toda edición guarda la versión anterior: qué cambió, valor anterior, valor nuevo, quién y cuándo. | F2 |
| RF-7.4 | Al editar un movimiento ya confirmado, vuelve a quedar "sin confirmar" para la otra parte y le llega aviso. | F2 |
| RF-7.5 | Solo pueden editar o quitar un movimiento las personas que participan en él. | F2 |
| RF-7.6 | Los movimientos dentro de un periodo **cerrado** (ver M11) no se pueden editar ni quitar. | F3 |

### M8. Detección de duplicados

| Código | Requerimiento | Fase |
|---|---|---|
| RF-8.1 | Al guardar, si existe otro movimiento con **las mismas personas, monto igual o con diferencia menor a 5 %, y fecha igual o de un día de diferencia**, la app pregunta: "¿Es el mismo que anotó Sofía el martes? (Q120, pizza)". | F2 |
| RF-8.2 | Opciones: **"Sí, es el mismo"** (no se guarda el nuevo) o **"No, es otro"** (se guarda normalmente). | F2 |
| RF-8.3 | Los gastos que se repiten (M10) no deben marcarse como duplicados de su propio mes anterior. | F2 |

### M9. Abonos, pagos parciales y compensaciones

| Código | Requerimiento | Fase |
|---|---|---|
| RF-9.1 | **Registrar abono**: desde la tarjeta de una persona, se indica monto, moneda, fecha y nota opcional. Muestra cuánto quedará pendiente después del abono antes de guardar. | F1 |
| RF-9.2 | El abono puede registrarlo quien paga o quien recibe; la otra parte recibe aviso para confirmar (F2). | F1 |
| RF-9.3 | Los abonos pueden ser parciales y en cualquier cantidad. La app siempre muestra cuánto falta. | F1 |
| RF-9.4 | Un abono puede asignarse opcionalmente a un préstamo específico (ej. "abono al préstamo del viaje") para ver cuánto falta de ese préstamo en particular. Si no se asigna, reduce el saldo general. | F3 |
| RF-9.5 | **Quedar a mano**: botón que crea automáticamente un abono por el saldo neto exacto con la nota "Quedamos a mano". Requiere confirmación de la otra persona. | F3 |
| RF-9.6 | **Compensación automática**: los pagos de uno por otro y viceversa se netean solos en el saldo (ver regla 9.2). No requiere acción del usuario. | F1 |
| RF-9.7 | **Pagar dólares en quetzales** (o viceversa): al abonar, se puede indicar que se paga un pendiente en dólares con quetzales, escribiendo el tipo de cambio acordado. La app muestra la equivalencia y ambos deben confirmar. Queda registrado el tipo de cambio usado. | F3 |
| RF-9.8 | Préstamos con fecha acordada muestran "faltan Q__ · acordado para el 30 de noviembre". | F3 |

### M10. Gastos que se repiten

| Código | Requerimiento | Fase |
|---|---|---|
| RF-10.1 | Al anotar, opción **"Se repite cada mes"**, con día del mes. | F2 |
| RF-10.2 | Configuración: nombre (ej. Netflix), quién paga, monto, moneda, día del mes, personas que comparten y división. | F2 |
| RF-10.3 | Cada mes, en el día indicado, se crea automáticamente un movimiento normal (ej. "Netflix · noviembre") que se comporta como cualquier otro: se confirma, se corrige y entra en el cuadre. | F2 |
| RF-10.4 | Si nadie abre la app ese día, el movimiento se crea la próxima vez que alguien involucrado la abra, **con la fecha correcta**, sin duplicarse. | F2 |
| RF-10.5 | Quien paga recibe un aviso: "¿Netflix cobró Q120 este mes?" con **"Sí ✓"** o **"Cambió el monto"** (solo para ese mes). | F2 |
| RF-10.6 | Se puede **cambiar el monto en adelante** (sube el precio) sin afectar meses anteriores. | F2 |
| RF-10.7 | Se puede **pausar**, **reanudar** o **terminar** un gasto repetido. El historial se conserva. | F2 |
| RF-10.8 | Opción de **turnos**: quién paga se alterna cada mes entre las personas indicadas. | F2 |
| RF-10.9 | Lista "Mis gastos que se repiten" accesible desde el menú, con estado de cada uno. | F2 |
| RF-10.10 | Solo ven el gasto repetido las personas que lo comparten. | F2 |

### M11. Cuadre de cuentas por periodo

| Código | Requerimiento | Fase |
|---|---|---|
| RF-11.1 | Desde la tarjeta de una persona: **"Hacer cuadre"**. Se elige el rango de fechas con atajos (último mes, últimos 2 meses, últimos 6 meses, desde el último cuadre) o fechas personalizadas. | F3 |
| RF-11.2 | El cuadre muestra: saldo inicial (si hubo un cuadre anterior), lista completa de movimientos del periodo, subtotales por tipo (préstamos, gastos por otro, gastos compartidos, abonos) y por categoría, y saldo final por moneda. | F3 |
| RF-11.3 | Señala claramente los movimientos **sin confirmar** y **en revisión**. No se puede cerrar un cuadre con movimientos en revisión. | F3 |
| RF-11.4 | Botón **"Estamos de acuerdo"**. El cuadre queda **cerrado** solo cuando **ambas personas** lo tocan. Mientras tanto, aparece como "esperando a Luis". | F3 |
| RF-11.5 | Al cerrarse: los movimientos del periodo quedan bloqueados; los "sin confirmar" se consideran aceptados; el saldo final pasa como **saldo inicial** del siguiente periodo. | F3 |
| RF-11.6 | Si después se descubre un error en un periodo cerrado, se anota un **ajuste** en el periodo actual con referencia al movimiento original. Los periodos cerrados no se reabren. | F3 |
| RF-11.7 | Historial de cuadres cerrados con fecha, rango y saldo final, consultable por ambas partes. | F3 |
| RF-11.8 | El cuadre se puede descargar o compartir en **PDF** (ver M13). | F3 |

### M12. Avisos y recordatorios

| Código | Requerimiento | Fase |
|---|---|---|
| RF-12.1 | **Avisos dentro de la app**: sección "Por revisar" con contador visible en el inicio. | F2 |
| RF-12.2 | **Avisar por WhatsApp**: botón que abre WhatsApp con un mensaje ya redactado, amable y editable, dirigido a la persona correspondiente. Ejemplos en sección 15. | F2 |
| RF-12.3 | **Notificaciones en el celular** (cuando el celular lo permita): nuevo movimiento por revisar, propuesta de corrección, cuadre esperando, gasto repetido creado. | F4 |
| RF-12.4 | **Recordatorios amables**, configurables por cada persona: fecha acordada de un préstamo (3 días antes y el día), movimientos sin confirmar por más de 3 días, saldos sin movimiento por más de 60 días ("¿Hacemos un cuadre?"). | F4 |
| RF-12.5 | Cada persona puede apagar cualquier tipo de aviso o recordatorio. | F4 |
| RF-12.6 | Máximo **un recordatorio por día** por persona, agrupando los pendientes. | F4 |
| RF-12.7 | Los recordatorios de fecha acordada llegan **a quien tiene el pendiente** con un mensaje neutral y **a quien prestó** como aviso, sin que la app envíe nada automáticamente en nombre de nadie. | F4 |

### M13. Reportes, exportación y respaldo

| Código | Requerimiento | Fase |
|---|---|---|
| RF-13.1 | **PDF del cuadre**: encabezado con nombres y periodo, lista de movimientos, subtotales, saldo final y, si está cerrado, fecha y constancia de que ambos estuvieron de acuerdo. | F3 |
| RF-13.2 | **Descargar mis movimientos** en hoja de cálculo (Excel o compatible): todos los movimientos donde participa la persona, con todos sus campos. | F4 |
| RF-13.3 | **Respaldo**: cada persona puede descargar su información completa en cualquier momento. Recordatorio mensual opcional para hacerlo. | F4 |
| RF-13.4 | **Gráfica simple** de en qué categorías se va más el dinero, por mes, solo con los movimientos propios. | F5 |
| RF-13.5 | **Resumen anual**: total prestado, recibido, gastos compartidos y categorías principales del año, por persona. | F5 |

### M14. Modo sencillo (accesibilidad para mamá)

| Código | Requerimiento | Fase |
|---|---|---|
| RF-14.1 | **Modo sencillo** activable por persona. Muestra solo: (1) sus saldos, (2) "Por revisar" y (3) botón "Anotar". Oculta filtros, cuadres avanzados y configuración. | F1 |
| RF-14.2 | Tamaño de letra ajustable en 3 niveles (normal, grande, muy grande). El modo sencillo usa "grande" por defecto. | F1 |
| RF-14.3 | Todos los botones tienen **ícono y texto**. Nunca solo ícono. | F1 |
| RF-14.4 | No se usan gestos ocultos (deslizar, mantener presionado, doble toque). Toda acción tiene un botón visible. | F1 |
| RF-14.5 | Antes de cualquier acción importante (guardar, quitar, cerrar cuadre) se muestra un resumen en una frase y botones claros "Sí" / "No, regresar". | F1 |
| RF-14.6 | En modo sencillo, la pantalla de revisión muestra un movimiento a la vez, en grande, con "Está bien ✓" y "Algo no está bien". | F2 |
| RF-14.7 | Botón **"Pedir ayuda"** que abre WhatsApp con un familiar elegido: "Necesito ayuda con la app de cuentas". | F2 |
| RF-14.8 | Mensajes de error en lenguaje cotidiano, sin códigos ni términos técnicos, siempre con una acción sugerida. | F1 |

### M15. Uso sin conexión

| Código | Requerimiento | Fase |
|---|---|---|
| RF-15.1 | Se puede **anotar** movimientos sin internet. Quedan guardados en el celular con la etiqueta "por enviar". | F4 |
| RF-15.2 | Al recuperar conexión, los movimientos se envían solos, sin que la persona haga nada. | F4 |
| RF-15.3 | Sin conexión se pueden consultar los saldos e historial de la última vez que hubo conexión, con un aviso discreto: "Sin internet · datos de hace 2 horas". | F4 |
| RF-15.4 | Si al enviar un movimiento hecho sin conexión se detecta un posible duplicado, se aplica la pregunta de RF-8.1. | F4 |
| RF-15.5 | Confirmar, corregir y cerrar cuadres **requiere conexión**, para que ambas partes vean lo mismo. La app lo explica con un mensaje simple. | F4 |

### M16. Privacidad y seguridad

| Código | Requerimiento | Fase |
|---|---|---|
| RF-16.1 | Cada persona ve **únicamente** los movimientos en los que participa. Ningún miembro, incluido quien creó la familia, puede ver los movimientos o saldos entre otras dos personas. | F1 |
| RF-16.2 | En un gasto compartido entre 3 o más, cada participante ve el movimiento completo (total y lista de participantes) pero su saldo resultante solo se calcula con cada persona por separado. | F1 |
| RF-16.3 | La restricción de privacidad debe aplicarse en el lugar donde se guarda la información, no solo en lo que muestran las pantallas. Aunque alguien manipulara la app, no debe poder obtener datos ajenos. | F1 |
| RF-16.4 | Las fotos de comprobantes solo son visibles para los participantes del movimiento. | F2 |
| RF-16.5 | La app no sugiere "simplificar" pagos entre tres o más personas (ej. "Luis le paga directo a Sofía"), porque revelaría saldos ajenos. | F1 |
| RF-16.6 | Opción futura de **compartir voluntariamente** el historial con un tercero de la familia (ej. que mamá vea un préstamo grande entre hermanos), solo si ambos participantes lo aceptan. | F5 |
| RF-16.7 | Cerrar sesión en un celular desde la configuración, y cerrar sesión en todos los dispositivos (por si se pierde un celular). | F4 |

### M17. Mi cuenta y ajustes

| Código | Requerimiento | Fase |
|---|---|---|
| RF-17.1 | Editar nombre, foto/emoji y color. | F1 |
| RF-17.2 | Activar/desactivar modo sencillo y tamaño de letra. | F1 |
| RF-17.3 | Configurar avisos y recordatorios. | F4 |
| RF-17.4 | Activar PIN o desbloqueo del celular. | F4 |
| RF-17.5 | Descargar respaldo. | F4 |
| RF-17.6 | Ver instrucciones de instalación y una guía breve con imágenes ("¿Cómo anoto?", "¿Cómo confirmo?"). | F1 |

---

## 9. Reglas de cálculo

### 9.1 Cada movimiento genera pendientes entre pares

Para un movimiento donde **P** pagó un monto **M**, repartido en partes **p₁, p₂, … pₙ** para las personas **B₁, B₂, … Bₙ**:

- Por cada beneficiario **Bᵢ distinto de P**, se genera un pendiente de **pᵢ** de Bᵢ hacia P.
- La parte de P (si se incluyó) no genera pendiente.
- La suma de las partes siempre debe ser igual a M.

**Ejemplo:** Ana pagó Q120 de pizza para Ana, Luis y Sofía (iguales).
→ Luis tiene Q40 pendientes con Ana. Sofía tiene Q40 pendientes con Ana. Entre Luis y Sofía no se genera nada.

### 9.2 Saldo neto entre dos personas

Para dos personas A y B, por cada moneda por separado:

```
Saldo de B hacia A =
    (suma de lo que A pagó por B)
  − (suma de lo que B pagó por A)
  − (suma de abonos de B a A)
  + (suma de abonos de A a B)
  + (saldo inicial del último cuadre cerrado, si existe)
```

- Resultado **positivo**: "B tiene Q__ pendientes contigo" (visto por A).
- Resultado **negativo**: "Tienes Q__ pendientes con B" (visto por A).
- Resultado **cero**: "Están a mano".

Los pagos cruzados se compensan solos. **Ejemplo:** tú pagaste Q60 de gasolina por Luis y Luis pagó Q45 de shampoo por ti → "Luis tiene Q15 pendientes contigo".

### 9.3 Qué movimientos cuentan en el saldo

| Estado | ¿Cuenta? |
|---|---|
| Sin confirmar | Sí (con etiqueta) |
| Confirmado | Sí |
| Visto sin respuesta | Sí (con etiqueta) |
| En revisión | **No**, hasta resolverse |
| Quitado | **No** (visible en historial) |
| Por enviar (sin conexión) | Solo en el celular de quien lo anotó, marcado "por enviar" |

### 9.4 Redondeo

- Todos los montos se manejan con 2 decimales.
- Al dividir en partes iguales, si sobran centavos, **los absorbe la parte de quien pagó**. Si quien pagó no está incluido, se asignan al primer beneficiario de la lista.
- **Ejemplo:** Q100 entre Ana (pagó), Luis y Sofía → Ana Q33.34, Luis Q33.33, Sofía Q33.33.

### 9.5 Monedas

- Quetzales y dólares llevan **saldos totalmente separados**. No hay conversión automática.
- Solo se convierte cuando ambos lo acuerdan en un abono (RF-9.7): el abono en quetzales reduce el pendiente en dólares según el tipo de cambio escrito y confirmado por ambos.
- El tipo de cambio usado queda guardado en el movimiento.

### 9.6 Abonos

- Un abono de B a A es un movimiento donde B "pagó" a A el 100 %. Reduce el pendiente de B con A.
- Un abono mayor al saldo pendiente se permite, pero la app avisa: "Con este abono, Luis quedaría con Q20 a su favor. ¿Seguro?".
- Un abono asignado a un préstamo específico reduce lo pendiente de ese préstamo y, por lo tanto, el saldo general.

### 9.7 Quedar a mano

Genera un abono por el saldo neto exacto en cada moneda que la persona elija, de quien tiene el pendiente hacia quien tiene a favor, con la nota "Quedamos a mano".

### 9.8 Gastos que se repiten

- Cada mes generan un movimiento normal con la configuración vigente en ese momento.
- Un cambio de monto "en adelante" solo afecta los meses siguientes.
- Un cambio "solo este mes" solo modifica el movimiento de ese mes.
- Si el día configurado no existe en un mes (ej. día 31 en febrero), se usa el último día del mes.

### 9.9 Cuadres cerrados

- Se identifican por el par de personas y el rango de fechas.
- Al cerrarse, el saldo final por moneda se convierte en el saldo inicial del siguiente periodo entre ese par.
- Los movimientos con fecha dentro de un periodo cerrado no pueden crearse, editarse ni quitarse. Si alguien intenta anotar uno con fecha anterior, la app sugiere anotarlo como ajuste con fecha de hoy.
- Dos cuadres del mismo par no pueden traslaparse en fechas.

### 9.10 Privacidad en los cálculos

- Los saldos siempre son **entre dos personas**.
- No existe un "saldo de la familia" ni simplificación de pagos entre tres o más.

---

## 10. Información que maneja el sistema

| Elemento | Datos |
|---|---|
| **Familia** | Nombre, fecha de creación, miembros |
| **Persona** | Nombre corto, correo, foto o emoji, color, modo sencillo (sí/no), tamaño de letra, preferencias de avisos, PIN (opcional) |
| **Movimiento** | Tipo (gasto por otro / préstamo / abono / ajuste), categoría, quién pagó, monto total, moneda, fecha, nota, foto (opcional), quién lo anotó, fecha de registro, estado, fecha acordada (préstamos), préstamo asociado (abonos), tipo de cambio (abonos entre monedas), gasto repetido de origen (si aplica) |
| **Parte** | Movimiento, persona, monto que le corresponde |
| **Confirmación** | Movimiento, persona, estado (por revisar / confirmado / corrección propuesta / visto sin respuesta), comentario, fecha |
| **Propuesta de corrección** | Movimiento, quién propone, valores propuestos, comentario, respuesta, fecha |
| **Historial de cambios** | Movimiento, campo cambiado, valor anterior, valor nuevo, quién, cuándo, motivo |
| **Gasto que se repite** | Nombre, quién paga (o turnos), monto vigente, moneda, día del mes, participantes, división, estado (activo/pausado/terminado), historial de cambios de monto |
| **Cuadre** | Par de personas, fecha inicio, fecha fin, saldo inicial y final por moneda, estado (abierto / esperando / cerrado), quién aceptó y cuándo |
| **Recordatorio** | Persona, tipo, movimiento o cuadre relacionado, fecha programada, enviado (sí/no) |

---

## 11. Casos de uso

Formato: actor, situación inicial, pasos, variantes y resultado esperado.

### CU-01. Ingresar por primera vez con invitación
- **Actor:** cualquier miembro (ej. Mamá, con ayuda de un hijo).
- **Situación inicial:** recibió por WhatsApp el enlace de invitación.
- **Pasos:**
  1. Abre el enlace.
  2. Escribe su correo y toca "Enviar código".
  3. Escribe el código de 6 dígitos que le llegó.
  4. Elige su nombre corto y una foto o emoji.
  5. La app le ofrece instalarse en la pantalla de inicio con instrucciones visuales.
  6. (Opcional) Activa el modo sencillo.
- **Variante:** el código venció → "Enviar otro código".
- **Resultado:** queda dentro de la familia, con sesión abierta permanentemente en su celular.

### CU-02. Pizza entre tres, la paga una persona
- **Actor:** Ana.
- **Pasos:**
  1. Toca "＋ Anotar" → "Comida/gusto".
  2. Escribe Q120.
  3. Toca su cara, la de Luis y la de Sofía.
  4. Revisa el resumen: "Pagaste Q120. Luis y Sofía quedan con Q40 pendientes cada uno contigo." → Guardar.
- **Resultado:** Luis y Sofía reciben aviso para revisar (F2). En la tarjeta de Ana: "Luis tiene Q40 pendientes contigo" y "Sofía tiene Q40 pendientes contigo". Mamá no ve este movimiento.

### CU-03. Shampoo entre dos
- **Actor:** Luis.
- **Pasos:** Anotar → "Cuidado personal" → Q50 → toca a Luis y a Sofía → Guardar.
- **Resultado:** Sofía queda con Q25 pendientes con Luis.

### CU-04. Gasolina pagada por la acompañante
- **Actor:** Sofía (en la gasolinera, de pie, con prisa).
- **Pasos:** Anotar → "Gasolina" → Q60 → toca solo a Ana → Guardar.
- **Resultado:** Ana queda con Q60 pendientes con Sofía. Tiempo total menor a 15 segundos.

### CU-05. Paquete contra entrega pagado por Mamá
- **Actor:** Luis anota (Mamá pagó).
- **Pasos:**
  1. Anotar → "Paquete" → Q200.
  2. Toca "Pagó otra persona" → elige a Mamá.
  3. "Para quién" → Luis (por defecto, quien anota).
  4. Guardar.
- **Resultado:** Luis queda con Q200 pendientes con Mamá. Mamá recibe aviso y en modo sencillo ve: "Luis anotó que pagaste Q200 de su paquete. ¿Está bien?" → toca "Está bien ✓".

### CU-06. Pasta dental 2x1
- **Actor:** Ana.
- **Pasos:** Anotar → "Compra compartida" → Q30 → Ana y Luis → Guardar.
- **Resultado:** Luis queda con Q15 pendientes con Ana.

### CU-07. Préstamo en dólares para un viaje
- **Actor:** Luis.
- **Pasos:**
  1. Anotar → "Préstamo" → toca "Dólares" → US$300.
  2. Elige a Sofía.
  3. (F3) Indica fecha acordada: 15 de enero.
  4. Nota: "Viaje a México". Guardar.
- **Resultado:** la tarjeta de Sofía en el celular de Luis muestra "Sofía tiene US$300 pendientes contigo", separado de cualquier saldo en quetzales.

### CU-08. Préstamo por emergencia de monto alto con foto
- **Actor:** Mamá le presta Q5,000 a Ana. Ana lo anota.
- **Pasos:** Anotar → "Emergencia" → Q5,000 → "Pagó otra persona": Mamá → para Ana → adjunta foto de la transferencia → nota "Reparación de moto" → Guardar.
- **Resultado:** Mamá recibe aviso con la foto y confirma. El préstamo queda con estado confirmado.

### CU-09. Abono parcial
- **Actor:** Ana abona Q1,500 a Mamá.
- **Pasos:**
  1. Abre la tarjeta de Mamá → "Registrar abono".
  2. Escribe Q1,500. La app muestra: "Después de este abono quedarán Q3,500 pendientes con Mamá".
  3. (F3) Lo asigna al préstamo "Reparación de moto".
  4. Guardar.
- **Resultado:** Mamá recibe aviso para confirmar. El saldo baja a Q3,500.

### CU-10. Compensación automática
- **Situación:** Sofía pagó Q60 de gasolina por Ana; días después Ana pagó Q45 de comida por Sofía.
- **Resultado:** sin que nadie haga nada, la tarjeta muestra "Ana tiene Q15 pendientes con Sofía".

### CU-11. Quedar a mano
- **Actor:** Ana, después del caso anterior.
- **Pasos:** tarjeta de Sofía → "Quedar a mano" → la app muestra "Se anotará que le diste Q15 a Sofía y quedan a mano" → Sí.
- **Resultado:** Sofía confirma; el saldo queda en cero: "Están a mano 🤝".

### CU-12. Pagar un préstamo en dólares con quetzales
- **Actor:** Sofía quiere pagar US$100 de los US$300 con quetzales.
- **Pasos:** tarjeta de Luis → "Registrar abono" → elige "Pago pendiente en dólares con quetzales" → escribe Q770 y tipo de cambio 7.70 → la app muestra "Equivale a US$100. Quedarán US$200 pendientes" → Guardar.
- **Resultado:** Luis debe confirmar el abono y el tipo de cambio. Queda registrado.

### CU-13. Configurar Netflix compartido
- **Actor:** Ana.
- **Pasos:** Anotar → "Plataformas" → Q120 → Ana y Luis → activa "Se repite cada mes", día 15 → nombre "Netflix" → Guardar.
- **Resultado:** cada día 15 se crea "Netflix · [mes]" con Luis con Q60 pendientes con Ana. Ana recibe "¿Netflix cobró Q120 este mes?". Luis recibe aviso para revisar.

### CU-14. Cada uno paga una plataforma
- **Situación:** Ana paga Netflix (Q120, entre Ana y Luis); Luis paga Spotify (Q90, entre Luis y Ana).
- **Resultado:** cada mes el saldo se compensa solo: Luis tiene Q15 pendientes con Ana.

### CU-15. Sube el precio de una plataforma
- **Actor:** Ana.
- **Pasos:** Mis gastos que se repiten → Netflix → Cambiar monto → Q135 → "Desde el próximo mes".
- **Resultado:** los meses anteriores no cambian; desde el siguiente se usa Q135.

### CU-16. Corregir un movimiento
- **Actor:** Luis recibe aviso: "Ana anotó pizza Q120, te tocan Q40".
- **Pasos:** toca "Corregir" → cambia su parte a Q30 → comentario "Yo solo comí 2 pedazos".
- **Resultado:** el movimiento pasa a "en revisión" y deja de contar. Ana recibe la propuesta y la acepta. El movimiento queda confirmado con el cambio registrado en el historial (quién, cuándo, valor anterior y nuevo).

### CU-17. Ambos anotan la misma compra
- **Situación:** Ana anotó la pizza. Una hora después, Sofía intenta anotar "Ana pagó Q120 de pizza".
- **Resultado:** la app pregunta: "¿Es el mismo que anotó Ana hoy (Q120, comida)?". Sofía toca "Sí, es el mismo" y no se guarda el duplicado.

### CU-18. Quitar algo anotado por error
- **Actor:** Ana.
- **Pasos:** abre el movimiento → "Quitar" → motivo "Me equivoqué" → confirma.
- **Resultado:** el movimiento deja de contar, queda visible tachado en el historial de ambos con el motivo, y la otra persona recibe aviso.

### CU-19. Cuadre de seis meses y cierre
- **Actores:** Ana y Luis.
- **Pasos:**
  1. Ana abre la tarjeta de Luis → "Hacer cuadre" → "Últimos 6 meses".
  2. Revisa la lista, los subtotales por categoría y el saldo final.
  3. La app avisa que hay 2 movimientos sin confirmar (se cerrarán como aceptados) y ninguno en revisión.
  4. Ana toca "Estamos de acuerdo". Estado: "Esperando a Luis".
  5. Luis recibe aviso, revisa y toca "Estamos de acuerdo".
  6. Descargan el PDF.
- **Variante:** hay un movimiento en revisión → la app no permite cerrar y muestra cuál falta resolver.
- **Resultado:** periodo cerrado y bloqueado; el saldo final pasa como saldo inicial del siguiente periodo.

### CU-20. Error descubierto después de un cuadre cerrado
- **Actor:** Ana recuerda un gasto de hace 4 meses que no se anotó.
- **Pasos:** intenta anotarlo con fecha antigua → la app indica que ese periodo está cerrado y ofrece anotarlo como **ajuste** con fecha de hoy y nota explicativa.
- **Resultado:** se anota como ajuste; Luis lo revisa como cualquier movimiento.

### CU-21. Mamá revisa sus pendientes en modo sencillo
- **Actor:** Mamá.
- **Pasos:**
  1. Abre la app y ve: "Tienes 3 cosas por revisar".
  2. Toca el aviso. Ve un movimiento a la vez, en letra grande: "Luis anotó que pagaste Q200 de su paquete".
  3. Toca "Está bien ✓". Pasa al siguiente.
  4. En uno no está segura → toca "Algo no está bien" → escribe o dicta un comentario.
- **Resultado:** dos confirmados, uno en revisión. Mamá nunca vio filtros, menús ni términos técnicos.

### CU-22. Mamá pide ayuda
- **Actor:** Mamá.
- **Pasos:** toca "Pedir ayuda" → se abre WhatsApp con su hijo elegido y el mensaje "Necesito ayuda con la app de cuentas".

### CU-23. Anotar sin internet
- **Actor:** Sofía, en una gasolinera sin señal.
- **Pasos:** anota la gasolina normalmente. El movimiento aparece con la etiqueta "por enviar".
- **Resultado:** al recuperar señal se envía solo; Ana recibe el aviso.

### CU-24. Recordar amablemente por WhatsApp
- **Actor:** Luis, sobre el préstamo de Sofía con fecha acordada.
- **Pasos:** tarjeta de Sofía → "Avisar por WhatsApp" → la app abre WhatsApp con un mensaje ya redactado y editable (ver sección 15) → Luis lo envía si quiere.
- **Resultado:** la app nunca envía mensajes por su cuenta.

### CU-25. Descargar respaldo
- **Actor:** cualquier miembro.
- **Pasos:** Mi cuenta → "Descargar mis movimientos" → se descarga una hoja de cálculo.
- **Resultado:** archivo con todos los movimientos donde participa, guardable en su Drive o correo.

---

## 12. Requerimientos no funcionales

### 12.1 Usabilidad
| Código | Requerimiento |
|---|---|
| RNF-1 | Anotar un movimiento cotidiano: máximo **3 toques** más escribir el monto; menos de **15 segundos**. |
| RNF-2 | Confirmar un movimiento: **1 toque**. |
| RNF-3 | Botones de acción principales con altura mínima equivalente a un dedo adulto (al menos 48 px) y separación suficiente para no tocar el equivocado. |
| RNF-4 | Letra base legible sin hacer zoom; en modo sencillo, notablemente más grande. |
| RNF-5 | Uso cómodo con una sola mano: acciones principales en la mitad inferior de la pantalla. |
| RNF-6 | Todo el contenido en **español** de Guatemala, lenguaje cotidiano y cálido, tuteo, sin jerga financiera ni técnica. |
| RNF-7 | Montos con formato local: "Q1,250.00" y "US$300.00". Fechas en formato "15 de noviembre" o "15/11/2026". |
| RNF-8 | Una persona sin experiencia debe poder anotar su primer movimiento sin instrucciones previas. |

### 12.2 Accesibilidad
| Código | Requerimiento |
|---|---|
| RNF-9 | Contraste alto entre texto y fondo, legible a plena luz del sol. |
| RNF-10 | El significado nunca depende solo del color: siempre acompañado de texto ("a tu favor", "pendiente"). |
| RNF-11 | Compatible con el tamaño de letra y el lector de pantalla configurados en el celular. |
| RNF-12 | Sin animaciones rápidas ni elementos que se muevan solos. |

### 12.3 Rendimiento y disponibilidad
| Código | Requerimiento |
|---|---|
| RNF-13 | La pantalla de inicio carga en menos de 3 segundos con una conexión móvil normal. |
| RNF-14 | Guardar un movimiento muestra confirmación inmediata (menos de 1 segundo), aunque el envío termine después. |
| RNF-15 | Funciona con conexiones lentas o intermitentes sin perder lo anotado. |
| RNF-16 | Debe estar disponible en todo momento, sin "dormirse" por falta de uso. |

### 12.4 Integridad de la información
| Código | Requerimiento |
|---|---|
| RNF-17 | Ningún movimiento se elimina definitivamente; todo cambio queda registrado con autor y fecha. |
| RNF-18 | Los cálculos deben ser exactos al centavo; ambas personas siempre ven la misma cifra para su saldo compartido. |
| RNF-19 | Un movimiento anotado sin conexión nunca debe guardarse dos veces al sincronizar. |
| RNF-20 | Los periodos cerrados son inmutables. |

### 12.5 Privacidad y seguridad
| Código | Requerimiento |
|---|---|
| RNF-21 | Cada persona accede solo a sus propios movimientos; la restricción se aplica donde se guarda la información. |
| RNF-22 | La información viaja y se guarda protegida (cifrada). |
| RNF-23 | No se muestra publicidad ni se comparte información con terceros. |
| RNF-24 | Las fotos de comprobantes solo son accesibles para los participantes del movimiento. |
| RNF-25 | La información debe tener copia de seguridad automática al menos semanal, además del respaldo manual de cada persona. |

### 12.6 Compatibilidad
| Código | Requerimiento |
|---|---|
| RNF-26 | Funciona en celulares Android y iPhone de los últimos 5 años, desde el navegador e instalada en la pantalla de inicio. |
| RNF-27 | Se adapta a pantallas desde 360 px de ancho; también se puede abrir en computadora. |
| RNF-28 | Se instala sin tiendas de apps. |

### 12.7 Costo
| Código | Requerimiento |
|---|---|
| RNF-29 | El costo de operación mensual para 5 a 15 usuarios debe ser **cero o cercano a cero**. |
| RNF-30 | Las fotos se guardan reducidas de tamaño para no exceder límites gratuitos de almacenamiento. |

### 12.8 Mantenimiento
| Código | Requerimiento |
|---|---|
| RNF-31 | Las categorías, textos de botones rápidos y mensajes deben poder cambiarse sin rehacer la app. |
| RNF-32 | Cada fase debe entregarse con una guía breve de prueba para hacer desde el celular. |

---

## 13. Limitantes, restricciones y fuera de alcance

### 13.1 Limitantes conocidas
- **Notificaciones en iPhone:** solo funcionan si la app está instalada en la pantalla de inicio. Por eso existe siempre la alternativa de avisar por WhatsApp y la sección "Por revisar".
- **Sin conexión:** se puede anotar y consultar, pero confirmar, corregir y cerrar cuadres requiere internet.
- **Tipo de cambio:** no hay conversión automática entre quetzales y dólares; se acuerda manualmente.
- **Confianza:** la app registra lo que la familia anota. No verifica que el pago haya ocurrido; la foto del comprobante es opcional y sirve como respaldo.
- **Privacidad vs. simplificación:** al mantener los saldos de dos en dos, no se ofrecen atajos de pago entre tres o más personas.

### 13.2 Fuera de alcance
- **No mueve dinero:** no hace transferencias, cobros ni pagos con tarjeta. Solo anota.
- **No calcula intereses.**
- **No registra los gastos fijos de la casa** ni la cuota mensual a la mamá.
- **No es un presupuesto personal** ni un control de gastos individuales.
- **No es un documento legal** ni un contrato.
- **No envía mensajes automáticamente** en nombre de nadie; WhatsApp solo se abre con un mensaje sugerido.
- **No escanea facturas** para leer montos automáticamente.
- **No tiene rol de administrador.**

### 13.3 Restricciones
- Debe poder operar con costo mensual cercano a cero.
- Debe instalarse sin tiendas de apps.
- Todo en español, con el tono descrito en este documento.
- Construcción por fases; cada fase debe quedar usable antes de seguir.

---

## 14. Criterios de aceptación por fase

### Fase 1 — Libreta básica
- [ ] Los 5 miembros pueden ingresar con código por correo y la sesión se mantiene.
- [ ] Se puede crear la familia e invitar por enlace de WhatsApp.
- [ ] Los casos CU-02 a CU-07, CU-09 y CU-10 funcionan correctamente.
- [ ] Los saldos coinciden exactamente al revisarlos desde ambos celulares.
- [ ] Una persona no puede ver movimientos en los que no participa (probado intentando acceder a datos ajenos).
- [ ] Modo sencillo y tamaño de letra funcionan.
- [ ] La app se instala en la pantalla de inicio en Android y iPhone.
- [ ] Mamá anota y consulta un saldo sin ayuda tras una explicación breve.

### Fase 2 — Confianza
- [ ] Casos CU-13 a CU-18, CU-21, CU-22 y CU-24 funcionan.
- [ ] Ningún movimiento se puede borrar sin rastro; el historial de cambios es visible.
- [ ] Los duplicados se detectan según RF-8.1.
- [ ] Los gastos repetidos se crean una sola vez por mes, aunque nadie abra la app ese día.
- [ ] Las fotos de comprobantes se adjuntan y solo las ven los participantes.

### Fase 3 — Cuadre
- [ ] Casos CU-08, CU-11, CU-12, CU-19 y CU-20 funcionan.
- [ ] Un cuadre solo se cierra cuando ambos aceptan y no hay movimientos en revisión.
- [ ] Los periodos cerrados no se pueden modificar.
- [ ] El PDF del cuadre muestra la misma información que la pantalla.

### Fase 4 — Comodidad
- [ ] Caso CU-23 funciona sin duplicar movimientos.
- [ ] Notificaciones y recordatorios funcionan y pueden apagarse.
- [ ] Máximo un recordatorio diario por persona.
- [ ] Caso CU-25 funciona.
- [ ] PIN o desbloqueo del celular funciona.

### Fase 5 — Extras
- [ ] Gráfica por categoría y resumen anual muestran solo información propia.

---

## 15. Textos y tono de la app

### Saldos
- "Luis tiene **Q85** pendientes contigo"
- "Tienes **Q40** pendientes con Sofía"
- "Con Ana están **a mano** 🤝"

### Confirmaciones
- "Ana anotó que pagó **Q120 de pizza** y te tocan **Q40**. ¿Está bien?"
- "Gracias, quedó confirmado ✓"

### Correcciones
- "Luis propone un cambio: su parte sería **Q30** en lugar de Q40. Comentario: *Yo solo comí 2 pedazos*."
- "¿Aceptas el cambio?" — **Sí, está bien** / **Responder**

### Duplicados
- "Parece que Ana ya anotó algo igual hoy (**Q120, comida**). ¿Es el mismo?"

### Cuadre
- "¿Hacemos un cuadre? Han pasado 2 meses desde el último con Luis."
- "Ya estás de acuerdo con el cuadre. Esperando a Luis."
- "¡Listo! Cuadre cerrado. Desde aquí empiezan cuentas nuevas."

### Mensajes de WhatsApp sugeridos
- **Recordar revisión:** "Hola Luis 😊 anoté en la app lo de la pizza del viernes, cuando puedas le das un vistazo. ¡Gracias!"
- **Fecha acordada:** "Hola Sofi, te escribo porque habíamos quedado el 15 para lo del viaje. Sin presión, avísame cómo vas 🙌"
- **Cuadre:** "Hola Ana, ¿hacemos el cuadre de estos meses en la app? Así quedamos claros 😊"
- **Saldo:** "Hola Luis, según la app tenemos Q85 por cuadrar. Cuando puedas lo vemos 👍"

### Errores
- "No pudimos guardar por falta de internet. Lo guardamos en tu celular y se enviará solo cuando vuelva la señal."
- "La suma de las partes es Q110 y el total es Q120. Revisa los montos para que cuadren."

---

## 16. Supuestos y decisiones pendientes

### Supuestos
- Todos los miembros tienen correo electrónico al que pueden acceder desde el celular.
- La familia acordará anotar los movimientos el mismo día en que ocurren.
- Los montos se manejan solo en quetzales y dólares.
- La mamá contará con ayuda de un hijo para la instalación inicial.

### Decisiones pendientes (a confirmar con la familia)
1. **Nombre definitivo** de la app (provisional: "Cuentas Claras en Familia").
2. **Días para "visto sin respuesta"** (propuesta: 7 días).
3. **Umbral de duplicados** (propuesta: mismo par de personas, diferencia de monto menor a 5 %, fecha igual o ±1 día).
4. **Monto mínimo a anotar:** la familia indicó que quiere registrar todo; se deja abierta la opción de un acuerdo futuro (ej. no anotar menos de Q10).
5. **Frecuencia sugerida de cuadres** (propuesta: recordatorio a los 60 días sin cuadre).
6. **Categorías finales** de los botones rápidos.
