import type { LandingContent } from '@/domain/landing/landing.types';

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const landingDefaultContent: LandingContent = {
  heroDate: '15 Y 16 DE AGOSTO, 2026 / SALON GUARAYO - FEXPOCRUZ',
  heroTitle: 'Competencia IPMS BOLIVIA\nDe Modelismo',
  modelCards: [
    {
      name: 'Avion a escala',
      category: 'Aviones',
      scale: '1:100',
      image: '/Images/Avion.webp',
    },
    {
      name: 'Vehiculo militar a escala',
      category: 'Tanques',
      scale: '1:72',
      image: '/Images/Tanque.webp',
    },
    {
      name: 'Barco a escala',
      category: 'Barcos',
      scale: '1:75',
      image: '/Images/Barco.webp',
    },
  ],
  eventsCopy: {
    title: 'Eventos Que\nRecordaras',
    subtitle:
      'Vive la pasion por el modelismo en un evento que celebra el detalle, la creatividad y la precision.',
    descriptionOne:
      'IPMS BOLIVIA reune a constructores, coleccionistas y entusiastas de las maquetas en un espacio donde cada pieza cuenta una historia. Desde aviones y tanques hasta creaciones personalizadas, nuestra competencia es el escenario para demostrar talento y compartir trabajo con una comunidad que valora cada detalle.',
    descriptionTwo:
      'Participa, compite y conecta con personas que comparten tu misma pasion. Aqui no solo presentas una maqueta: presentas horas de dedicacion, tecnica y creatividad.',
    image: '/Images/Evento.webp',
  },
  featuredSpeakersGroup: {
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?crop=entropy&cs=tinysrgb&fit=max&fm=webp&q=80&w=1600',
    members: [
      {
        name: 'Comite Organizador',
        role: 'Direccion general del evento\nCoordinacion y supervision de competencias',
      },
      {
        name: 'Mesa de Registro',
        role: 'Atencion a participantes\nRegistro y gestion de categorias',
      },
      {
        name: 'Equipo de Jueces',
        role: 'Evaluacion tecnica\nLogistica y soporte a jurados',
      },
    ],
  },
  scheduleItems: [
    {
      time: '8:00 AM - 10:00 AM',
      title: 'Registro y acreditacion',
      description:
        'Recepcion de participantes, verificacion de inscripciones y entrega de credenciales. Espacio para preparar las maquetas y compartir con otros modelistas antes de iniciar la evaluacion.',
      isActive: true,
    },
    {
      time: '10:00 AM - 11:00 AM',
      title: 'Exhibicion y evaluacion tecnica',
      description:
        'Inicio oficial de la exhibicion. Las maquetas quedan abiertas al publico mientras el jurado revisa criterios como precision historica, nivel de detalle y acabado.',
      isActive: false,
    },
    {
      time: '11:00 AM - 1:00 PM',
      title: 'Mesa tecnica con jurados',
      description:
        'Interaccion entre participantes y jueces. Los modelistas pueden explicar tecnicas, materiales utilizados y procesos de construccion.',
      isActive: false,
    },
    {
      time: '1:00 PM - 2:00 PM',
      title: 'Descanso para Almuerzo',
      description:
        'Pausa para el almuerzo mientras continua la exhibicion abierta al publico y la deliberacion parcial del jurado.',
      isActive: false,
    },
    {
      time: '2:00 PM - 3:00 PM',
      title: 'Deliberacion final del jurado',
      description:
        'Evaluacion final y deliberacion del jurado. Se determinan los puntajes y se preparan los resultados por categoria y subcategoria.',
      isActive: false,
    },
  ],
  sponsors: {
    main: [
      'IPMS BOLIVIA',
      'MODEL KITS BOL',
      'AEROMODEL CLUB',
      'TANQUE HISTORICO',
      'NAVAL SCALE HOUSE',
      'DIORAMA LAB',
      'HOBBY MASTER',
      'PINTURAS ATLAS',
    ],
    secondary: ['IPMS BOLIVIA'],
  },
  locationCards: [
    {
      icon: 'mapPin',
      iconBackground: 'rgba(255, 107, 157, 0.2)',
      label: 'Direccion',
      title: 'Salon Hotel Guarayo',
      description:
        'Av. Roca y Coronado, Cerca del Hipermaxi, Entrada por la Puerta Principal.',
    },
    {
      icon: 'transport',
      iconBackground: 'rgba(107, 154, 255, 0.2)',
      label: 'Transporte publico',
      title: 'Linea 29 - Linea 70',
      description:
        'Las lineas 29 y 70 cuentan con paradas cercanas a la entrada principal de la Fexpocruz.',
    },
    {
      icon: 'parking',
      iconBackground: 'rgba(255, 187, 102, 0.2)',
      label: 'Estacionamiento',
      title: 'Parking Privado Gratis',
      description:
        'Contamos con más de 500 plazas de estacionamiento gratuitas para todos los asistentes registrados.',
    },
  ],
  locationMapImage: '/Images/Ubicacion.webp',
  locationMapUrl:
    'https://www.google.com/maps/search/?api=1&query=Salon+Hotel+Guarayo+Av.+Roca+y+Coronado+Santa+Cruz+Bolivia',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (value: unknown, fallback: string, maxLength = 2000) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim().slice(0, maxLength) : fallback;

const readStringArray = (
  value: unknown,
  fallback: string[],
  maxItems: number,
  maxLength = 120,
) => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);

  return cleaned.length > 0 ? cleaned : fallback;
};

export const normalizeLandingContent = (payload: unknown): LandingContent => {
  const base = deepClone(landingDefaultContent);

  if (!isRecord(payload)) {
    return base;
  }

  const modelCardsInput = Array.isArray(payload.modelCards) ? payload.modelCards : [];
  const teamMembersInput =
    isRecord(payload.featuredSpeakersGroup) && Array.isArray(payload.featuredSpeakersGroup.members)
      ? payload.featuredSpeakersGroup.members
      : [];
  const scheduleItemsInput = Array.isArray(payload.scheduleItems) ? payload.scheduleItems : [];
  const locationCardsInput = Array.isArray(payload.locationCards) ? payload.locationCards : [];

  return {
    ...base,
    heroDate: readText(payload.heroDate, base.heroDate, 220),
    heroTitle: readText(payload.heroTitle, base.heroTitle, 260),
    modelCards: base.modelCards.map((current, index) => {
      const source = isRecord(modelCardsInput[index]) ? modelCardsInput[index] : null;
      return {
        ...current,
        name: readText(source?.name, current.name, 160),
        category: readText(source?.category, current.category, 120),
        scale: readText(source?.scale, current.scale, 60),
        image: readText(source?.image, current.image, 2000),
      };
    }),
    eventsCopy: {
      ...base.eventsCopy,
      title: readText(isRecord(payload.eventsCopy) ? payload.eventsCopy.title : undefined, base.eventsCopy.title, 220),
      subtitle: readText(
        isRecord(payload.eventsCopy) ? payload.eventsCopy.subtitle : undefined,
        base.eventsCopy.subtitle,
        600,
      ),
      descriptionOne: readText(
        isRecord(payload.eventsCopy) ? payload.eventsCopy.descriptionOne : undefined,
        base.eventsCopy.descriptionOne,
        4000,
      ),
      descriptionTwo: readText(
        isRecord(payload.eventsCopy) ? payload.eventsCopy.descriptionTwo : undefined,
        base.eventsCopy.descriptionTwo,
        3000,
      ),
      image: readText(
        isRecord(payload.eventsCopy) ? payload.eventsCopy.image : undefined,
        base.eventsCopy.image,
        2000,
      ),
    },
    featuredSpeakersGroup: {
      ...base.featuredSpeakersGroup,
      image: readText(
        isRecord(payload.featuredSpeakersGroup) ? payload.featuredSpeakersGroup.image : undefined,
        base.featuredSpeakersGroup.image,
        2000,
      ),
      members: base.featuredSpeakersGroup.members.map((current, index) => {
        const source = isRecord(teamMembersInput[index]) ? teamMembersInput[index] : null;
        return {
          ...current,
          name: readText(source?.name, current.name, 140),
          role: readText(source?.role, current.role, 500),
        };
      }),
    },
    scheduleItems: base.scheduleItems.map((current, index) => {
      const source = isRecord(scheduleItemsInput[index]) ? scheduleItemsInput[index] : null;
      return {
        ...current,
        time: readText(source?.time, current.time, 120),
        title: readText(source?.title, current.title, 160),
        description: readText(source?.description, current.description, 1200),
        isActive:
          typeof source?.isActive === 'boolean' ? source.isActive : current.isActive,
      };
    }),
    sponsors: {
      main: readStringArray(
        isRecord(payload.sponsors) ? payload.sponsors.main : undefined,
        base.sponsors.main,
        20,
        120,
      ),
      secondary: readStringArray(
        isRecord(payload.sponsors) ? payload.sponsors.secondary : undefined,
        base.sponsors.secondary,
        20,
        120,
      ),
    },
    locationCards: base.locationCards.map((current, index) => {
      const source = isRecord(locationCardsInput[index]) ? locationCardsInput[index] : null;
      return {
        ...current,
        label: readText(source?.label, current.label, 120),
        title: readText(source?.title, current.title, 160),
        description: readText(source?.description, current.description, 600),
      };
    }),
    locationMapImage: readText(payload.locationMapImage, base.locationMapImage, 2000),
    locationMapUrl: readText(payload.locationMapUrl, base.locationMapUrl, 2000),
  };
};
