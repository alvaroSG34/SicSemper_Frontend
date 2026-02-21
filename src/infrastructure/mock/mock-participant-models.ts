import type {
  ParticipantEnrollment,
  ParticipantModel,
  ParticipantModelImage,
  ParticipantScale,
} from "@/domain/participant/participant.types";

const idCounters: Record<string, number> = {
  scale: 10,
  enrollment: 20,
  model: 30,
  image: 40,
};

const nextId = (prefix: keyof typeof idCounters): string => {
  idCounters[prefix] += 1;
  return `${prefix}-${idCounters[prefix]}`;
};

const nowIso = () => new Date().toISOString();

export const mockParticipantScales: ParticipantScale[] = [
  {
    id: "scale-1",
    value: "1:144",
    createdAt: "2026-01-02T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",
  },
  {
    id: "scale-2",
    value: "1:72",
    createdAt: "2026-01-02T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",
  },
  {
    id: "scale-3",
    value: "1:48",
    createdAt: "2026-01-02T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",
  },
  {
    id: "scale-4",
    value: "1:35",
    createdAt: "2026-01-02T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",
  },
];

export const mockParticipantEnrollments: ParticipantEnrollment[] = [
  {
    id: "enrollment-1",
    userId: "u-1",
    eventId: "ev-1",
    categoryId: "cat-1",
    status: "ACTIVA",
    registrationDate: "2026-02-01",
    registrationCode: "INSC-AV-001",
    createdAt: "2026-02-01T14:00:00.000Z",
    updatedAt: "2026-02-01T14:00:00.000Z",
  },
  {
    id: "enrollment-2",
    userId: "u-1",
    eventId: "ev-1",
    categoryId: "cat-2",
    status: "ACTIVA",
    registrationDate: "2026-02-02",
    registrationCode: "INSC-TQ-001",
    createdAt: "2026-02-02T14:00:00.000Z",
    updatedAt: "2026-02-02T14:00:00.000Z",
  },
  {
    id: "enrollment-3",
    userId: "u-1",
    eventId: "ev-2",
    categoryId: "cat-3",
    status: "ACTIVA",
    registrationDate: "2026-02-03",
    registrationCode: "INSC-BC-001",
    createdAt: "2026-02-03T14:00:00.000Z",
    updatedAt: "2026-02-03T14:00:00.000Z",
  },
];

export const mockParticipantModels: ParticipantModel[] = [
  {
    id: "model-1",
    userId: "u-1",
    eventId: "ev-1",
    categoryId: "cat-1",
    subcategoryId: "sub-1",
    escalaId: "scale-2",
    usuarioEventoCategoriaId: "enrollment-1",
    nombre: "F-16 Falcon",
    modelo: "Block 50",
    marca: "Tamiya",
    descripcion: "Version inicial con mejoras en cabina y panelado.",
    codigo: "F16-001",
    status: "ENVIADA",
    createdAt: "2026-02-10T09:00:00.000Z",
    updatedAt: "2026-02-10T09:00:00.000Z",
    eventName: "Hackathon Global 2024",
    categoryName: "Aviones",
    subcategoryName: "Monoplaza",
    escalaValue: "1:72",
    images: [
      {
        id: "image-1",
        modelId: "model-1",
        imageUrl: "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?auto=format&fit=crop&w=640&q=80",
        order: 1,
        createdAt: "2026-02-10T09:00:00.000Z",
        updatedAt: "2026-02-10T09:00:00.000Z",
      },
    ],
  },
];

export const createParticipantScaleId = () => nextId("scale");
export const createParticipantEnrollmentId = () => nextId("enrollment");
export const createParticipantModelId = () => nextId("model");
export const createParticipantImageId = () => nextId("image");

const cloneScale = (item: ParticipantScale): ParticipantScale => ({ ...item });
const cloneEnrollment = (item: ParticipantEnrollment): ParticipantEnrollment => ({ ...item });
const cloneImage = (image: ParticipantModelImage): ParticipantModelImage => ({ ...image });
const cloneModel = (model: ParticipantModel): ParticipantModel => ({
  ...model,
  images: model.images.map(cloneImage),
});

export const getClonedParticipantScales = () => mockParticipantScales.map(cloneScale);
export const getClonedParticipantEnrollments = () => mockParticipantEnrollments.map(cloneEnrollment);
export const getClonedParticipantModels = () => mockParticipantModels.map(cloneModel);

export const toParticipantImageFromUpload = (
  modelId: string,
  image: { name: string },
  order: number,
): ParticipantModelImage => {
  const now = nowIso();
  return {
    id: createParticipantImageId(),
    modelId,
    imageUrl: `mock://uploads/${modelId}/${order + 1}-${encodeURIComponent(image.name)}`,
    order: order + 1,
    createdAt: now,
    updatedAt: now,
  };
};

