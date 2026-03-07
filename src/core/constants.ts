export const USER_ROLES = ["PARTICIPANTE", "JUEZ", "ADMIN"] as const;

export const EVENT_STATUSES = ["DRAFT", "UPCOMING", "ONGOING", "FINISHED"] as const;

export type CountryOption = { value: string; label: string; flagUrl: string; phoneCode: string };

export const COUNTRY_OPTIONS: CountryOption[] = [
  { value: "argentina",           label: "Argentina",           flagUrl: "https://flagcdn.com/w40/ar.png", phoneCode: "+54"  },
  { value: "bolivia",             label: "Bolivia",             flagUrl: "https://flagcdn.com/w40/bo.png", phoneCode: "+591" },
  { value: "brasil",              label: "Brasil",              flagUrl: "https://flagcdn.com/w40/br.png", phoneCode: "+55"  },
  { value: "chile",               label: "Chile",               flagUrl: "https://flagcdn.com/w40/cl.png", phoneCode: "+56"  },
  { value: "colombia",            label: "Colombia",            flagUrl: "https://flagcdn.com/w40/co.png", phoneCode: "+57"  },
  { value: "costa_rica",          label: "Costa Rica",          flagUrl: "https://flagcdn.com/w40/cr.png", phoneCode: "+506" },
  { value: "cuba",                label: "Cuba",                flagUrl: "https://flagcdn.com/w40/cu.png", phoneCode: "+53"  },
  { value: "ecuador",             label: "Ecuador",             flagUrl: "https://flagcdn.com/w40/ec.png", phoneCode: "+593" },
  { value: "el_salvador",         label: "El Salvador",         flagUrl: "https://flagcdn.com/w40/sv.png", phoneCode: "+503" },
  { value: "espana",              label: "España",              flagUrl: "https://flagcdn.com/w40/es.png", phoneCode: "+34"  },
  { value: "guatemala",           label: "Guatemala",           flagUrl: "https://flagcdn.com/w40/gt.png", phoneCode: "+502" },
  { value: "honduras",            label: "Honduras",            flagUrl: "https://flagcdn.com/w40/hn.png", phoneCode: "+504" },
  { value: "mexico",              label: "México",              flagUrl: "https://flagcdn.com/w40/mx.png", phoneCode: "+52"  },
  { value: "nicaragua",           label: "Nicaragua",           flagUrl: "https://flagcdn.com/w40/ni.png", phoneCode: "+505" },
  { value: "panama",              label: "Panamá",              flagUrl: "https://flagcdn.com/w40/pa.png", phoneCode: "+507" },
  { value: "paraguay",            label: "Paraguay",            flagUrl: "https://flagcdn.com/w40/py.png", phoneCode: "+595" },
  { value: "peru",                label: "Perú",                flagUrl: "https://flagcdn.com/w40/pe.png", phoneCode: "+51"  },
  { value: "puerto_rico",         label: "Puerto Rico",         flagUrl: "https://flagcdn.com/w40/pr.png", phoneCode: "+1"   },
  { value: "republica_dominicana",label: "República Dominicana",flagUrl: "https://flagcdn.com/w40/do.png", phoneCode: "+1"   },
  { value: "uruguay",             label: "Uruguay",             flagUrl: "https://flagcdn.com/w40/uy.png", phoneCode: "+598" },
  { value: "venezuela",           label: "Venezuela",           flagUrl: "https://flagcdn.com/w40/ve.png", phoneCode: "+58"  },
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  argentina: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Mar del Plata", "Salta", "Santa Fe", "San Juan", "Resistencia", "Neuquén", "Corrientes", "Posadas", "Bahía Blanca"],
  bolivia: ["La Paz", "Santa Cruz de la Sierra", "Cochabamba", "Oruro", "Sucre", "Potosí", "Tarija", "Trinidad", "Cobija", "El Alto"],
  brasil: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre", "Belém", "Goiânia", "Florianópolis", "Maceió", "Natal"],
  chile: ["Santiago", "Valparaíso", "Concepción", "Antofagasta", "La Serena", "Temuco", "Rancagua", "Talca", "Arica", "Iquique", "Puerto Montt", "Coquimbo", "Calama", "Osorno", "Punta Arenas"],
  colombia: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Santa Marta", "Manizales", "Ibagué", "Pasto", "Montería", "Neiva", "Villavicencio"],
  costa_rica: ["San José", "Alajuela", "Desamparados", "San Carlos", "Pérez Zeledón", "Liberia", "Limón", "Heredia", "Cartago", "Puntarenas"],
  cuba: ["La Habana", "Santiago de Cuba", "Camagüey", "Holguín", "Guantánamo", "Santa Clara", "Bayamo", "Las Tunas", "Cienfuegos", "Matanzas"],
  ecuador: ["Quito", "Guayaquil", "Cuenca", "Santo Domingo", "Machala", "Durán", "Manta", "Portoviejo", "Loja", "Ambato", "Esmeraldas", "Ibarra", "Riobamba", "Quevedo"],
  el_salvador: ["San Salvador", "Santa Ana", "Soyapango", "San Miguel", "Mejicanos", "Santa Tecla", "Apopa", "Delgado", "Usulután", "Ahuachapán"],
  espana: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón"],
  guatemala: ["Ciudad de Guatemala", "Mixco", "Villa Nueva", "Quetzaltenango", "Escuintla", "San Juan Sacatepéquez", "Chinautla", "Chimaltenango", "Huehuetenango", "Cobán"],
  honduras: ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progreso", "Villanueva", "Choluteca", "Comayagua", "Juticalpa", "Danlí"],
  mexico: ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Torreón", "Querétaro", "San Luis Potosí", "Mérida", "Mexicali", "Aguascalientes", "Cancún", "Culiacán", "Hermosillo", "Chihuahua", "Morelia", "Veracruz", "Oaxaca"],
  nicaragua: ["Managua", "León", "Masaya", "Matagalpa", "Chinandega", "Granada", "Estelí", "Tipitapa", "Ciudad Sandino", "Juigalpa"],
  panama: ["Ciudad de Panamá", "San Miguelito", "Tocumen", "David", "Arraiján", "Colón", "La Chorrera", "Pacora", "Santiago", "Chitré"],
  paraguay: ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá", "Lambaré", "Fernando de la Mora", "Limpio", "Ñemby", "Encarnación"],
  peru: ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Chimbote", "Huancayo", "Tacna", "Juliaca", "Ica", "Pucallpa", "Puno", "Ayacucho"],
  puerto_rico: ["San Juan", "Bayamón", "Carolina", "Ponce", "Caguas", "Guaynabo", "Arecibo", "Toa Baja", "Mayagüez", "Trujillo Alto"],
  republica_dominicana: ["Santo Domingo", "Santiago de los Caballeros", "Santo Domingo Este", "Santo Domingo Norte", "San Pedro de Macorís", "La Romana", "San Francisco de Macorís", "San Cristóbal", "Puerto Plata", "Higüey"],
  uruguay: ["Montevideo", "Salto", "Ciudad de la Costa", "Paysandú", "Las Piedras", "Rivera", "Maldonado", "Tacuarembó", "Melo", "Mercedes"],
  venezuela: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "Maturín", "Barcelona", "Cumana", "Mérida", "San Cristóbal", "Cabimas", "Barinas", "Punto Fijo", "Los Teques"],
};
