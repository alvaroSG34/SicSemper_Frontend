import type { ScaleDeleteImpact } from '@/domain/admin/admin.types';
import type { AdminService } from '@/application/admin/admin.service.types';
import type { ApiDeleteResponse } from '@/application/admin/contracts/admin-clubs.contract';
import { apiRequest } from '@/infrastructure/api/http-client';
import { toErrorMessage } from './admin-service.shared';

type BackendScale = {
  id: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

type BackendScaleDeleteImpact = ScaleDeleteImpact;

export const adminScalesService: Pick<
  AdminService,
  | 'listScales'
  | 'createScale'
  | 'updateScale'
  | 'getScaleDeleteImpact'
  | 'removeScale'
> = {
  async listScales() {
    try {
      return await apiRequest<BackendScale[]>('/admin/scales');
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudieron cargar las escalas.'));
    }
  },

  async createScale(payload) {
    try {
      return await apiRequest<BackendScale>('/admin/scales', {
        method: 'POST',
        body: payload,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudo crear la escala.'));
    }
  },

  async updateScale(payload) {
    try {
      return await apiRequest<BackendScale>(`/admin/scales/${payload.id}`, {
        method: 'PUT',
        body: {
          value: payload.value,
        },
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudo actualizar la escala.'));
    }
  },

  async getScaleDeleteImpact(scaleId) {
    try {
      return await apiRequest<BackendScaleDeleteImpact>(`/admin/scales/${scaleId}/delete-impact`);
    } catch (error) {
      throw new Error(
        toErrorMessage(
          error,
          'No se pudo calcular el impacto de eliminacion de la escala.',
        ),
      );
    }
  },

  async removeScale(scaleId) {
    try {
      await apiRequest<ApiDeleteResponse>(`/admin/scales/${scaleId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudo eliminar la escala.'));
    }
  },
};

