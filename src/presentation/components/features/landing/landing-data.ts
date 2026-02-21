export const heroDate = "15 Y 16 DE AGOSTO, 2026 / SALON GUARAYO - FEXPOCRUZ";

export const heroTitle = "¡Nuestro Evento de Diseño\nSe Acerca!";

export const firstSpeakers = [
  {
    name: "ANDERSON\nADAM",
    role: "DIRECTOR DE ARTE / DISEÑADOR",
    image:
      "https://images.unsplash.com/photo-1664101606938-e664f5852fac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODR8&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "EDWARDS\nREYES",
    role: "DISEÑADOR WEB",
    image:
      "https://images.unsplash.com/photo-1575299833801-85ce40813bac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODV8&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "ROGERS\nPARKER",
    role: "DESARROLLADOR",
    image:
      "https://images.unsplash.com/photo-1574132190990-cfd62178bb1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODV8&ixlib=rb-4.1.0&q=80&w=1080",
  },
] as const;

export const modelCards = [
  {
    name: "Avion Personalizado",
    category: "Aviones",
    scale: "1:100",
    image:
      "/Images/Avion.jpg",
  },
  {
    name: "M4 Sherman",
    category: "Tanques",
    scale: "1:72",
    image:
      "/Images/Tanque.jpg",
  },
  {
    name: "Bluenose II",
    category: "Barcos",
    scale: "1:75",
    image:
      "/Images/Barco.jpg",
  },
] as const;

export const eventsCopy = {
  title: "Eventos Que\nRecordarás",
  subtitle: "Vive la pasión por el modelismo en un evento que celebra el detalle, la creatividad y la precisión.",
  descriptionOne:
    "SicSemper reúne a constructores, coleccionistas y entusiastas de las maquetas en un espacio donde cada pieza cuenta una historia. Desde aviones y tanques hasta creaciones personalizadas, nuestra competencia es el escenario perfecto para demostrar tu talento y compartir tu trabajo con una comunidad que valora cada detalle.",
  descriptionTwo:
    "Participa, compite y conecta con personas que comparten tu misma pasión. Aquí no solo presentas una maqueta: presentas horas de dedicación, técnica y creatividad.",
  image:
    "/Images/Evento.jpg",
} as const;

export const featuredSpeakers = [
  {
    cardColor: "#9bb8ff",
    image:
      "https://images.unsplash.com/photo-1641893049587-a7f0f399ecec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODZ8&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Dale Slemp",
    role: "Director General del Evento\nCoordinación y Supervisión de Competencias",
  },
  {
    cardColor: "#ffddcc",
    image:
      "https://images.unsplash.com/photo-1653914900849-beb53df7f5ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODd8&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Jolan Memory",
    role: "Coordinadora de Participantes\nRegistro y Gestión de Categorías",
  },
  {
    cardColor: "#77ff99",
    image:
      "https://images.unsplash.com/photo-1761682773866-9807cb541d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODd8&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Christa Ceinture",
    role: "Responsable de Evaluación\nLogística y Soporte a Jurados",
  },
] as const;

export const scheduleItems = [
  {
    time: "8:00 AM - 10:00 AM",
    title: "Registro y Café",
    description:
      "Recepción de participantes, verificación de inscripciones y entrega de credenciales. Espacio para preparar las maquetas y compartir con otros modelistas antes de iniciar la evaluación.",
    isActive: true,
  },
  {
    time: "10:00 AM - 11:00 AM",
    title: "Planificar y Realizar Investigación de Usuarios",
    description:
      "Inicio oficial de la exhibición. Las maquetas quedan abiertas al público mientras el jurado revisa criterios como precisión histórica, nivel de detalle y acabado.",
    isActive: false,
  },
  {
    time: "11:00 AM - 1:00 PM",
    title: "Preguntas y Respuestas para el Conferencista",
    description:
      "Interacción entre participantes y jueces. Los modelistas pueden explicar técnicas, materiales utilizados y procesos de construcción.",
    isActive: false,
  },
  {
    time: "1:00 PM - 2:00 PM",
    title: "Descanso para Almuerzo",
    description:
      "Pausa para el almuerzo mientras continúa la exhibición abierta al público y la deliberación parcial del jurado.",
    isActive: false,
  },
  {
    time: "2:00 PM - 3:00 PM",
    title: "Investigación para lo Correcto",
    description:
      "Evaluación final y deliberación del jurado. Se determinan los puntajes y se preparan los resultados por categoría y subcategoría.",
    isActive: false,
  },
] as const;

export const sponsors = {
  main: [
    "TECHCORP",
    "DESIGNLAB",
    "INNOVATE",
    "PIXEL FORGE",
    "NOVA STUDIO",
    "BRIGHT CODE",
    "UX BRIDGE",
    "DATAWAVE",
  ],
  secondary: ["CREATIVE CO", "PIXEL STUDIO", "BRANDIFY"],
} as const;

export const locationCards = [
  {
    icon: "mapPin",
    iconBackground: "rgba(255, 107, 157, 0.2)",
    label: "Dirección",
    title: "Salón Hotel Guarayo",
    description:
      "Av. Roca y Coronado, Cerca del Hipermaxi, Entrada por la Puerta Principal.",
  },
  {
    icon: "transport",
    iconBackground: "rgba(107, 154, 255, 0.2)",
    label: "Transporte Público",
    title: "Línea 29 - Línea 70",
    description:
      "Las líneas 29 y 70 cuentan con paradas cercanas a la entrada principal de la Fexpocruz.",
  },
  {
    icon: "parking",
    iconBackground: "rgba(255, 187, 102, 0.2)",
    label: "Estacionamiento",
    title: "Parking Privado Gratis",
    description:
      "Contamos con más de 500 plazas de estacionamiento gratuitas para todos los asistentes registrados.",
  },
] as const;

export const locationMapImage =
  "/Images/Ubicacion.png";
