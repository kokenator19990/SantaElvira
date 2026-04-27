export interface HelpItem {
  titulo: string;
  que_es: string;
  como_funciona?: string;
  origen?: string;
  ejemplo: string;
  meta?: string;
}

export const HELP: Record<string, HelpItem> = {
  dfm: {
    titulo: "DFM — Disponibilidad Física Mecánica",
    que_es: "Porcentaje del tiempo en que el equipo está mecánicamente listo para operar, sin importar si hay trabajo disponible.",
    como_funciona: "Fórmula: (Horas disponibles ÷ Horas totales del período) × 100. Incluye tiempo en operación + tiempo en reserva.",
    origen: "Estándar minero ASARCO. Es el indicador principal de confiabilidad mecánica de una flota.",
    ejemplo: "DFM 88% → De 100 horas, el equipo estuvo disponible 88h. Solo 12h estuvo en reparación o mantención.",
    meta: "≥ 85% = Verde · 75–85% = Ámbar · < 75% = Rojo",
  },
  tmef: {
    titulo: "TMEF — Tiempo Medio Entre Fallas",
    que_es: "Promedio de horas que opera un equipo sin sufrir ninguna falla. A mayor TMEF, más confiable es el equipo.",
    como_funciona: "Fórmula: Horas totales operadas ÷ Número de fallas ocurridas en el período.",
    origen: "Indicador RAMS (Reliability, Availability, Maintainability, Safety). También llamado MTBF en inglés.",
    ejemplo: "TMEF 81h → El equipo falla en promedio cada 81 horas de operación. Un TMEF de 120h sería excelente.",
    meta: "≥ 80h = Verde · 50–80h = Ámbar · < 50h = Rojo",
  },
  tmpr: {
    titulo: "TMPR — Tiempo Medio de Parada por Reparación",
    que_es: "Promedio de horas que dura cada reparación, desde que el equipo falla hasta que vuelve a operar. Mide la eficiencia del taller.",
    como_funciona: "Fórmula: Total horas de parada por reparación ÷ Número de fallas. También llamado MTTR (Mean Time To Repair).",
    origen: "Indicador RAMS de mantenibilidad. Refleja la capacidad de respuesta del equipo de mantención.",
    ejemplo: "TMPR 4.3h → Cuando el equipo falla, tarda en promedio 4.3 horas en ser reparado y volver a operar. Cuanto menor, mejor.",
    meta: "≤ 5h = Verde · 5–15h = Ámbar · > 15h = Rojo (invertido: menor es mejor)",
  },
  tiempoOperativo: {
    titulo: "Tiempo Operativo",
    que_es: "Porcentaje del turno de trabajo en que el equipo estuvo activamente produciendo: moviendo tierra, transportando mineral o cargando.",
    como_funciona: "Fórmula: (Horas en producción activa ÷ Horas totales del turno) × 100. No incluye esperas ni traslados.",
    origen: "Registro de planilla operacional diaria, clasificado según metodología ASARCO.",
    ejemplo: "T.Op. 73% → De un turno de 12 horas, el equipo produjo 8.8h activas. Las otras 3.2h estuvo en espera, colas o traslados.",
    meta: "≥ 80% = Verde · 65–80% = Ámbar · < 65% = Rojo",
  },
  reserva: {
    titulo: "Reserva",
    que_es: "Porcentaje del turno en que el equipo estaba disponible mecánicamente, pero no se le asignó trabajo de producción (exceso de equipos).",
    como_funciona: "Ocurre cuando hay más equipos disponibles que frentes de trabajo activos. Alta reserva = ineficiencia operacional.",
    origen: "Estado ASARCO de tiempo en espera planificada. Indica sobre-dotación de flota o falta de frentes de trabajo.",
    ejemplo: "Reserva 16% → De 12h de turno, el equipo estuvo 2h sin asignación de trabajo. Esto es costoso e ineficiente.",
    meta: "≤ 8% = Verde · 8–20% = Ámbar · > 20% = Rojo (invertido: menor es mejor)",
  },
  semaforo: {
    titulo: "Semáforo de Estado",
    que_es: "Indicador visual del estado general del equipo según sus KPIs clave.",
    como_funciona: "Verde = todos los KPIs en rango óptimo. Ámbar = uno o más KPIs en advertencia. Rojo = uno o más KPIs en estado crítico. Paro = equipo completamente detenido.",
    ejemplo: "Un camión puede tener DFM verde (88%) pero TMPR rojo (20h), resultando en semáforo rojo general.",
  },
  paroTotal: {
    titulo: "Paro Total",
    que_es: "El equipo está completamente detenido por una falla mayor y no puede operar bajo ninguna condición.",
    como_funciona: "Puede ser por: falla de motor, sistema hidráulico crítico, daño estructural, accidente o decisión de seguridad.",
    ejemplo: "CE-04 en Paro Total por bomba hidráulica HPN-2847. El equipo no puede moverse ni producir hasta completar la reparación.",
    meta: "Objetivo operacional: 0 equipos en paro total",
  },
  criticos: {
    titulo: "Equipos Críticos",
    que_es: "Equipos que SÍ operan pero tienen uno o más KPIs en estado rojo, es decir, fuera del umbral crítico.",
    como_funciona: "Un equipo es crítico si: DFM < 75%, TMEF < 50h, TMPR > 15h, T.Op. < 65% o Reserva > 20%.",
    ejemplo: "CE-01 con DFM 73% es crítico: está operando pero su disponibilidad está bajo el mínimo aceptable de 75%.",
    meta: "Objetivo: 0 equipos críticos",
  },
  alertasActivas: {
    titulo: "Alertas Activas",
    que_es: "Total de alertas generadas cuando algún KPI de algún equipo cruza un umbral de advertencia (ámbar) o crítico (rojo).",
    como_funciona: "El sistema genera una alerta por cada KPI en estado ámbar o rojo de cada equipo. Un equipo puede tener múltiples alertas simultáneas.",
    ejemplo: "86 alertas: si el equipo CE-01 tiene DFM en rojo y TMPR en ámbar, genera 2 alertas. Con 28 equipos se acumulan rápido.",
  },
  asarcoOperativo: {
    titulo: "Operativo — ASARCO",
    que_es: "Horas en que el equipo estuvo activamente produciendo durante el período.",
    como_funciona: "Primera y más importante categoría ASARCO. Representa la producción real efectiva.",
    origen: "Sistema de clasificación ASARCO (American Smelting and Refining Company), estándar mundial en minería.",
    ejemplo: "70% Operativo → De 100h del período, el equipo produjo 70h efectivas de acarreo o carguío.",
  },
  asarcoReserva: {
    titulo: "Reserva — ASARCO",
    que_es: "Horas en que el equipo estaba en buen estado mecánico pero sin asignación de trabajo de producción.",
    origen: "Segunda categoría ASARCO. Indica sobre-dotación de flota o falta de frentes de trabajo disponibles.",
    ejemplo: "8% Reserva → 8h de 100h el equipo estuvo disponible mecánicamente pero esperando asignación del operaciones.",
  },
  asarcoDetProg: {
    titulo: "Detención Programada — ASARCO",
    que_es: "Horas de parada planificadas con anticipación: mantención preventiva, cambio de aceite, cambio de neumáticos, inspecciones periódicas.",
    origen: "Tercera categoría ASARCO. Una mantención planificada evita fallas inesperadas y es mucho menos costosa.",
    ejemplo: "8% Detención Programada → 8h de 100h el equipo estuvo en mantención preventiva según plan. Esto es positivo.",
  },
  asarcoDetNoProg: {
    titulo: "Detención No Programada — ASARCO",
    que_es: "Horas de parada por fallas o averías inesperadas que no pudieron anticiparse con el plan de mantención.",
    origen: "Cuarta categoría ASARCO. Es el indicador más negativo para la disponibilidad y tiene mayor costo.",
    ejemplo: "7% Detención No Prog. → 7h de 100h el equipo estuvo parado por fallas inesperadas. Esto impacta directamente el DFM.",
  },
  asarcoPerdida: {
    titulo: "Pérdida Operacional — ASARCO",
    que_es: "Horas perdidas por factores EXTERNOS al equipo y al taller: clima adverso, tronaduras, falta de material, cortes de energía.",
    origen: "Quinta categoría ASARCO. No es responsabilidad del mantenimiento ni del operador.",
    ejemplo: "2% Pérdida → 2h de 100h el equipo estuvo detenido por tronadura programada, lluvia intensa o corte de suministro.",
  },
  tendencia6Meses: {
    titulo: "Tendencia de KPIs — 6 Meses",
    que_es: "Gráfico de evolución histórica de los KPIs principales durante los últimos 6 meses para detectar deterioro o mejora.",
    como_funciona: "Las líneas de referencia punteadas muestran los umbrales verde y ámbar. Cuando la curva cae bajo estas líneas, el KPI entra en alerta.",
    ejemplo: "Si el DFM bajó de 85% a 73% en 3 meses, es señal de deterioro acelerado. Hay que actuar antes de llegar a cero.",
  },
  distribucionAsarco: {
    titulo: "Distribución de Tiempo ASARCO",
    que_es: "Gráfico de barras que muestra cómo se distribuyó el 100% del tiempo de cada tipo de flota según las 5 categorías ASARCO.",
    como_funciona: "Las 5 categorías siempre suman 100%. Más verde (operativo) y menos rojo (det. no programada) es mejor.",
    origen: "Sistema de clasificación ASARCO, estándar en minería a cielo abierto desde los años 70.",
    ejemplo: "Flota 785D con 70% operativo y solo 5% detención no programada indica excelente gestión de mantención.",
  },
  navDashboard: {
    titulo: "Dashboard — Vista General",
    que_es: "Pantalla principal del sistema. Muestra el estado de salud de toda la flota en tiempo real: KPIs promedio, semáforos y alertas.",
    ejemplo: "Si el semáforo de la flota 777F está en rojo, el jefe de mantención sabe que debe priorizar esa flota inmediatamente.",
  },
  navFlota: {
    titulo: "Flota — Detalle de Equipos",
    que_es: "Tabla completa con los 28 equipos de la faena, sus KPIs individuales, estado de semáforo y detalle por equipo.",
    ejemplo: "Filtra por '777F' para ver solo los camiones de ese modelo. Haz clic en una fila para ver el detalle completo del equipo.",
  },
  navAlertas: {
    titulo: "Alertas — Panel de Criticidad",
    que_es: "Lista de todas las alertas activas agrupadas por nivel: Paro Total, Crítico y Advertencia. Permite priorizar acciones.",
    ejemplo: "Alerta CE-01: DFM 72% cuando el umbral es 75%. Significa que ese camión requiere atención inmediata.",
  },
  navApd: {
    titulo: "APD Aceites — Análisis Predictivo",
    que_es: "Módulo de Análisis Predictivo por Aceites. Sube resultados de laboratorio de aceites para detectar problemas de desgaste antes de que ocurra una falla.",
    como_funciona: "Se sube un CSV con los resultados del laboratorio. El sistema detecta parámetros fuera de rango y alerta de desgaste incipiente.",
    origen: "Técnica de mantenimiento predictivo estándar en minería. Un nivel de Fe (hierro) alto en el aceite indica desgaste interno del motor.",
    ejemplo: "Fe > 30 ppm en el aceite del motor indica desgaste interno. El APD lo detecta semanas antes de que sea una falla visible.",
  },
  navReporte: {
    titulo: "Reporte — Informe Mensual",
    que_es: "Genera el informe mensual de mantención con todos los KPIs, equipos críticos y tendencias. Exportable como PDF.",
    ejemplo: "Selecciona 'Abril 2025' y haz clic en 'Imprimir / PDF'. En el diálogo del navegador elige 'Guardar como PDF' para obtener el documento.",
  },
  navDocs: {
    titulo: "Documentación Técnica",
    que_es: "Modelo de base de datos y arquitectura del sistema. Incluye diagramas ER interactivos con zoom, pantalla completa y exportación.",
    ejemplo: "Navega por las entidades del modelo haciendo clic en cada una. Usa los botones de zoom para explorar secciones específicas del diagrama.",
  },
  estadoFlota: {
    titulo: "Estado por Flota",
    que_es: "Resumen visual del estado de salud de cada tipo de equipo. Muestra los KPIs principales y cuántos equipos están en paro.",
    como_funciona: "El color del borde izquierdo indica el estado general: verde = OK, ámbar = advertencia, rojo = crítico.",
    ejemplo: "Si la tarjeta 777F tiene borde rojo y DFM 73%, significa que ese modelo de camión está bajo el umbral crítico.",
  },
  alertasPrioritarias: {
    titulo: "Alertas Prioritarias",
    que_es: "Los 5 equipos con la situación más crítica en este momento, mostrados en orden de urgencia.",
    como_funciona: "Primero aparecen los paros totales, luego los equipos con KPIs en rojo, finalmente los que están en ámbar.",
    ejemplo: "CE-04 aparece primero porque está en paro total. CE-01 aparece segundo porque su DFM está en 72% (estado rojo).",
  },
  apdParametro: {
    titulo: "Parámetro APD",
    que_es: "Elemento químico o propiedad física analizada en la muestra de aceite. Cada uno indica un tipo específico de desgaste.",
    ejemplo: "Fe (hierro) indica desgaste de piezas ferrosas del motor. Cu (cobre) indica desgaste de cojinetes de bronce. Al (aluminio) indica desgaste de pistones.",
  },
  apdValor: {
    titulo: "Valor Medido",
    que_es: "Concentración del parámetro en la muestra de aceite, expresado en partes por millón (ppm) u otras unidades.",
    ejemplo: "Fe = 45 ppm significa 45 partes de hierro por millón de partes de aceite. Si el máximo es 30 ppm, está fuera de rango.",
  },
  apdLimite: {
    titulo: "Límite de Alerta",
    que_es: "Valor máximo o mínimo aceptable definido por el fabricante o el departamento de mantenimiento. Superarlo indica problema.",
    ejemplo: "LimMax Fe = 30 ppm. Si el análisis da 45 ppm, el sistema marca ese parámetro en rojo y genera una alerta de desgaste.",
  },
  equipoHoras: {
    titulo: "Horas Acumuladas",
    que_es: "Total de horas que el equipo ha operado desde su fabricación o desde el último cambio de motor, según el horómetro.",
    ejemplo: "12.500 h → El equipo ha trabajado 12.500 horas. Equipos CAT 785D con más de 25.000h suelen requerir overhaul de motor.",
    origen: "Lectura del horómetro (contador de horas de operación) del equipo.",
  },
  periodoReporte: {
    titulo: "Período del Informe",
    que_es: "Selecciona el mes y año para el cual generar el informe mensual de KPIs.",
    ejemplo: "Selecciona 'Abril 2025' para generar el informe del mes de abril con todos sus indicadores promedio.",
  },
  columnaId: {
    titulo: "ID del Equipo",
    que_es: "Código identificador único del equipo en la faena. El prefijo indica el tipo: CE = Camión de Extracción, CH = Camión de Hormigón, CG = Cargador, EX = Excavadora.",
    ejemplo: "CE-04 → 'CE' = Camión de Extracción, '04' = número de unidad. Este código aparece en todos los informes y órdenes de trabajo.",
  },
  columnaAnio: {
    titulo: "Año de Fabricación",
    que_es: "Año en que fue fabricado el equipo. A mayor antigüedad y horas acumuladas, mayor es el costo de mantención.",
    ejemplo: "Año 2015 → Equipo de 10 años. Los equipos CAT tienen vida útil de 15–20 años con mantención adecuada.",
  },
};
