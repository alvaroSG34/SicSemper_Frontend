import type { AdminService } from '@/application/admin/admin.service.types';
import type { LandingAsset, LandingContent, LandingDraftState } from '@/domain/landing/landing.types';
import { apiRequest } from '@/infrastructure/api/http-client';
import { toErrorMessage } from './admin-service.shared';

export const adminLandingService: Pick<
  AdminService,
  | 'getLandingDraftState'
  | 'updateLandingDraft'
  | 'publishLandingDraft'
  | 'listLandingAssets'
  | 'uploadLandingAsset'
> = {
  async getLandingDraftState() {
    try {
      return await apiRequest<LandingDraftState>('/landing/content/draft');
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudo cargar el borrador de la landing.'));
    }
  },
  async updateLandingDraft(payload: LandingContent) {
    try {
      return await apiRequest<LandingDraftState>('/landing/content/draft', {
        method: 'PATCH',
        body: payload,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudo guardar el borrador de la landing.'));
    }
  },
  async publishLandingDraft() {
    try {
      return await apiRequest<LandingDraftState>('/landing/content/publish', {
        method: 'POST',
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudo publicar la landing.'));
    }
  },
  async listLandingAssets() {
    try {
      return await apiRequest<LandingAsset[]>('/landing/assets');
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudo listar la biblioteca de imagenes.'));
    }
  },
  async uploadLandingAsset(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      return await apiRequest<LandingAsset>('/landing/assets', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, 'No se pudo subir el asset de la landing.'));
    }
  },
};
