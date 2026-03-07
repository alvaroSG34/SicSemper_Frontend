import type {
  ParticipantEnrollment,
  ParticipantModel,
  ParticipantModelFile,
  ParticipantScale,
} from "@/domain/participant/participant.types";

const idCounters: Record<string, number> = {
  scale: 10,
  enrollment: 20,
  model: 30,
  file: 40,
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
    nombreModelo: "F-16 Falcon Block 50",
    marca: "Tamiya",
    descripcion: "Version inicial con mejoras en cabina y panelado.",
    codigo: "F16-001",
    status: "ENVIADA",
    createdAt: "2026-02-10T09:00:00.000Z",
    updatedAt: "2026-02-10T09:00:00.000Z",
    eventName: "Copa Nacional de Modelismo 2026",
    categoryName: "Aviones",
    subcategoryName: "Monoplaza",
    escalaValue: "1:72",
    files: [
      {
        id: "file-1",
        modelId: "model-1",
        publicUrl: "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?auto=format&fit=crop&w=640&q=80",
        order: 1,
        fileName: "f16-frontal.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 420000,
        createdAt: "2026-02-10T09:00:00.000Z",
        updatedAt: "2026-02-10T09:00:00.000Z",
      },
    ],
  },
];

export const createParticipantScaleId = () => nextId("scale");
export const createParticipantEnrollmentId = () => nextId("enrollment");
export const createParticipantModelId = () => nextId("model");
export const createParticipantFileId = () => nextId("file");

const cloneScale = (item: ParticipantScale): ParticipantScale => ({ ...item });
const cloneEnrollment = (item: ParticipantEnrollment): ParticipantEnrollment => ({ ...item });
const cloneFile = (file: ParticipantModelFile): ParticipantModelFile => ({ ...file });
const cloneModel = (model: ParticipantModel): ParticipantModel => ({
  ...model,
  files: model.files.map(cloneFile),
});

export const getClonedParticipantScales = () => mockParticipantScales.map(cloneScale);
export const getClonedParticipantEnrollments = () => mockParticipantEnrollments.map(cloneEnrollment);
export const getClonedParticipantModels = () => mockParticipantModels.map(cloneModel);

export const toParticipantFileFromUpload = (
  modelId: string,
  file: { name: string; type: string; size: number },
  order: number,
): ParticipantModelFile => {
  const now = nowIso();
  return {
    id: createParticipantFileId(),
    modelId,
    publicUrl: `mock://uploads/${modelId}/${order + 1}-${encodeURIComponent(file.name)}`,
    order: order + 1,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    createdAt: now,
    updatedAt: now,
  };
};

