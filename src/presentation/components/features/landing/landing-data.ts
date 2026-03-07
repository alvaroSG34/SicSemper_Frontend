export const heroDate = "15 Y 16 DE AGOSTO, 2026 / SALON GUARAYO - FEXPOCRUZ";

export const heroTitle = "Â¡Nuestra Competencia de Maquetas\nSe Acerca!";

export const firstSpeakers = [
  {
    name: "ANDERSON\nADAM",
    role: "MAESTRO MODELISTA / JURADO TECNICO",
    image:
      "https://images.unsplash.com/photo-1664101606938-e664f5852fac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODR8&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "EDWARDS\nREYES",
    role: "ESPECIALISTA EN DETALLADO",
    image:
      "https://images.unsplash.com/photo-1575299833801-85ce40813bac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODV8&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "ROGERS\nPARKER",
    role: "CONSTRUCTOR DE DIORAMAS",
    image:
      "https://images.unsplash.com/photo-1574132190990-cfd62178bb1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODV8&ixlib=rb-4.1.0&q=80&w=1080",
  },
] as const;

export const modelCards = [
  {
    name: "Avion Personalizado",
    category: "Aviones",
    scale: "1:100",
    image: "/Images/Avion.jpg",
  },
  {
    name: "M4 Sherman",
    category: "Tanques",
    scale: "1:72",
    image: "/Images/Tanque.jpg",
  },
  {
    name: "Bluenose II",
    category: "Barcos",
    scale: "1:75",
    image: "/Images/Barco.jpg",
  },
] as const;

export const eventsCopy = {
  title: "Eventos Que\nRecordarÃ¡s",
  subtitle:
    "Vive la pasiÃ³n por el modelismo en un evento que celebra el detalle, la creatividad y la precisiÃ³n.",
  descriptionOne:
    "SicSemper reÃºne a constructores, coleccionistas y entusiastas de las maquetas en un espacio donde cada pieza cuenta una historia. Desde aviones y tanques hasta creaciones personalizadas, nuestra competencia es el escenario perfecto para demostrar tu talento y compartir tu trabajo con una comunidad que valora cada detalle.",
  descriptionTwo:
    "Participa, compite y conecta con personas que comparten tu misma pasiÃ³n. AquÃ­ no solo presentas una maqueta: presentas horas de dedicaciÃ³n, tÃ©cnica y creatividad.",
  image: "/Images/Evento.jpg",
} as const;

export const featuredSpeakersGroup = {
  image:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
  members: [
    {
      name: "Dale Slemp",
      role: "Director General del Evento\nCoordinación y Supervisión de Competencias",
    },
    {
      name: "Jolan Memory",
      role: "Coordinadora de Participantes\nRegistro y Gestión de Categorías",
    },
    {
      name: "Christa Ceinture",
      role: "Responsable de Evaluación\nLogística y Soporte a Jurados",
    },
  ],
} as const;

export const scheduleItems = [
  {
    time: "8:00 AM - 10:00 AM",
    title: "Registro y CafÃ©",
    description:
      "RecepciÃ³n de participantes, verificaciÃ³n de inscripciones y entrega de credenciales. Espacio para preparar las maquetas y compartir con otros modelistas antes de iniciar la evaluaciÃ³n.",
    isActive: true,
  },
  {
    time: "10:00 AM - 11:00 AM",
    title: "ExhibiciÃ³n y EvaluaciÃ³n TÃ©cnica",
    description:
      "Inicio oficial de la exhibiciÃ³n. Las maquetas quedan abiertas al pÃºblico mientras el jurado revisa criterios como precisiÃ³n histÃ³rica, nivel de detalle y acabado.",
    isActive: false,
  },
  {
    time: "11:00 AM - 1:00 PM",
    title: "Mesa TÃ©cnica con Jurados",
    description:
      "InteracciÃ³n entre participantes y jueces. Los modelistas pueden explicar tÃ©cnicas, materiales utilizados y procesos de construcciÃ³n.",
    isActive: false,
  },
  {
    time: "1:00 PM - 2:00 PM",
    title: "Descanso para Almuerzo",
    description:
      "Pausa para el almuerzo mientras continÃºa la exhibiciÃ³n abierta al pÃºblico y la deliberaciÃ³n parcial del jurado.",
    isActive: false,
  },
  {
    time: "2:00 PM - 3:00 PM",
    title: "DeliberaciÃ³n Final del Jurado",
    description:
      "EvaluaciÃ³n final y deliberaciÃ³n del jurado. Se determinan los puntajes y se preparan los resultados por categorÃ­a y subcategorÃ­a.",
    isActive: false,
  },
] as const;

export const sponsors = {
  main: [
    "IPMS BOLIVIA",
    "MODEL KITS BOL",
    "AEROMODEL CLUB",
    "TANQUE HISTORICO",
    "NAVAL SCALE HOUSE",
    "DIORAMA LAB",
    "HOBBY MASTER",
    "PINTURAS ATLAS",
  ],
  secondary: ["CREATIVE CO", "PIXEL STUDIO", "BRANDIFY"],
} as const;

export const locationCards = [
  {
    icon: "mapPin",
    iconBackground: "rgba(255, 107, 157, 0.2)",
    label: "DirecciÃ³n",
    title: "SalÃ³n Hotel Guarayo",
    description:
      "Av. Roca y Coronado, Cerca del Hipermaxi, Entrada por la Puerta Principal.",
  },
  {
    icon: "transport",
    iconBackground: "rgba(107, 154, 255, 0.2)",
    label: "Transporte PÃºblico",
    title: "LÃ­nea 29 - LÃ­nea 70",
    description:
      "Las lÃ­neas 29 y 70 cuentan con paradas cercanas a la entrada principal de la Fexpocruz.",
  },
  {
    icon: "parking",
    iconBackground: "rgba(255, 187, 102, 0.2)",
    label: "Estacionamiento",
    title: "Parking Privado Gratis",
    description:
      "Contamos con mÃ¡s de 500 plazas de estacionamiento gratuitas para todos los asistentes registrados.",
  },
] as const;

export const locationMapImage = "/Images/Ubicacion.png";

export const locationMapUrl =
  "https://www.google.com/maps/search/?api=1&query=Salon+Hotel+Guarayo+Av.+Roca+y+Coronado+Santa+Cruz+Bolivia";
