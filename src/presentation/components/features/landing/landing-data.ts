export const heroDate = "15 Y 16 DE OCTUBRE, 2021 / SALÓN HOTEL MANDALAY";

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

export const eventsCopy = {
  title: "Eventos Que\nRecordarás",
  subtitle: "Somos una empresa de eventos de negocios originaria de Nueva York",
  descriptionOne:
    "SicSemper es una empresa de gestión de eventos empresariales con un equipo de talento \nde algunas de las mentes más brillantes de la industria. Nuestros eventos aprovechan lo mejor \nde la tecnología y la creatividad para ofrecer experiencias memorables que unen a las personas.",
  descriptionTwo:
    "Nos apasiona crear experiencias inspiradoras que sacan lo mejor de las personas. \nYa sea que busques una actividad divertida para tu equipo o quieras conectar con \nprofesionales afines, tenemos el evento perfecto para ti.",
  image:
    "https://images.unsplash.com/photo-1681459876999-4f6cd1164e4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODh8&ixlib=rb-4.1.0&q=80&w=1080",
} as const;

export const featuredSpeakers = [
  {
    cardColor: "#9bb8ff",
    image:
      "https://images.unsplash.com/photo-1641893049587-a7f0f399ecec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODZ8&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Dale Slemp",
    role: "Líder de Diseño de Producto\nEspecialista en Experiencias Digitales",
  },
  {
    cardColor: "#ffddcc",
    image:
      "https://images.unsplash.com/photo-1653914900849-beb53df7f5ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODd8&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Jolan Memory",
    role: "Diseñadora UX Senior\nInvestigación y Estrategia de Producto",
  },
  {
    cardColor: "#77ff99",
    image:
      "https://images.unsplash.com/photo-1761682773866-9807cb541d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA2ODEzODd8&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Christa Ceinture",
    role: "Desarrolladora Frontend\nAccesibilidad y Sistemas de Diseño",
  },
] as const;

export const scheduleItems = [
  {
    time: "8:00 AM - 10:00 AM",
    title: "Registro y Café",
    description:
      "Bienvenida y registro con refrigerios y tiempo para socializar antes de que comience el evento.",
    isActive: true,
  },
  {
    time: "10:00 AM - 11:00 AM",
    title: "Planificar y Realizar Investigación de Usuarios",
    description:
      "Aprende cómo planificar y realizar investigación de usuarios para obtener información y tomar mejores decisiones de diseño.",
    isActive: false,
  },
  {
    time: "11:00 AM - 1:00 PM",
    title: "Preguntas y Respuestas para el Conferencista",
    description:
      "Haz cualquier pregunta que desees a los conferencistas y obtén respuestas de profesionales de la industria.",
    isActive: false,
  },
  {
    time: "1:00 PM - 2:00 PM",
    title: "Descanso para Almuerzo",
    description: "Tiempo de descanso para almorzar con comida y bebidas incluidas.",
    isActive: false,
  },
  {
    time: "2:00 PM - 3:00 PM",
    title: "Investigación para lo Correcto",
    description:
      "Técnicas de investigación y validación para asegurar que estás resolviendo los problemas correctos.",
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
    icon: "📍",
    iconBackground: "rgba(255, 107, 157, 0.2)",
    label: "Dirección",
    title: "Salón Hotel Mandalay",
    description:
      "Av. Principal 123, Distrito de Innovación, Ciudad de México. Entrada por la Puerta B.",
  },
  {
    icon: "🚇",
    iconBackground: "rgba(107, 154, 255, 0.2)",
    label: "Transporte Público",
    title: "Línea 2 - Estación Diseño",
    description:
      "La estación se encuentra a solo 300 metros caminando de la entrada principal del hotel.",
  },
  {
    icon: "🅿️",
    iconBackground: "rgba(255, 187, 102, 0.2)",
    label: "Estacionamiento",
    title: "Parking Privado Gratis",
    description:
      "Contamos con más de 500 plazas de estacionamiento gratuitas para todos los asistentes registrados.",
  },
] as const;

export const locationMapImage =
  "https://images.unsplash.com/photo-1513604714797-eddc3451e655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzA5NDU3MDF8&ixlib=rb-4.1.0&q=80&w=1080";
